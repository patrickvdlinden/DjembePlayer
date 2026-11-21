/** One musical beat is the beat counted by the BPM control. */
export const TICKS_PER_BEAT = 720;

export type Instrument = 'djembe' | 'kenkeni' | 'sangban' | 'dununba' | 'krin' | 'feffo' | 'rattle';
export type SoundType =
  | 'bass-open' | 'tone-open' | 'slap-open'
  | 'doun-open' | 'doun-closed' | 'doun-bell'
  | 'krin-low' | 'krin-high' | 'krin-side' | 'rattle';

export interface NotationSound {
  tick: number;
  type: SoundType;
  /** Flams retain their short, tempo-independent separation in seconds. */
  delaySeconds: number;
}

/** Source glyphs tied to musical time, including rests and measure boundaries. */
export interface NotationPosition {
  tick: number;
  offset: number;
  measureIndex: number;
  kind: 'pulse' | 'barline';
}

export interface Notation {
  name: string;
  raw: string;
  instrument: Instrument;
  subdivisions: 3 | 4;
  beatsPerMeasure: number;
  measureCount: number;
  durationTicks: number;
  repeating: boolean;
  sounds: NotationSound[];
  positions: NotationPosition[];
}

export interface Track {
  id: string;
  name: string;
  instrument: Instrument;
  sampleSet?: 'solo' | 'accompany';
  color: string;
  volume: number;
  pan: number;
}

export interface SongSection {
  id: string;
  name: string;
  /** Total number of performances of this section, including the first. */
  times: number;
  parts: { trackId: string; notation: Notation }[];
}

export interface Song {
  id: string;
  name: string;
  description: string;
  bpm: number;
  beatsPerMeasure: number;
  tracks: Track[];
  sections: SongSection[];
}

export interface PlaybackEvent extends NotationSound {
  trackId: string;
}

export interface SectionOccurrence {
  sectionId: string;
  name: string;
  startTick: number;
  endTick: number;
  iteration: number;
  times: number;
}

export interface Arrangement {
  events: PlaybackEvent[];
  sections: SectionOccurrence[];
  durationTicks: number;
}
