import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayerEngine } from '../PlayerEngine';
import { djagbe } from '../../songs/djagbe';

const audio = vi.hoisted(() => ({
  events: [] as { at: string; callback: (time: number) => void }[],
  starts: [] as number[],
  sampleUrls: [] as string[],
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
      decodeAudioData = async (bytes: ArrayBuffer) => ({ sampleUrl: new TextDecoder().decode(bytes) } as unknown as AudioBuffer);
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
      constructor(options: { url: AudioBuffer }) {
        super();
        audio.sampleUrls.push((options.url as unknown as { sampleUrl: string }).sampleUrl);
      }
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
    audio.sampleUrls = [];
    audio.transportStarts = 0;
    audio.offsets = [];
    audio.disposals = 0;
    audio.mixes = [];
    audio.onTransportStop = undefined;
    audio.gainRamps = [];
    audio.cleanups = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: true,
      arrayBuffer: async () => new TextEncoder().encode(url).buffer })));
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

  it('loads the ballet sound set and schedules the same musical strikes', async () => {
    engine.dispose();
    engine = new PlayerEngine({ ...djagbe, tracks: djagbe.tracks.map(track =>
      track.instrument === 'djembe' ? { ...track, sampleSet: 'ballet' } : track) }, vi.fn());
    await engine.play();
    expect(engine.state).toBe('playing');
    for (const stroke of ['Bass', 'Tone', 'Slap']) {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent(`Ballet Djembe ${stroke}.wav`)), expect.anything());
    }
    expect(audio.events).toHaveLength(1154);
    audio.events.filter(event => event.at === '0i').forEach(event => event.callback(42));
    expect(audio.starts).toEqual([42, 42.05]);
  });

  it('selects a sound before Play without loading audio or losing the chosen section', async () => {
    await engine.jumpToSection('variation-3');
    const position = engine.tick;
    expect(await engine.setSoundSet('djembe-1', 'ballet')).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
    expect(engine.getSoundSet('djembe-1')).toBe('ballet');
    expect(engine.tick).toBe(position);
    await engine.play();
    expect(audio.offsets).toEqual([`${position}i`]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('Ballet%20Djembe%20Bass.wav'), expect.anything());
  });

  it('changes subsequent strikes live without restarting or changing volume, pan, or mute', async () => {
    await engine.play();
    engine.setMix('djembe-1', { volume: .27, pan: .8, muted: true });
    const mix = { volume: { value: audio.mixes[0]!.volume.value }, pan: { value: .8 }, mute: true };
    const events = audio.events;
    const strike = events[0]!;
    strike.callback(42);
    expect(audio.sampleUrls.at(-1)).toContain('0102%20Djembe%20toon.wav');
    expect(await engine.setSoundSet('djembe-1', 'ballet')).toBe(true);
    strike.callback(43);
    expect(audio.sampleUrls.at(-1)).toContain('Ballet%20Djembe%20Tone.wav');
    expect(audio.events).toBe(events);
    expect(audio.transportStarts).toBe(1);
    expect(audio.mixes[0]).toMatchObject(mix);
    expect(audio.mixes).toHaveLength(4);
    expect(engine.state).toBe('playing');
  });

  it('keeps both djembe channels independent', async () => {
    engine.dispose();
    engine = new PlayerEngine({ ...djagbe, tracks: [...djagbe.tracks,
      { ...djagbe.tracks[0]!, id: 'djembe-2', name: 'Djembe 2', sampleSet: 'accompany' }] }, vi.fn());
    await engine.play();
    await engine.setSoundSet('djembe-2', 'ballet');
    expect(engine.getSoundSet('djembe-1')).toBe('solo');
    expect(engine.getSoundSet('djembe-2')).toBe('ballet');
    audio.events[0]!.callback(42);
    expect(audio.sampleUrls.at(-1)).toContain('0102%20Djembe%20toon.wav');
    await engine.setSoundSet('djembe-1', 'accompany');
    expect(engine.getSoundSet('djembe-2')).toBe('ballet');
    audio.events[0]!.callback(43);
    expect(audio.sampleUrls.at(-1)).toContain('Djembe%20Tone.mp3');
  });

  it.each([false, true])('keeps the latest selection when an older load finishes late (failure: %s)', async failed => {
    await engine.play();
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const ballet = url.includes('Ballet');
      if (ballet) await pending;
      return { ok: !(ballet && failed), status: 404, arrayBuffer: async () => new TextEncoder().encode(url).buffer };
    }));
    const older = engine.setSoundSet('djembe-1', 'ballet');
    expect(await engine.setSoundSet('djembe-1', 'accompany')).toBe(true);
    release();
    expect(await older).toBe(false);
    expect(engine.getSoundSet('djembe-1')).toBe('accompany');
    audio.events[0]!.callback(42);
    expect(audio.sampleUrls.at(-1)).toContain('Djembe%20Tone.mp3');
    expect(audio.transportStarts).toBe(1);
  });

  it('keeps the previous set playing when a replacement cannot load', async () => {
    await engine.play();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));
    await expect(engine.setSoundSet('djembe-1', 'ballet')).rejects.toThrow('404');
    expect(engine.getSoundSet('djembe-1')).toBe('solo');
    expect(engine.state).toBe('playing');
    audio.events[0]!.callback(42);
    expect(audio.sampleUrls.at(-1)).toContain('0102%20Djembe%20toon.wav');
    expect(audio.transportStarts).toBe(1);
  });

  it('does not overwrite a mixer selection when the initial song load finishes later', async () => {
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (/010[123]/.test(url)) await pending;
      return { ok: true, arrayBuffer: async () => new TextEncoder().encode(url).buffer };
    }));
    const playing = engine.play();
    expect(engine.state).toBe('loading');
    await engine.setSoundSet('djembe-1', 'ballet');
    release();
    await playing;
    expect(engine.state).toBe('playing');
    audio.events[0]!.callback(42);
    expect(audio.sampleUrls.at(-1)).toContain('Ballet%20Djembe%20Tone.wav');
  });

  it('does not restart playback when a sound finishes loading after Stop', async () => {
    await engine.play();
    const oldStrike = audio.events[0]!;
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      await pending;
      return { ok: true, arrayBuffer: async () => new TextEncoder().encode(url).buffer };
    }));
    const changing = engine.setSoundSet('djembe-1', 'ballet');
    engine.stop();
    release();
    expect(await changing).toBe(true);
    expect(engine.state).toBe('stopped');
    oldStrike.callback(42);
    expect(audio.starts).toHaveLength(0);
    expect(audio.transportStarts).toBe(1);
    await engine.play();
    audio.events[0]!.callback(43);
    expect(audio.sampleUrls.at(-1)).toContain('Ballet%20Djembe%20Tone.wav');
  });

  it('ignores pending sound changes after the engine is disposed', async () => {
    await engine.play();
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      await pending;
      return { ok: true, arrayBuffer: async () => new TextEncoder().encode(url).buffer };
    }));
    const changing = engine.setSoundSet('djembe-1', 'ballet');
    engine.dispose();
    release();
    expect(await changing).toBe(false);
    expect(engine.getSoundSet('djembe-1')).toBe('solo');
    expect(audio.transportStarts).toBe(1);
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
