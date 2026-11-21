import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayerEngine } from '../PlayerEngine';
import { djagbe } from '../../songs/djagbe';

const audio = vi.hoisted(() => ({
  events: [] as { at: string; callback: (time: number) => void }[],
  starts: [] as number[],
  transportStarts: 0,
  disposals: 0,
  mixes: [] as { volume: { value: number }; pan: { value: number }; mute: boolean }[],
}));

vi.mock('tone', () => {
  class Node {
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
        start: () => { audio.transportStarts++; },
        stop: vi.fn(),
        cancel: () => { audio.events = []; },
      };
      draw = { schedule: (callback: () => void) => callback(), cancel: vi.fn() };
      resume = async () => {};
      decodeAudioData = async () => ({} as AudioBuffer);
      now = () => 10;
      immediate = () => 10;
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
    audio.disposals = 0;
    audio.mixes = [];
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

  it('retains volume when pan is changed immediately afterwards', async () => {
    await engine.play();
    engine.setMix('djembe-1', { volume: 0.35 });
    engine.setMix('djembe-1', { pan: -0.5 });
    expect(audio.mixes[0]?.volume.value).toBeCloseTo(20 * Math.log10(0.35));
    expect(audio.mixes[0]?.pan.value).toBe(-0.5);
  });
});
