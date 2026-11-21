import type { Instrument, Song } from '../core/model';
import { TICKS_PER_BEAT } from '../core/model';
import { parseNotation } from '../core/parser';

export const editableInstruments = ['djembe', 'kenkeni', 'sangban', 'dununba', 'krin'] as const;
export type EditableInstrument = typeof editableInstruments[number];
export interface Timing { subdivisions: 3 | 4; beatsPerMeasure: number }
export interface DraftPart { raw: string; mode: 'builder' | 'manual' }
export interface DraftChannel {
  id: string; name: string; instrument: EditableInstrument; sampleSet: 'solo' | 'accompany';
  volume: number; pan: number; muted: boolean;
}
export interface DraftSection { id: string; name: string; times: number; parts: Record<string, DraftPart> }
export interface SongDraft extends Timing {
  id: string; name: string; bpm: number; channels: DraftChannel[]; sections: DraftSection[];
}
export interface Step { stroke: '.' | 'B' | 'O' | 'X'; bell: boolean; flam: boolean }
export const emptyStep = (): Step => ({ stroke: '.', bell: false, flam: false });
const id = () => crypto.randomUUID();
export const instrumentName = (instrument: Instrument) => instrument[0]!.toUpperCase() + instrument.slice(1);
const colors = ['#dc7700', '#b44d24', '#b18c20', '#8d583a', '#63341d'];

export const stepNotation = (step: Step) => `${step.bell ? 'v' : ''}${step.flam && step.stroke !== '.'
  ? { B: 'n', O: 'i', X: 'z' }[step.stroke] : ''}${step.stroke}`;

export function writeSteps(steps: Step[], timing: Timing): string {
  const perMeasure = timing.beatsPerMeasure * timing.subdivisions;
  if (!steps.length || steps.length % perMeasure) throw new Error('Use complete measures in button mode.');
  let raw = 'm';
  for (let measure = 0; measure < steps.length; measure += perMeasure) {
    for (let beat = 0; beat < perMeasure; beat += timing.subdivisions) {
      raw += steps.slice(measure + beat, measure + beat + timing.subdivisions).map(stepNotation).join('1') + ' ';
    }
    raw += 'm';
  }
  return raw;
}

export function restNotation(timing: Timing): string {
  return writeSteps(Array.from({ length: timing.beatsPerMeasure * timing.subdivisions }, emptyStep), timing);
}

/** Refuse conversions that would discard symbols or alter the played strokes. */
export function readSteps(raw: string, instrument: EditableInstrument, timing: Timing): Step[] {
  if (/[^mBOXv.1niz \r\n]/.test(raw)) {
    throw new Error('This pattern uses custom symbols or fractional spacing. Keep editing it in custom mode.');
  }
  const notation = parseNotation(raw, { ...timing, instrument });
  const steps = Array.from({ length: notation.measureCount * timing.beatsPerMeasure * timing.subdivisions }, emptyStep);
  for (const position of notation.positions.filter(point => point.kind === 'pulse')) {
    const index = position.tick / (TICKS_PER_BEAT / timing.subdivisions);
    if (!Number.isInteger(index) || !steps[index]) throw new Error('Button mode needs evenly spaced pulses within each beat.');
    const step = steps[index]!;
    const glyph = raw[position.offset]!;
    if (glyph === 'v') step.bell = true;
    else if (glyph !== '.') {
      step.stroke = glyph as Step['stroke'];
      const prefix = raw[position.offset - 1];
      if (prefix && 'niz'.includes(prefix)) {
        if ({ B: 'n', O: 'i', X: 'z' }[step.stroke as 'B' | 'O' | 'X'] !== prefix) {
          throw new Error('Mixed-stroke flams stay editable in custom mode.');
        }
        step.flam = true;
      }
    }
  }
  if (steps.some(step => step.bell && !['kenkeni', 'sangban', 'dununba'].includes(instrument)
    || step.flam && instrument !== 'djembe'
    || step.stroke === 'B' && ['kenkeni', 'sangban', 'dununba'].includes(instrument))) {
    throw new Error('Some symbols cannot be edited with this instrument’s buttons. Use custom mode to keep them.');
  }
  const rebuilt = parseNotation(writeSteps(steps, timing), { ...timing, instrument });
  const sounds = (value: typeof notation) => value.sounds.map(sound => JSON.stringify(sound)).sort().join('\n');
  if (rebuilt.durationTicks !== notation.durationTicks || sounds(rebuilt) !== sounds(notation)) {
    throw new Error('This pattern cannot be represented exactly by the buttons. Your custom notation is kept.');
  }
  return steps;
}

export function newSection(draft: Pick<SongDraft, 'channels' | 'subdivisions' | 'beatsPerMeasure'>, name: string): DraftSection {
  return { id: id(), name, times: 1, parts: Object.fromEntries(draft.channels.map(channel =>
    [channel.id, { mode: 'builder', raw: restNotation(draft) }])) };
}

export function createDraft(): SongDraft {
  const draft: SongDraft = {
    id: `custom-${id()}`, name: 'Untitled song', bpm: 100, subdivisions: 4, beatsPerMeasure: 4,
    channels: [{ id: id(), name: 'Djembe 1', instrument: 'djembe', sampleSet: 'solo', volume: 0.65, pan: 0, muted: false }], sections: [],
  };
  draft.sections = [newSection(draft, 'Section 1')];
  return draft;
}

export function addChannel(draft: SongDraft): SongDraft {
  const channel: DraftChannel = { id: id(), name: `Channel ${draft.channels.length + 1}`, instrument: 'djembe',
    sampleSet: 'accompany', volume: 0.65, pan: 0, muted: false };
  return { ...draft, channels: [...draft.channels, channel], sections: draft.sections.map(section => ({
    ...section, parts: { ...section.parts, [channel.id]: { mode: 'builder', raw: restNotation(draft) } },
  })) };
}

export function removeChannel(draft: SongDraft, channelId: string): SongDraft {
  if (draft.channels.length === 1) throw new Error('Keep at least one channel.');
  return { ...draft, channels: draft.channels.filter(channel => channel.id !== channelId),
    sections: draft.sections.map(section => {
      const parts = { ...section.parts };
      delete parts[channelId];
      return { ...section, parts };
    }) };
}

export function duplicateSection(draft: SongDraft, sectionId: string): SongDraft {
  const index = draft.sections.findIndex(section => section.id === sectionId);
  const original = draft.sections[index]!;
  const copy: DraftSection = { ...original, id: id(), name: `${original.name} copy`,
    parts: Object.fromEntries(Object.entries(original.parts).map(([key, part]) => [key, { ...part }])) };
  return { ...draft, sections: [...draft.sections.slice(0, index + 1), copy, ...draft.sections.slice(index + 1)] };
}

export function moveSection(draft: SongDraft, sectionId: string, direction: -1 | 1): SongDraft {
  const sections = [...draft.sections];
  const index = sections.findIndex(section => section.id === sectionId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= sections.length) return draft;
  [sections[index], sections[target]] = [sections[target]!, sections[index]!];
  return { ...draft, sections };
}

/** Change the grid timing only when existing strokes can be preserved. */
export function changeTiming(draft: SongDraft, timing: Timing): SongDraft {
  const sections = draft.sections.map(section => ({ ...section, parts: Object.fromEntries(draft.channels.map(channel => {
    const part = section.parts[channel.id]!;
    let old: Step[];
    try { old = readSteps(part.raw, channel.instrument, draft); }
    catch { throw new Error(`Choose timing before entering complex custom notation (${section.name}, ${channel.name}).`); }
    const measures = old.length / (draft.beatsPerMeasure * draft.subdivisions);
    const next = Array.from({ length: measures * timing.beatsPerMeasure * timing.subdivisions }, emptyStep);
    old.forEach((step, index) => {
      const pulse = index % draft.subdivisions;
      const beat = Math.floor(index / draft.subdivisions) % draft.beatsPerMeasure;
      const measure = Math.floor(index / (draft.beatsPerMeasure * draft.subdivisions));
      if (pulse >= timing.subdivisions || beat >= timing.beatsPerMeasure) {
        if (step.stroke !== '.' || step.bell) throw new Error(`That timing would remove notes from ${section.name}, ${channel.name}. Clear those steps first.`);
      } else next[(measure * timing.beatsPerMeasure + beat) * timing.subdivisions + pulse] = { ...step };
    });
    return [channel.id, { ...part, raw: writeSteps(next, timing) }];
  })) }));
  return { ...draft, ...timing, sections };
}

export function compileDraft(draft: SongDraft, options: { sectionId?: string; requireSound?: boolean } = {}): Song {
  const selected = options.sectionId ? draft.sections.filter(section => section.id === options.sectionId) : draft.sections;
  if (!selected.length) throw new Error('Add a section to your song.');
  if (!draft.channels.length) throw new Error('Add an instrument channel.');
  const song: Song = {
    id: draft.id, name: draft.name.trim() || 'Untitled song', bpm: draft.bpm, beatsPerMeasure: draft.beatsPerMeasure,
    description: options.sectionId ? `Practicing ${selected[0]!.name}.` : 'Your arrangement. Build a fragment or bring the whole band together.',
    tracks: draft.channels.map((channel, index) => ({ ...channel, name: channel.name.trim() || `Channel ${index + 1}`,
      color: colors[index % colors.length]!, })),
    sections: selected.map(section => ({ id: section.id, name: section.name.trim() || 'Untitled section', times: section.times,
      parts: draft.channels.map(channel => {
        try {
          const notation = parseNotation(section.parts[channel.id]!.raw, { ...draft, instrument: channel.instrument,
            name: section.name.trim() || 'Your pattern' });
          return { trackId: channel.id, notation };
        } catch (error) {
          throw new Error(`${section.name} · ${channel.name}: ${error instanceof Error ? error.message : 'Invalid notation.'}`);
        }
      }),
    })),
  };
  if (options.requireSound && !song.sections.some(section => section.parts.some(part => part.notation.sounds.length))) {
    throw new Error('Add at least one playable stroke before pressing Play.');
  }
  return song;
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const numberIn = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const integerIn = (value: unknown, min: number, max: number) => numberIn(value, min, max) && Number.isInteger(value);

/** Validate stored editing data without converting other formats. */
export function readDrafts(json: string): SongDraft[] {
  const drafts: unknown = JSON.parse(json);
  if (!Array.isArray(drafts) || !drafts.every(value => {
    if (!record(value) || typeof value.id !== 'string' || !value.id.startsWith('custom-') || typeof value.name !== 'string'
      || !numberIn(value.bpm, 30, 240) || ![3, 4].includes(value.subdivisions as number) || !integerIn(value.beatsPerMeasure, 1, 12)
      || !Array.isArray(value.channels) || !value.channels.length || !Array.isArray(value.sections) || !value.sections.length) return false;
    const channels = value.channels;
    if (!channels.every(channel => record(channel) && typeof channel.id === 'string' && typeof channel.name === 'string'
      && editableInstruments.includes(channel.instrument as EditableInstrument) && ['solo', 'accompany'].includes(channel.sampleSet as string)
      && numberIn(channel.volume, 0, 1) && numberIn(channel.pan, -1, 1) && typeof channel.muted === 'boolean')) return false;
    if (new Set(channels.map(channel => channel.id)).size !== channels.length) return false;
    if (!value.sections.every(section => record(section) && typeof section.id === 'string' && typeof section.name === 'string'
      && integerIn(section.times, 1, 64) && record(section.parts) && Object.keys(section.parts).length === channels.length
      && channels.every(channel => {
        const part = (section.parts as Record<string, unknown>)[channel.id];
        return record(part) && typeof part.raw === 'string' && ['builder', 'manual'].includes(part.mode as string);
      }))) return false;
    return new Set(value.sections.map(section => section.id)).size === value.sections.length;
  }) || new Set(drafts.map(draft => draft.id)).size !== drafts.length) throw new Error('The saved song library could not be read.');
  return drafts as SongDraft[];
}
