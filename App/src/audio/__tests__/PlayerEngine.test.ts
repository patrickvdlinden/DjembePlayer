import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayerEngine } from '../PlayerEngine';
import { djagbe } from '../../songs/djagbe';

const audio = vi.hoisted(() => ({
  events: [] as { at: string; callback: (time: number) => void }[],
  starts: [] as number[],
  transportStarts: 0,
  offsets: [] as (string | number)[],
  disposals: 0,
  mixes: [] as { volume: { value: number }; pan: { value: number }; mute: boolean }[],
  onTransportStop: undefined as (() => void) | undefined,
  gainRamps: [] as { value: number; time: number }[],
  cleanups: [] as { callback: () => void; delay: number }[],
}));

vi.mock('tone', () => {
  class Node {
    blockTime = 128 / 44100;
    volume = { value: 0 };
    pan = { value: 0 };
    mute = false;
    connect() { return this; }
    dispose() { audio.disposals++; }
  }
  return {
    Context: class {
      destination = {};
      transport = {
        PPQ: 0, ticks: 0, timeSignature: 4, bpm: { value: 100 }, loop: false, loopEnd: '',
        getTicksAtTime: () => 0,
        schedule: (callback: (time: number) => void, at: string) => { audio.events.push({ at, callback }); },
        scheduleRepeat: vi.fn(),
        start: (_time: number, offset: string | number) => { audio.transportStarts++; audio.offsets.push(offset); },
        stop: () => { audio.onTransportStop?.(); },
        cancel: () => { audio.events = []; },
      };
      draw = { schedule: (callback: () => void) => callback(), cancel: vi.fn() };
      resume = async () => {};
      decodeAudioData = async () => ({} as AudioBuffer);
      now = () => 10;
      immediate = () => 10;
      setTimeout = (callback: () => void, delay: number) => { audio.cleanups.push({ callback, delay }); return 0; };
      dispose = vi.fn();
      close = async () => {};
    },
    Channel: class extends Node {
      constructor(options: { volume: number; pan?: number; mute?: boolean }) {
        super();
        this.volume.value = options.volume;
        this.pan.value = options.pan ?? 0;
        this.mute = options.mute ?? false;
        audio.mixes.push(this);
      }
    },
    Limiter: Node,
    Gain: class extends Node {
      gain = {
        cancelAndHoldAtTime: vi.fn(),
        linearRampToValueAtTime: (value: number, time: number) => { audio.gainRamps.push({ value, time }); },
        setValueAtTime: vi.fn(),
      };
    },
    ToneBufferSource: class extends Node {
      start(time: number) { audio.starts.push(time); }
    },
    gainToDb: (gain: number) => 20 * Math.log10(gain),
  };
});

describe('audio scheduling lifecycle', () => {
  let engine: PlayerEngine;
  beforeEach(() => {
    audio.events = [];
    audio.starts = [];
    audio.transportStarts = 0;
    audio.offsets = [];
    audio.disposals = 0;
    audio.mixes = [];
    audio.onTransportStop = undefined;
    audio.gainRamps = [];
    audio.cleanups = [];
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) })));
    engine = new PlayerEngine(djagbe, vi.fn());
  });
  afterEach(() => { engine.dispose(); vi.unstubAllGlobals(); });

  it('passes the audio clock timestamp and flam offset to the sources', async () => {
    await engine.play();
    expect(engine.state).toBe('playing');
    expect(audio.events).toHaveLength(1154); // Musical strikes plus the song end.
    audio.events.filter(event => event.at === '0i').forEach(event => event.callback(42));
    expect(audio.starts).toEqual([42, 42.05]);
  });

  it('does not start when stopped while samples are still loading', async () => {
    let release!: (response: unknown) => void;
    const pending = new Promise(resolve => { release = resolve; });
    vi.stubGlobal('fetch', vi.fn(() => pending));
    const playing = engine.play();
    expect(engine.state).toBe('loading');
    engine.stop();
    release({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) });
    await playing;
    expect(engine.state).toBe('stopped');
    expect(audio.transportStarts).toBe(0);
  });

  it('cancels delayed strikes from an earlier playback after Stop', async () => {
    await engine.play();
    const scheduled = audio.events[0]!;
    scheduled.callback(42);
    expect(audio.starts).toHaveLength(1);
    engine.stop();
    audio.cleanups.forEach(cleanup => cleanup.callback());
    expect(audio.disposals).toBeGreaterThan(0);
    scheduled.callback(43);
    expect(audio.starts).toHaveLength(1);
  });

  it('reports failed sample loads and permits a retry', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));
    await engine.play();
    expect(engine.state).toBe('error');
    expect(engine.error).toContain('404');
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) })));
    await engine.play();
    expect(engine.state).toBe('playing');
  });

  it('marks the end and allows replay from the beginning', async () => {
    await engine.play();
    audio.events.at(-1)!.callback(100);
    expect(engine.state).toBe('finished');
    expect(engine.tick).toBe(172 * 720);
    await engine.play();
    expect(engine.state).toBe('playing');
    expect(audio.transportStarts).toBe(2);
  });

  it('invalidates opening callbacks before resetting the transport at the ending', async () => {
    await engine.play();
    const opening = audio.events.filter(event => event.at === '0i');
    const ending = audio.events.at(-1)!;
    // Real Tone.js may revisit tick zero within the current scheduler batch
    // when Stop resets its tick counter. This is the reported final burst.
    audio.onTransportStop = () => opening.forEach(event => event.callback(100));
    ending.callback(100);
    expect(audio.starts).toEqual([]);
    expect(engine.state).toBe('finished');
    expect(audio.events).toEqual([]);
  });

  it('fades queued and active voices before disposing them on Stop', async () => {
    await engine.play();
    audio.events[0]!.callback(10.04);
    engine.stop();
    expect(audio.gainRamps.at(-1)).toEqual({ value: 0, time: 10.005 });
    expect(audio.disposals).toBe(0);
    expect(audio.cleanups[0]?.delay).toBeCloseTo(0.005 + 128 / 44100);
    audio.cleanups.forEach(cleanup => cleanup.callback());
    expect(audio.disposals).toBeGreaterThan(0);
  });

  it('retains volume when pan is changed immediately afterwards', async () => {
    await engine.play();
    engine.setMix('djembe-1', { volume: 0.35 });
    engine.setMix('djembe-1', { pan: -0.5 });
    expect(audio.mixes[0]?.volume.value).toBeCloseTo(20 * Math.log10(0.35));
    expect(audio.mixes[0]?.pan.value).toBe(-0.5);
  });

  it('selects the first pass of a section while stopped and starts Play there', async () => {
    const start = engine.arrangement.sections.find(section => section.sectionId === 'base-4')!.startTick;
    await engine.jumpToSection('base-4');
    expect(engine.state).toBe('stopped');
    expect(engine.tick).toBe(start);
    expect(fetch).not.toHaveBeenCalled();
    await engine.play();
    expect(audio.offsets).toEqual([`${start}i`]);
    // The UI stays at the selected section until its audio-clock start time.
    expect(engine.tick).toBe(start);
  });

  it('continues from a new section and invalidates queued strikes before resetting the clock', async () => {
    await engine.play();
    const oldStrike = audio.events[0]!;
    oldStrike.callback(10);
    audio.onTransportStop = () => oldStrike.callback(11);
    const start = engine.arrangement.sections.find(section => section.sectionId === 'variation-6')!.startTick;
    await engine.jumpToSection('variation-6');
    expect(engine.state).toBe('playing');
    expect(engine.tick).toBe(start);
    expect(audio.offsets.at(-1)).toBe(`${start}i`);
    expect(audio.starts).toEqual([10]);
    expect(audio.gainRamps.at(-1)?.value).toBe(0);
    audio.cleanups.forEach(cleanup => cleanup.callback());
    expect(audio.disposals).toBeGreaterThan(0);
  });

  it('uses only the latest section when jumped repeatedly during sample loading', async () => {
    let release!: (response: unknown) => void;
    const pending = new Promise(resolve => { release = resolve; });
    vi.stubGlobal('fetch', vi.fn(() => pending));
    const initial = engine.play();
    const firstJump = engine.jumpToSection('base-2');
    const lastJump = engine.jumpToSection('variation-7');
    const start = engine.arrangement.sections.find(section => section.sectionId === 'variation-7')!.startTick;
    expect(engine.state).toBe('loading');
    expect(engine.tick).toBe(start);
    release({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) });
    await Promise.all([initial, firstJump, lastJump]);
    expect(engine.state).toBe('playing');
    expect(audio.offsets).toEqual([`${start}i`]);
  });

  it('resets a selected section to the beginning on Stop', async () => {
    await engine.jumpToSection('ending');
    engine.stop();
    expect(engine.tick).toBe(0);
    await engine.play();
    expect(audio.offsets).toEqual(['0i']);
  });

  it('can select a section after the song finishes', async () => {
    await engine.play();
    audio.events.at(-1)!.callback(100);
    await engine.jumpToSection('closing-call');
    const start = engine.arrangement.sections.find(section => section.sectionId === 'closing-call')!.startTick;
    expect(engine.state).toBe('stopped');
    expect(engine.tick).toBe(start);
    await engine.play();
    expect(audio.offsets.at(-1)).toBe(`${start}i`);
  });
});
