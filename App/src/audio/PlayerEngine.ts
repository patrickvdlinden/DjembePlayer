import * as Tone from 'tone';
import { compileArrangement } from '../core/arrangement';
import { TICKS_PER_BEAT } from '../core/model';
import type { Arrangement, Song, Track } from '../core/model';
import { sampleUrl, samplesFor } from './samples';

export type PlayerState = 'stopped' | 'loading' | 'playing' | 'finished' | 'error';
export interface TrackMix { volume: number; pan: number; muted: boolean }

/** Owns its AudioContext and transport; React never triggers individual hits. */
export class PlayerEngine {
  readonly arrangement: Arrangement;
  private context?: Tone.Context;
  private master?: Tone.Limiter;
  private channels = new Map<string, Tone.Channel>();
  private buffers = new Map<string, Promise<AudioBuffer>>();
  private samples = new Map<string, AudioBuffer>();
  private sources = new Set<Tone.ToneBufferSource>();
  private abort = new AbortController();
  private generation = 0;
  private disposed = false;
  private bpm: number;
  private looping = false;
  private metronome = false;
  private mixes = new Map<string, TrackMix>();
  state: PlayerState = 'stopped';
  error = '';

  constructor(readonly song: Song, private readonly onChange: () => void) {
    this.arrangement = compileArrangement(song);
    this.bpm = song.bpm;
    song.tracks.forEach(track => this.mixes.set(track.id, { volume: track.volume, pan: track.pan, muted: false }));
  }

  get tick(): number {
    if (this.state === 'finished') return this.arrangement.durationTicks;
    return this.state === 'playing' && this.context
      ? Math.max(0, this.context.transport.getTicksAtTime(this.context.immediate())) : 0;
  }

  private initialize(): Tone.Context {
    if (this.disposed) throw new Error('This player has been disposed.');
    if (!this.context) {
      this.context = new Tone.Context({ latencyHint: 'playback', lookAhead: 0.12 });
      this.context.transport.PPQ = TICKS_PER_BEAT;
      this.context.transport.timeSignature = this.song.beatsPerMeasure;
      this.master = new Tone.Limiter({ context: this.context, threshold: -1 }).connect(this.context.destination);
      this.song.tracks.forEach(track => this.createChannel(track));
      this.channels.set('metronome', new Tone.Channel({ context: this.context, volume: -16 }).connect(this.master));
    }
    return this.context;
  }

  private createChannel(track: Track) {
    const mix = this.mixes.get(track.id)!;
    this.channels.set(track.id, new Tone.Channel({ context: this.context!,
      volume: Tone.gainToDb(mix.volume), pan: mix.pan, mute: mix.muted }).connect(this.master!));
  }

  private load(filename: string): Promise<AudioBuffer> {
    const existing = this.buffers.get(filename);
    if (existing) return existing;
    const promise = fetch(sampleUrl(filename), { signal: this.abort.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Could not load ${filename} (${response.status}).`);
        return response.arrayBuffer();
      })
      .then(bytes => this.context!.decodeAudioData(bytes))
      .catch((error: unknown) => { this.buffers.delete(filename); throw error; });
    this.buffers.set(filename, promise);
    return promise;
  }

  async play(): Promise<void> {
    if (this.state === 'loading' || this.state === 'playing' || this.disposed) return;
    const generation = ++this.generation;
    this.state = 'loading';
    this.error = '';
    this.onChange();
    try {
      const context = this.initialize();
      // Resume within the user's click, before fetching audio.
      const resume = context.resume();
      const loading = this.song.tracks.flatMap(track =>
        Object.entries(samplesFor(track)).map(async ([type, filename]) => {
          this.samples.set(`${track.id}:${type}`, await this.load(filename));
        }));
      loading.push(this.load('1001 Metronome.wav').then(buffer => { this.samples.set('metronome', buffer); }));
      await Promise.all([resume, ...loading]);
      if (generation !== this.generation || this.disposed) return;
      const transport = context.transport;
      transport.stop();
      transport.cancel(0);
      transport.bpm.value = this.bpm;
      transport.loop = this.looping;
      transport.loopEnd = `${this.arrangement.durationTicks}i`;
      this.arrangement.events.forEach(event => {
        const buffer = this.samples.get(`${event.trackId}:${event.type}`);
        if (!buffer) throw new Error(`Missing sample for ${event.trackId}: ${event.type}.`);
        transport.schedule(time => {
          if (generation === this.generation) this.hit(buffer, event.trackId, time + event.delaySeconds);
        }, `${event.tick}i`);
      });
      transport.scheduleRepeat(time => {
        if (this.metronome && generation === this.generation) this.hit(this.samples.get('metronome')!, 'metronome', time);
      }, `${TICKS_PER_BEAT}i`, 0);
      transport.schedule(time => {
        if (transport.loop || generation !== this.generation) return;
        transport.stop(time);
        context.draw.schedule(() => {
          if (generation !== this.generation) return;
          this.state = 'finished';
          this.onChange();
        }, time);
      }, `${this.arrangement.durationTicks}i`);
      this.state = 'playing';
      transport.start(context.now() + 0.05, 0);
      this.onChange();
    } catch (error) {
      if (generation !== this.generation || this.disposed) return;
      this.stop();
      this.state = 'error';
      this.error = error instanceof Error ? error.message : 'Audio playback failed.';
      this.onChange();
    }
  }

  private hit(buffer: AudioBuffer, trackId: string, time: number) {
    // One source per strike allows repeated samples and flam tails to overlap.
    const source = new Tone.ToneBufferSource({ context: this.context!, url: buffer,
      onended: () => { this.sources.delete(source); source.dispose(); },
    }).connect(this.channels.get(trackId)!);
    this.sources.add(source);
    source.start(time);
  }

  setBpm(bpm: number) {
    if (!Number.isFinite(bpm) || bpm < 30 || bpm > 240) throw new Error('BPM must be between 30 and 240.');
    this.bpm = bpm;
    if (this.context) this.context.transport.bpm.value = bpm;
  }
  setLoop(loop: boolean) { this.looping = loop; if (this.context) this.context.transport.loop = loop; }
  setMetronome(enabled: boolean) { this.metronome = enabled; }
  setMix(trackId: string, change: Partial<TrackMix>) {
    const previous = this.mixes.get(trackId);
    if (!previous) throw new Error(`Unknown track: ${trackId}`);
    const mix = { ...previous, ...change };
    this.mixes.set(trackId, mix);
    const channel = this.channels.get(trackId);
    if (channel) {
      channel.volume.value = Tone.gainToDb(mix.volume);
      channel.pan.value = mix.pan;
      channel.mute = mix.muted;
    }
  }

  stop() {
    this.generation++;
    if (this.context) {
      this.context.transport.stop(this.context.immediate());
      this.context.transport.cancel(0);
      this.context.draw.cancel(0);
    }
    this.sources.forEach(source => source.dispose());
    this.sources.clear();
    this.state = 'stopped';
    this.onChange();
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.abort.abort();
    this.channels.forEach(channel => channel.dispose());
    this.channels.clear();
    this.master?.dispose();
    this.context?.dispose();
  }
}
