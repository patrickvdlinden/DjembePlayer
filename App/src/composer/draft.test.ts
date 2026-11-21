import { describe, expect, it } from 'vitest';
import { compileArrangement } from '../core/arrangement';
import { TICKS_PER_BEAT } from '../core/model';
import { parseNotation } from '../core/parser';
import { addChannel, changeTiming, compileDraft, createDraft, duplicateSection, emptyStep, moveSection,
  newSection, readDrafts, readSteps, removeChannel, restNotation, writeSteps } from './draft';

const withBass = () => {
  const draft = createDraft();
  const channel = draft.channels[0]!;
  const steps = readSteps(draft.sections[0]!.parts[channel.id]!.raw, channel.instrument, draft);
  steps[0] = { stroke: 'B', bell: false, flam: false };
  draft.sections[0]!.parts[channel.id]!.raw = writeSteps(steps, draft);
  return draft;
};

describe('custom song drafts', () => {
  it('compiles a one-beat fragment, including simultaneous drum and bell strokes', () => {
    const draft = changeTiming(createDraft(), { beatsPerMeasure: 1, subdivisions: 3 });
    const channel = draft.channels[0]!;
    channel.instrument = 'kenkeni';
    draft.sections[0]!.parts[channel.id]!.raw = writeSteps([
      { stroke: 'O', bell: true, flam: false }, emptyStep(), { stroke: 'X', bell: false, flam: false },
    ], draft);
    const arrangement = compileArrangement(compileDraft(draft, { requireSound: true }));
    expect(arrangement.durationTicks).toBe(TICKS_PER_BEAT);
    expect(arrangement.events.map(event => [event.tick, event.type])).toEqual([
      [0, 'doun-bell'], [0, 'doun-open'], [480, 'doun-closed'],
    ]);
  });

  it('keeps duplicate instrument channels distinct, with independent recordings', () => {
    const draft = addChannel(withBass());
    const second = draft.channels[1]!;
    draft.sections[0]!.parts[second.id]!.raw = draft.sections[0]!.parts[draft.channels[0]!.id]!.raw;
    const song = compileDraft(draft);
    expect(song.tracks.map(track => track.sampleSet)).toEqual(['solo', 'accompany']);
    expect(compileArrangement(song).events.map(event => event.trackId)).toEqual(draft.channels.map(channel => channel.id));
  });

  it('reorders repeated sections and previews only the requested fragment', () => {
    let draft = withBass();
    const second = newSection(draft, 'Ending');
    second.times = 3;
    second.parts[draft.channels[0]!.id]!.raw = draft.sections[0]!.parts[draft.channels[0]!.id]!.raw.replace('B', 'X');
    draft = { ...draft, sections: [...draft.sections, second] };
    draft = moveSection(draft, second.id, -1);
    const full = compileArrangement(compileDraft(draft));
    expect(full.sections.map(section => section.name)).toEqual(['Ending', 'Ending', 'Ending', 'Section 1']);
    expect(full.events.map(event => event.type)).toEqual(['slap-open', 'slap-open', 'slap-open', 'bass-open']);
    const fragment = compileArrangement(compileDraft(draft, { sectionId: second.id }));
    expect(fragment.durationTicks).toBe(12 * TICKS_PER_BEAT);
    expect(fragment.events).toHaveLength(3);
  });

  it('cycles a shorter channel through a longer pattern and preserves section repetitions', () => {
    const draft = addChannel(withBass());
    const first = draft.channels[0]!.id;
    const second = draft.channels[1]!.id;
    const short = draft.sections[0]!.parts[first]!.raw;
    draft.sections[0]!.parts[first]!.raw = short + short.slice(1);
    draft.sections[0]!.parts[second]!.raw = short;
    draft.sections[0]!.times = 2;
    const result = compileArrangement(compileDraft(draft));
    expect(result.durationTicks).toBe(16 * TICKS_PER_BEAT);
    expect(result.events.filter(event => event.trackId === second).map(event => event.tick))
      .toEqual([0, 2880, 5760, 8640]);
  });

  it('duplicates patterns independently and removes a channel from every section', () => {
    let draft = addChannel(withBass());
    draft = duplicateSection(draft, draft.sections[0]!.id);
    const channel = draft.channels[0]!.id;
    draft.sections[1]!.parts[channel]!.raw = restNotation(draft);
    expect(draft.sections[0]!.parts[channel]!.raw).toContain('B');
    expect(draft.sections[1]!.id).not.toBe(draft.sections[0]!.id);
    draft = removeChannel(draft, channel);
    expect(draft.sections.every(section => !section.parts[channel])).toBe(true);
    expect(() => removeChannel(draft, draft.channels[0]!.id)).toThrow('at least one');
  });

  it('preserves regular-pulse notation, bells, and flams when switching editor representations', () => {
    const timing = { subdivisions: 4 as const, beatsPerMeasure: 4 };
    const raw = 'mzX1.1O1. .1.1.1. .1B1.1. .1.1.1. m';
    const steps = readSteps(raw, 'djembe', timing);
    expect(steps[0]?.flam).toBe(true);
    expect(parseNotation(writeSteps(steps, timing), timing).sounds).toEqual(parseNotation(raw, timing).sounds);
    expect(parseNotation(writeSteps(steps, timing), timing).sounds[1]?.delaySeconds).toBe(0.05);
    const bells = 'mvO1.1v1. vX1.1v1. v.1.1v1. .1.1.1. m';
    expect(parseNotation(writeSteps(readSteps(bells, 'dununba', timing), timing), { ...timing, instrument: 'dununba' }).sounds)
      .toEqual(parseNotation(bells, { ...timing, instrument: 'dununba' }).sounds);
  });

  it('refuses lossy conversions of fractional, hand-marked, repeated, or mixed-flam notation', () => {
    const timing = { subdivisions: 4 as const, beatsPerMeasure: 4 };
    for (const raw of ['mO-O-O .1.1.1. .1.1.1. .1.1.1. m', 'mOr1.1.1. .1.1.1. .1.1.1. .1.1.1. m',
      'm>B1.1.1. .1.1.1. .1.1.1. .1.1.1. <m', 'miX1.1.1. .1.1.1. .1.1.1. .1.1.1. m']) {
      expect(() => readSteps(raw, 'djembe', timing)).toThrow();
      expect(() => parseNotation(raw, timing)).not.toThrow();
    }
  });

  it('rejects a timing change that would drop notes, and preserves strokes when expanding', () => {
    const draft = withBass();
    const channel = draft.channels[0]!.id;
    const steps = readSteps(draft.sections[0]!.parts[channel]!.raw, 'djembe', draft);
    steps[3] = { stroke: 'O', bell: false, flam: false };
    draft.sections[0]!.parts[channel]!.raw = writeSteps(steps, draft);
    const before = JSON.stringify(draft);
    expect(() => changeTiming(draft, { subdivisions: 3, beatsPerMeasure: 4 })).toThrow('remove notes');
    expect(JSON.stringify(draft)).toBe(before);
    const expanded = changeTiming(draft, { subdivisions: 4, beatsPerMeasure: 6 });
    expect(compileArrangement(compileDraft(expanded)).events.map(event => event.type)).toEqual(['bass-open', 'tone-open']);
  });

  it('reports the section and channel responsible for invalid notation', () => {
    const draft = createDraft();
    draft.sections[0]!.parts[draft.channels[0]!.id]!.raw = 'm?m';
    expect(() => compileDraft(draft)).toThrow('Section 1 · Djembe 1:');
    expect(() => compileDraft(createDraft(), { requireSound: true })).toThrow('playable stroke');
  });

  it('round-trips unfinished drafts and rejects malformed saved libraries', () => {
    const draft = withBass();
    draft.sections[0]!.parts[draft.channels[0]!.id]!.raw = 'unfinished';
    expect(readDrafts(JSON.stringify([draft]))).toEqual([draft]);
    expect(() => readDrafts('{bad')).toThrow();
    expect(() => readDrafts(JSON.stringify([{ ...draft, channels: [] }]))).toThrow();
    expect(() => readDrafts(JSON.stringify([{ ...draft, sections: [{ ...draft.sections[0], parts: {} }] }]))).toThrow();
    expect(() => readDrafts(JSON.stringify([draft, draft]))).toThrow();
  });
});
