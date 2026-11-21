import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseNotation } from '../parser';
import { tokenize } from '../tokenizer';
import type { Instrument, NotationSound } from '../model';

// Independent golden output exported from the unchanged C# parser for every
// distinct pattern used by all four original songs. Tick values are normalized
// from the C# beat/note positions; the expected output is never computed by TS.
const fixtures = JSON.parse(readFileSync(new URL('./original-patterns.json', import.meta.url), 'utf8')) as {
  name: string; raw: string; instrument: Instrument; subdivisions: 3 | 4;
  measureCount: number; repeating: boolean; durationTicks: number; sounds: NotationSound[];
}[];

// Simultaneous strikes are unordered; PowerShell's fixture export can reorder
// equal tick/delay entries. Compare their content without imposing a voice order.
const canonical = (sounds: NotationSound[]) => [...sounds].sort((a, b) =>
  a.tick - b.tick || a.delaySeconds - b.delaySeconds || a.type.localeCompare(b.type));

describe('original SlapToonToonSlap notation', () => {
  fixtures.forEach((fixture, index) => {
    it(`matches C# output ${index + 1}: ${fixture.instrument} / ${fixture.name}`, () => {
      const result = parseNotation(fixture.raw, fixture);
      expect(result.measureCount).toBe(fixture.measureCount);
      expect(result.durationTicks).toBe(fixture.durationTicks);
      expect(result.repeating).toBe(fixture.repeating);
      expect(canonical(result.sounds)).toEqual(canonical(fixture.sounds));
    });
  });

  it('detects straight and ternary subdivisions', () => {
    expect(parseNotation('mB1O1X1. B1O1X1. B1O1X1. B1O1X1. m').subdivisions).toBe(4);
    expect(parseNotation('mB1O1X B1O1X B1O1X B1O1X m').subdivisions).toBe(3);
  });

  it('represents half and two-thirds positions with exact integer ticks', () => {
    const half = parseNotation('mO-O-O .1.1. .1.1. .1.1. m', { subdivisions: 3 });
    expect(half.sounds.map(sound => sound.tick)).toEqual([0, 120, 240]);
    const thirds = parseNotation('mO_O_O .1.1. .1.1. .1.1. m', { subdivisions: 3 });
    expect(thirds.sounds.map(sound => sound.tick)).toEqual([0, 160, 320]);
  });

  it('keeps flam separation independent of BPM', () => {
    const result = parseNotation('miX1.1.1. .1.1.1. .1.1.1. .1.1.1. m', { subdivisions: 4 });
    expect(result.sounds).toEqual([
      { tick: 0, type: 'tone-open', delaySeconds: 0 },
      { tick: 0, type: 'slap-open', delaySeconds: 0.05 },
    ]);
  });

  it('plays drum and bell together', () => {
    const result = parseNotation('mvO1.1.1. .1.1.1. .1.1.1. .1.1.1. m', { instrument: 'dununba', subdivisions: 4 });
    expect(result.sounds.map(sound => [sound.tick, sound.type])).toEqual([[0, 'doun-bell'], [0, 'doun-open']]);
  });

  it('reports unknown characters with their input positions', () => {
    expect(() => tokenize('mO1?m')).toThrow('character 4');
    expect(tokenize('m\r\nX')[2]).toEqual({ type: 'slap', value: 'X', position: 3 });
  });

  it.each(['', 'O1O', 'mm', 'mi m', 'mO O O O O m'])('rejects malformed notation %j', raw => {
    expect(() => parseNotation(raw, { subdivisions: 4 })).toThrow();
  });
});
