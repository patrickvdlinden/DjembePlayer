import type { DjembeSoundSet, SoundType, Track } from '../core/model';

type SampleMap = Partial<Record<SoundType, string>>;
export const djembeSoundSets: { id: DjembeSoundSet; name: string }[] = [
  { id: 'solo', name: 'Solo djembe' },
  { id: 'accompany', name: 'Accompaniment djembe' },
  { id: 'ballet', name: 'Ballet djembe' },
];
const djembeSamples: Record<DjembeSoundSet, SampleMap> = {
  solo: { 'bass-open': '0101 Djembe bas.wav', 'tone-open': '0102 Djembe toon.wav', 'slap-open': '0103 Djembe slap.wav' },
  accompany: { 'bass-open': 'Djembe Bass.mp3', 'tone-open': 'Djembe Tone.mp3', 'slap-open': 'Djembe Slap.mp3' },
  ballet: { 'bass-open': 'Ballet Djembe Bass.wav', 'tone-open': 'Ballet Djembe Tone.wav', 'slap-open': 'Ballet Djembe Slap.wav' },
};
const instrumentSamples: Record<string, SampleMap> = {
  kenkeni: { 'doun-open': 'Kenkeni.wav', 'doun-closed': '0203 Kenkeni Trommel dicht.wav', 'doun-bell': '0207 Kenkeni Bel.wav' },
  sangban: { 'doun-open': 'Sangban.wav', 'doun-closed': 'Sangban Mute.wav', 'doun-bell': '0307 Sangban bel.wav' },
  dununba: { 'doun-open': 'Dununba.wav', 'doun-closed': '0403 Dununba Trommel dicht.wav', 'doun-bell': '0407 Dununba bel.wav' },
  krin: { 'krin-low': '0501 Krin laag.wav', 'krin-high': '0502 Krin hoog.wav', 'krin-side': '0503 Krin zijkant.wav' },
};

export function samplesFor(track: Track): SampleMap {
  if (track.instrument === 'djembe') {
    return djembeSamples[track.sampleSet ?? 'solo'];
  }
  const samples = instrumentSamples[track.instrument];
  if (!samples) throw new Error(`No audio samples are available for ${track.instrument}.`);
  return samples;
}

export function sampleUrl(filename: string): string {
  return `${import.meta.env.BASE_URL}assets/audio/${encodeURIComponent(filename)}`;
}
