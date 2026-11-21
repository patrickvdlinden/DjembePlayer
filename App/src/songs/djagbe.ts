import { parseNotation } from '../core/parser';
import type { Instrument, Song, SongSection } from '../core/model';

// Transcribed from Assets/Songs/Djagbe.cs. These are the original font strings.
const pattern = (name: string, raw: string, instrument: Instrument) =>
  parseNotation(raw, { name, instrument, subdivisions: 4 });

const call = pattern('Call', 'miO1.1O1O .1O1.1O O1.1O1. O1.1.1. m', 'djembe');
const djembeEnd = pattern('Ending', 'miO1.1.1. .1.1.1. .1.1.1. .1.1.1. m', 'djembe');
const sangbanStart = pattern('Sangban entry', 'm.1.1.1. .1.1.1. .1.1.1. .1.1vX1. m', 'sangban');
const sangban = pattern('Sangban base', 'm>vX1.1v.1vO .1vO1.1v. vO1.1vO1. v.1.1vX1. <m', 'sangban');
const sangbanEnd = pattern('Sangban ending', 'mvO1.1.1. .1.1.1. .1.1.1. .1.1.1. m', 'sangban');
const dununba = pattern('Dununba base', 'm>v1.1vO1vO .1v.1v.1. .v1.1vO1. v.1.1v.1. <m', 'dununba');
const variation = pattern('Dununba variation', 'mv1.1vO1vO .1v.1v.1. .v1.1vO1. v.1vO1.1v. mvO1.1v1vO .1v.1v.1. .v1.1vO1. v.1.1v.1. m', 'dununba');
const dununbaEnd = pattern('Dununba ending', 'mvO1.1.1. .1.1.1. .1.1.1. .1.1.1. m', 'dununba');

const sections: SongSection[] = [
  { id: 'opening', name: 'Opening call', times: 1,
    parts: [{ trackId: 'djembe-1', notation: call }, { trackId: 'sangban-1', notation: sangbanStart }] },
];
for (let cycle = 1; cycle <= 10; cycle++) {
  sections.push(
    { id: `base-${cycle}`, name: `Base · ${cycle}`, times: 2,
      parts: [{ trackId: 'dununba-1', notation: dununba }, { trackId: 'sangban-1', notation: sangban }] },
    { id: `variation-${cycle}`, name: `Variation · ${cycle}`, times: 1,
      parts: [{ trackId: 'dununba-1', notation: variation }, { trackId: 'sangban-1', notation: sangban }] },
  );
}
sections.push(
  { id: 'closing-call', name: 'Closing call', times: 1,
    parts: [{ trackId: 'djembe-1', notation: call }, { trackId: 'dununba-1', notation: dununba }, { trackId: 'sangban-1', notation: sangban }] },
  { id: 'ending', name: 'Ending', times: 1,
    parts: [{ trackId: 'djembe-1', notation: djembeEnd }, { trackId: 'dununba-1', notation: dununbaEnd }, { trackId: 'sangban-1', notation: sangbanEnd }] },
);

export const djagbe: Song = {
  id: 'djagbe', name: 'Djagbé', bpm: 100, beatsPerMeasure: 4,
  description: 'A conversation between sangban and dununba, framed by the djembe call.',
  tracks: [
    { id: 'djembe-1', name: 'Djembe', instrument: 'djembe', sampleSet: 'solo', color: '#e2ad6e', volume: 0.65, pan: 0 },
    { id: 'sangban-1', name: 'Sangban', instrument: 'sangban', color: '#97b8a0', volume: 0.65, pan: -0.3 },
    { id: 'dununba-1', name: 'Dununba', instrument: 'dununba', color: '#9aaed3', volume: 0.65, pan: 0.3 },
  ],
  sections,
};
