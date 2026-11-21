import { TICKS_PER_BEAT } from './model';
import type { Instrument, Notation, SoundType } from './model';
import { NotationError, tokenize } from './tokenizer';
import type { Token, TokenType } from './tokenizer';

interface ParseOptions {
  name?: string;
  instrument?: Instrument;
  subdivisions?: 3 | 4;
  beatsPerMeasure?: number;
}

// Six units per pulse represent halves and two-thirds exactly.
const spacing: Partial<Record<TokenType, number>> = {
  connection: 6, half: 3, 'double-half': 3,
  'two-thirds': 4, 'double-two-thirds': 4,
};
const ornamentTokens = new Set<TokenType>([
  'left', 'right', 'left-right', 'right-left', 'repeat-start', 'repeat-end',
  'starting-point', 'triplet-signature',
]);
const noteFamily: Partial<Record<TokenType, 'bass' | 'tone' | 'slap'>> = {
  bass: 'bass', 'bass-small': 'bass', 'bass-flam': 'bass',
  tone: 'tone', 'tone-small': 'tone', 'tone-flam': 'tone',
  slap: 'slap', 'slap-small': 'slap', 'slap-flam': 'slap',
};

function soundFor(instrument: Instrument, family: 'bass' | 'tone' | 'slap' | 'bell'): SoundType | undefined {
  if (instrument === 'djembe') {
    return { bass: 'bass-open', tone: 'tone-open', slap: 'slap-open', bell: undefined }[family] as SoundType | undefined;
  }
  if (instrument === 'krin') {
    return { bass: 'krin-low', tone: 'krin-high', slap: 'krin-side', bell: undefined }[family] as SoundType | undefined;
  }
  if (instrument === 'rattle') return family === 'tone' ? 'rattle' : undefined;
  if (['kenkeni', 'sangban', 'dununba'].includes(instrument)) {
    return { bass: undefined, tone: 'doun-open', slap: 'doun-closed', bell: 'doun-bell' }[family] as SoundType | undefined;
  }
  return undefined;
}

function detectSubdivisions(tokens: Token[]): 3 | 4 {
  // Use a complete beat, skipping a possibly ornamented opening beat.
  const separators = tokens.flatMap((token, index) => token.type === 'next-beat' ? [index] : []);
  const start = separators[0];
  const end = separators[1];
  if (start !== undefined && end !== undefined) {
    const units = 6 + tokens.slice(start + 1, end).reduce((sum, token) => sum + (spacing[token.type] ?? 0), 0);
    if (units === 18) return 3;
    if (units === 24) return 4;
  }
  throw new NotationError('Cannot detect the beat subdivision. Choose 3 or 4 pulses per beat.');
}

export function parseNotation(input: string, options: ParseOptions = {}): Notation {
  if (!input.trim()) throw new NotationError('Enter some notation first.');
  const tokens = tokenize(input.trim());
  if (tokens[0]?.type !== 'measure' || tokens.at(-1)?.type !== 'measure') {
    throw new NotationError('Notation must start and end with a measure line (m).');
  }
  const subdivisions = options.subdivisions ?? detectSubdivisions(tokens);
  const beatsPerMeasure = options.beatsPerMeasure ?? 4;
  if (!Number.isInteger(beatsPerMeasure) || beatsPerMeasure < 1) throw new NotationError('Invalid beats per measure.');
  const instrument = options.instrument ?? 'djembe';
  const beatUnits = subdivisions * 6;
  const ticksPerUnit = TICKS_PER_BEAT / beatUnits;
  const measureTicks = beatsPerMeasure * TICKS_PER_BEAT;
  const notation: Notation = {
    name: options.name ?? 'Custom pattern', raw: input, instrument, subdivisions, beatsPerMeasure,
    measureCount: 0, durationTicks: 0,
    repeating: tokens[1]?.type === 'repeat-start' && tokens.at(-2)?.type === 'repeat-end',
    sounds: [],
  };
  let measure = -1;
  let beat = 0;
  let pulseUnits = 0;
  let flam: 'bass' | 'tone' | 'slap' | undefined;
  let flamPosition: number | undefined;

  const addSound = (family: 'bass' | 'tone' | 'slap' | 'bell', token: Token, delaySeconds = 0) => {
    if (measure < 0 || beat >= beatsPerMeasure || pulseUnits >= beatUnits) {
      throw new NotationError('Note lies outside the measure. Check beat spacing and subdivisions.', token.position);
    }
    const type = soundFor(instrument, family);
    if (type) notation.sounds.push({
      tick: measure * measureTicks + beat * TICKS_PER_BEAT + pulseUnits * ticksPerUnit,
      type, delaySeconds,
    });
  };

  for (const [index, token] of tokens.entries()) {
    if (token.type === 'measure') {
      if (flam) throw new NotationError('A flam must be followed by a note.', flamPosition);
      beat = 0;
      pulseUnits = 0;
      const next = tokens[index + 1];
      if (next && next.type !== 'newline' && next.type !== 'measure') {
        measure++;
        notation.measureCount++;
      }
    } else if (token.type === 'next-beat' || token.type === 'newline') {
      if (flam) throw new NotationError('A flam must be followed by a note.', flamPosition);
      if (token.type === 'next-beat') beat++;
      else beat = 0;
      pulseUnits = 0;
    } else if (token.type === 'next-beat-half' || token.type === 'next-beat-two-thirds') {
      const units = token.type === 'next-beat-half' ? 3 : 4;
      if (pulseUnits % units === 0) { beat++; pulseUnits = 0; }
      else pulseUnits += units;
    } else if (spacing[token.type] !== undefined) {
      pulseUnits += spacing[token.type]!;
    } else if (token.type === 'bell') {
      addSound('bell', token);
    } else if (noteFamily[token.type]) {
      const family = noteFamily[token.type]!;
      if (token.type.endsWith('-flam')) {
        if (flam) throw new NotationError('A flam must be followed by a note.', token.position);
        flam = family;
        flamPosition = token.position;
      } else {
        if (flam) addSound(flam, token);
        addSound(family, token, flam ? 0.05 : 0);
        flam = undefined;
      }
    } else if (token.type !== 'pulse' && !ornamentTokens.has(token.type)) {
      throw new NotationError('Unsupported notation token.', token.position);
    }
  }
  if (!notation.measureCount) throw new NotationError('Notation must contain at least one measure.');
  notation.durationTicks = notation.measureCount * measureTicks;
  notation.sounds.sort((a, b) => a.tick - b.tick || a.delaySeconds - b.delaySeconds);
  return notation;
}
