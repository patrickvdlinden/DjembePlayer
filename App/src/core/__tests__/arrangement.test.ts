import { describe, expect, it } from 'vitest';
import { compileArrangement } from '../arrangement';
import { TICKS_PER_BEAT } from '../model';
import { parseNotation } from '../parser';
import { djagbe } from '../../songs/djagbe';

describe('Djagbé arrangement', () => {
  it('matches the complete C# song duration, repetitions, and strike count', () => {
    const result = compileArrangement(djagbe);
    expect(djagbe.sections).toHaveLength(23);
    expect(result.sections).toHaveLength(33);
    expect(result.durationTicks).toBe(172 * TICKS_PER_BEAT);
    expect(result.events).toHaveLength(1153);
    expect(result.sections[0]?.name).toBe('Opening call');
    expect(result.sections.at(-1)?.name).toBe('Ending');
    expect(result.events.filter(event => event.delaySeconds > 0)).toHaveLength(3);
    expect(result.events.every(event => Number.isInteger(event.tick) && event.tick < result.durationTicks)).toBe(true);
  });

  it('cycles the shorter sangban part through a two-measure variation', () => {
    const result = compileArrangement(djagbe);
    const variation = result.sections.find(section => section.sectionId === 'variation-1')!;
    const notes = result.events.filter(event => event.trackId === 'sangban-1'
      && event.tick >= variation.startTick && event.tick < variation.endTick);
    const middle = variation.startTick + 4 * TICKS_PER_BEAT;
    expect(notes.filter(event => event.tick < middle).map(event => event.tick - variation.startTick))
      .toEqual(notes.filter(event => event.tick >= middle).map(event => event.tick - middle));
  });

  it('keeps distinct tracks even when they share an instrument', () => {
    const notation = parseNotation('mB1.1.1. .1.1.1. .1.1.1. .1.1.1. m', { subdivisions: 4 });
    const result = compileArrangement({ ...djagbe,
      tracks: ['djembe-a', 'djembe-b'].map(id => ({ ...djagbe.tracks[0]!, id })),
      sections: [{ id: 'duet', name: 'Duet', times: 1, parts: [
        { trackId: 'djembe-a', notation }, { trackId: 'djembe-b', notation },
      ] }],
    });
    expect(result.events.map(event => event.trackId)).toEqual(['djembe-a', 'djembe-b']);
  });

  it('rejects missing tracks and invalid section counts', () => {
    expect(() => compileArrangement({ ...djagbe, tracks: [] })).toThrow('Unknown track');
    expect(() => compileArrangement({ ...djagbe, sections: [{ ...djagbe.sections[0]!, times: 0 }] })).toThrow('positive integer');
  });
});
