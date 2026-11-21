import * as Tone from 'tone';
import { PlayerEngine } from '../src/audio/PlayerEngine';
import type { Song } from '../src/core/model';
import { parseNotation } from '../src/core/parser';

// Run this Vite-only page in a real browser. Only sample I/O is replaced with a
// deterministic sine buffer; routing, transport, sources, and stops are real.
interface Probe {
  initialize(): Tone.Context;
  output: Tone.Gain;
  load(filename: string): Promise<AudioBuffer>;
  hit(buffer: AudioBuffer, trackId: string, time: number): void;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const results = document.querySelector<HTMLPreElement>('#results')!;
const button = document.querySelector<HTMLButtonElement>('#run')!;
const reports: { test: string; passed: boolean; details: unknown }[] = [];

function song(pan = 0, times = 1, instrument: 'djembe' | 'dununba' = 'djembe'): Song {
  return {
    id: 'regression', name: 'Audio regression', description: '', bpm: 240, beatsPerMeasure: 4,
    tracks: [{ id: 'test', name: 'Test', instrument, color: '#fff', volume: 0.4, pan }],
    sections: [{ id: 'test', name: 'Test', times, parts: [{ trackId: 'test',
      notation: parseNotation(instrument === 'dununba'
        ? 'mvO1.1.1. vO1.1.1. vO1.1.1. vO1.1.1. m'
        : 'mB1O1X1. B1O1X1. B1O1X1. B1O1X1. m', { subdivisions: 4, instrument }),
    }] }],
  };
}

async function setup(definition: Song, bufferSeconds = 0.1, actualSamples = false) {
  const engine = new PlayerEngine(definition, () => {});
  const probe = engine as unknown as Probe;
  const context = probe.initialize();
  context.destination.mute = true;
  await context.resume();
  if (!actualSamples) {
    const buffer = context.createBuffer(1, Math.round(context.sampleRate * bufferSeconds), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index++) data[index] = 0.1 * Math.sin(2 * Math.PI * 440 * index / context.sampleRate);
    probe.load = async () => buffer;
  }
  let strikes = 0;
  const hit = probe.hit.bind(engine);
  probe.hit = (...args) => { strikes++; hit(...args); };
  const analyser = new Tone.Analyser({ context, type: 'waveform', channels: 2, size: 1024 });
  probe.output.connect(analyser);
  return { engine, context, analyser, strikes: () => strikes,
    dispose: () => { analyser.dispose(); engine.dispose(); } };
}

function energy(analyser: Tone.Analyser): [number, number] {
  const channels = analyser.getValue() as Float32Array[];
  return channels.map(channel => channel.reduce((sum, value) => sum + value * value, 0) / channel.length) as [number, number];
}

async function measure(analyser: Tone.Analyser, milliseconds: number): Promise<[number, number]> {
  const sum: [number, number] = [0, 0];
  const deadline = performance.now() + milliseconds;
  while (performance.now() < deadline) {
    const value = energy(analyser);
    sum[0] += value[0]; sum[1] += value[1];
    await sleep(10);
  }
  return sum;
}

function report(test: string, passed: boolean, details: unknown) {
  reports.push({ test, passed, details });
  results.textContent = JSON.stringify(reports, null, 2);
}

async function stereo(pan: -1 | 1) {
  const test = await setup(song(pan));
  try {
    await test.engine.play();
    const [left, right] = await measure(test.analyser, 650);
    const wanted = pan === -1 ? left : right;
    const unwanted = pan === -1 ? right : left;
    report(pan === -1 ? 'Hard left is left-only' : 'Hard right is right-only',
      wanted > 1e-6 && unwanted < wanted * 1e-4,
      { leftEnergy: left, rightEnergy: right, destinationChannels: test.context.destination.channelCount });
  } finally { test.dispose(); }
}

async function ending() {
  const test = await setup(song());
  try {
    await test.engine.play();
    const deadline = performance.now() + 5000;
    while (test.engine.state === 'playing' && performance.now() < deadline) await sleep(20);
    await sleep(200);
    report('Song ending never replays opening strikes', test.engine.state === 'finished' && test.strikes() === 12,
      { state: test.engine.state, expectedStrikes: 12, actualStrikes: test.strikes() });
  } finally { test.dispose(); }
}

async function livePanning() {
  // Exercise live mixer changes with the same dununba recordings as Djagbé.
  const test = await setup(song(0, 10, 'dununba'), 1, true);
  try {
    await test.engine.play();
    test.engine.setMix('test', { pan: -1 });
    await sleep(250);
    const left = await measure(test.analyser, 300);
    test.engine.setMix('test', { pan: 1 });
    await sleep(250);
    const right = await measure(test.analyser, 300);
    report('Live pan moves original dununba samples between ears',
      left[0] > 1e-6 && left[1] < left[0] * 1e-4
      && right[1] > 1e-6 && right[0] < right[1] * 1e-4,
      { hardLeft: left, hardRight: right });
  } finally { test.dispose(); }
}

async function stopping() {
  const test = await setup(song(0, 10), 1);
  try {
    await test.engine.play();
    await sleep(420);
    const before = test.strikes();
    test.engine.stop();
    await sleep(100);
    const after = await measure(test.analyser, 200);
    report('Stop prevents new strikes and silences active tails',
      test.strikes() === before && Math.max(...after) < 1e-9,
      { before, after: test.strikes(), remainingEnergy: after });
  } finally { test.dispose(); }
}

async function sectionJump(whilePlaying: boolean) {
  const definition = song();
  definition.sections = ['opening', 'middle', 'ending'].map(id => ({ ...definition.sections[0]!, id }));
  const test = await setup(definition, 1);
  try {
    if (whilePlaying) {
      await test.engine.play();
      await sleep(350);
    }
    const before = test.strikes();
    await test.engine.jumpToSection('ending');
    const selectedTick = test.engine.tick;
    if (!whilePlaying) await test.engine.play();
    const deadline = performance.now() + 5000;
    while (test.engine.state === 'playing' && performance.now() < deadline) await sleep(20);
    await sleep(200);
    report(whilePlaying ? 'Live section jump cancels old strikes and finishes cleanly' : 'Play begins at the selected section',
      selectedTick === 8 * 720 && test.engine.state === 'finished' && test.strikes() === before + 12,
      { selectedTick, state: test.engine.state, expectedStrikes: before + 12, actualStrikes: test.strikes() });
  } finally { test.dispose(); }
}

button.addEventListener('click', async () => {
  button.disabled = true;
  reports.length = 0;
  results.textContent = 'Running…';
  try {
    await stereo(-1);
    await stereo(1);
    await livePanning();
    await ending();
    await stopping();
    await sectionJump(false);
    await sectionJump(true);
    results.textContent = `${reports.every(item => item.passed) ? 'PASS' : 'FAIL'}\n${JSON.stringify(reports, null, 2)}`;
  } catch (error) { results.textContent = `ERROR\n${error instanceof Error ? error.stack : String(error)}`; }
  finally { button.disabled = false; }
});
