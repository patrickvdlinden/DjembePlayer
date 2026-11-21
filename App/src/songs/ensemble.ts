import type { Notation, SongSection, Track } from '../core/model';

const trackIds = {
  lead: 'djembe-1',
  accompaniment: 'djembe-2',
  kenkeni: 'kenkeni-1',
  sangban: 'sangban-1',
  dununba: 'dununba-1',
} as const;

/** Named parts keep both djembe roles explicit throughout the arrangements. */
export function ensembleSection(id: string, name: string, times: number,
  parts: Partial<Record<keyof typeof trackIds, Notation>>): SongSection {
  return {
    id, name, times,
    parts: (Object.entries(parts) as [keyof typeof trackIds, Notation][])
      .map(([role, notation]) => ({ trackId: trackIds[role], notation })),
  };
}

export function ensembleTracks(): Track[] {
  return [
    { id: trackIds.lead, name: 'Djembe 1', instrument: 'djembe', sampleSet: 'solo', color: '#e2ad6e', volume: 0.65, pan: 0 },
    { id: trackIds.accompaniment, name: 'Djembe 2', instrument: 'djembe', sampleSet: 'accompany', color: '#d39483', volume: 0.65, pan: -0.3 },
    { id: trackIds.kenkeni, name: 'Kenkeni', instrument: 'kenkeni', color: '#c5bc82', volume: 0.65, pan: -0.6 },
    { id: trackIds.sangban, name: 'Sangban', instrument: 'sangban', color: '#97b8a0', volume: 0.65, pan: 0.3 },
    { id: trackIds.dununba, name: 'Dununba', instrument: 'dununba', color: '#9aaed3', volume: 0.65, pan: 0.6 },
  ];
}
