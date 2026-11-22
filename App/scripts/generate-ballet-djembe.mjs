import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// A processed variation of the project's recordings, not a newly recorded drum.
// Run explicitly with `node scripts/generate-ballet-djembe.mjs` to rebuild it.
const appRoot = fileURLToPath(new URL('../', import.meta.url));
const destination = path.join(appRoot, 'soundsets/ballet-djembe');
const sampleRate = 48000;
const settings = [
  { name: 'Bass', source: '0101 Djembe bas.wav', semitones: 1, highpass: 42, presence: 145, gain: 1.5, shelf: 0, decay: .36, length: .26, peak: .90, drive: .7 },
  { name: 'Tone', source: '0102 Djembe toon.wav', semitones: 4, highpass: 155, presence: 1000, gain: 2, shelf: 3, decay: .19, length: .20, peak: .90, drive: 2 },
  { name: 'Slap', source: '0103 Djembe slap.wav', semitones: 5, highpass: 260, presence: 2800, gain: 2.5, shelf: 4, decay: .13, length: .17, peak: .90, drive: 2 },
];

function readWave(filename) {
  const bytes = readFileSync(filename);
  let format;
  let data;
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const size = bytes.readUInt32LE(offset + 4);
    const name = bytes.toString('ascii', offset, offset + 4);
    if (name === 'fmt ') format = { encoding: bytes.readUInt16LE(offset + 8), channels: bytes.readUInt16LE(offset + 10),
      rate: bytes.readUInt32LE(offset + 12), bits: bytes.readUInt16LE(offset + 22) };
    if (name === 'data') data = bytes.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + size % 2;
  }
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE'
    || !format || format.encoding !== 1 || format.bits !== 16 || format.channels !== 1 || !data) {
    throw new Error(`Expected a mono 16-bit PCM WAV: ${filename}`);
  }
  const samples = Float64Array.from({ length: data.length / 2 }, (_, index) => data.readInt16LE(index * 2) / 32768);
  return { samples, rate: format.rate };
}

// Windowed sinc interpolation avoids the brittle high end of linear resampling.
function retune(samples, rate, semitones, targetRate = sampleRate) {
  const step = rate / targetRate * 2 ** (semitones / 12);
  const cutoff = Math.min(1, 1 / step);
  const radius = 16 / cutoff;
  return Float64Array.from({ length: Math.ceil(samples.length / step) }, (_, index) => {
    const position = index * step;
    let value = 0;
    let weight = 0;
    for (let source = Math.ceil(position - radius); source <= Math.floor(position + radius); source++) {
      const distance = position - source;
      const angle = Math.PI * distance * cutoff;
      const sinc = Math.abs(angle) < 1e-8 ? 1 : Math.sin(angle) / angle;
      const window = .5 + .5 * Math.cos(Math.PI * distance / radius);
      const coefficient = cutoff * sinc * window;
      value += (samples[source] ?? 0) * coefficient;
      weight += coefficient;
    }
    return value / weight;
  });
}

// Peak normalization alone left the short tone/slap attacks much quieter than
// the other recordings. Reduce their crest factor, with 4x oversampling and
// anti-alias filtering, then set a safe output peak rather than hard clipping.
function matchLevel(samples, peak, drive) {
  const oversampled = retune(samples, sampleRate, 0, sampleRate * 4);
  const inputPeak = Math.max(...oversampled.map(Math.abs));
  const shaped = oversampled.map(value => Math.tanh(value / inputPeak * drive) / Math.tanh(drive));
  const reduced = retune(shaped, sampleRate * 4, 0).slice(0, samples.length);
  const faded = reduced.map((value, index) => value * Math.min(1, index / 10, (reduced.length - 1 - index) / 10));
  const outputPeak = Math.max(...faded.map(Math.abs));
  return faded.map(value => value / outputPeak * peak);
}

function filter(samples, type, frequency, gain = 0) {
  const w = 2 * Math.PI * frequency / sampleRate;
  const cosine = Math.cos(w);
  const sine = Math.sin(w);
  const alpha = sine / (2 * Math.SQRT1_2);
  const amplitude = 10 ** (gain / 40);
  let a;
  let b;
  if (type === 'highpass') {
    b = [(1 + cosine) / 2, -(1 + cosine), (1 + cosine) / 2];
    a = [1 + alpha, -2 * cosine, 1 - alpha];
  } else if (type === 'peak') {
    b = [1 + alpha * amplitude, -2 * cosine, 1 - alpha * amplitude];
    a = [1 + alpha / amplitude, -2 * cosine, 1 - alpha / amplitude];
  } else {
    const beta = 2 * Math.sqrt(amplitude) * alpha;
    b = [amplitude * (amplitude + 1 + (amplitude - 1) * cosine + beta),
      -2 * amplitude * (amplitude - 1 + (amplitude + 1) * cosine),
      amplitude * (amplitude + 1 + (amplitude - 1) * cosine - beta)];
    a = [amplitude + 1 - (amplitude - 1) * cosine + beta,
      2 * (amplitude - 1 - (amplitude + 1) * cosine),
      amplitude + 1 - (amplitude - 1) * cosine - beta];
  }
  let x1 = 0; let x2 = 0; let y1 = 0; let y2 = 0;
  return samples.map(x => {
    const y = (b[0] * x + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2) / a[0];
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  });
}

function writeWave(filename, samples) {
  const bytes = Buffer.alloc(44 + samples.length * 2);
  bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(sampleRate, 24); bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34); bytes.write('data', 36);
  bytes.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((value, index) => {
    if (!Number.isFinite(value) || Math.abs(value) > 1) throw new Error(`Invalid audio level in ${filename}`);
    bytes.writeInt16LE(Math.round(value * 32767), 44 + index * 2);
  });
  writeFileSync(filename, bytes);
}

mkdirSync(destination, { recursive: true });
const rendered = [];
for (const kit of settings) {
  const source = readWave(path.join(appRoot, '../Assets/Resources/Audio', kit.source));
  const dc = source.samples.reduce((sum, value) => sum + value, 0) / source.samples.length;
  const centered = source.samples.map(value => value - dc);
  const sourcePeak = Math.max(...centered.map(Math.abs));
  const onset = Math.max(0, centered.findIndex(value => Math.abs(value) > sourcePeak * .025) - Math.round(source.rate * .001));
  let samples = retune(centered.slice(onset), source.rate, kit.semitones);
  samples = filter(samples, 'highpass', kit.highpass);
  samples = filter(samples, 'peak', kit.presence, kit.gain);
  samples = filter(samples, 'shelf', 2400, kit.shelf);
  samples = samples.slice(0, Math.round(kit.length * sampleRate));
  samples = samples.map((value, index) => {
    const seconds = index / sampleRate;
    const attack = Math.min(1, seconds / .0004);
    const release = Math.min(1, (samples.length - 1 - index) / (sampleRate * .008));
    return value * attack * .5 * (1 - Math.cos(Math.PI * release)) * Math.exp(-seconds / kit.decay);
  });
  samples = matchLevel(samples, kit.peak, kit.drive);
  writeWave(path.join(destination, `Ballet Djembe ${kit.name}.wav`), samples);
  rendered.push(samples);
  console.log(`${kit.name}: +${kit.semitones} semitones, ${(samples.length / sampleRate).toFixed(3)}s, ${kit.peak} peak`);
}

// Audition the new bass, tone, and slap, followed by a short practice pattern.
const preview = new Float64Array(sampleRate * 7);
const audition = [[0, 0], [.6, 1], [1.2, 2], [2.1, 0], [2.6, 1], [2.85, 2], [3.1, 1], [3.6, 2],
  [4.1, 0], [4.6, 1], [4.85, 2], [5.1, 1], [5.6, 2], [6.1, 0]];
for (const [time, stroke] of audition) {
  const offset = Math.round(time * sampleRate);
  rendered[stroke].forEach((value, index) => { preview[offset + index] += value * .8; });
}
mkdirSync(path.join(appRoot, '.tmp'), { recursive: true });
writeWave(path.join(appRoot, '.tmp/ballet-djembe-preview.wav'), preview);
