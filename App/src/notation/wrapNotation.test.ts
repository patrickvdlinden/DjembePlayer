import { describe, expect, it } from 'vitest';
import { TICKS_PER_BEAT } from '../core/model';
import { parseNotation } from '../core/parser';
import { songs } from '../songs/catalog';
import { notationWidthReference, wrapNotation } from './wrapNotation';

const body = 'O1.1.1. .1.1.1. .1.1.1. .1.1.1. ';
const pattern = (measures: number) => parseNotation(`m${`${body}m`.repeat(measures)}`, { subdivisions: 4 });

describe('two-measure notation rows', () => {
  it('uses eight complete beats as the fixed-font width reference', () => {
    expect(notationWidthReference({ subdivisions: 4, beatsPerMeasure: 4 }))
      .toBe('m.1.1.1. .1.1.1. .1.1.1. .1.1.1. m.1.1.1. .1.1.1. .1.1.1. .1.1.1. m');
    expect(notationWidthReference({ subdivisions: 3, beatsPerMeasure: 4 }))
      .toBe('m.1.1. .1.1. .1.1. .1.1. m.1.1. .1.1. .1.1. .1.1. m');
  });

  it('wraps a continuous four-measure pattern after eight beats', () => {
    const notation = pattern(4);
    const row = `m${body}m${body}m`;
    expect(wrapNotation(notation).text).toBe(`${row}\n${row}`);
  });

  it('reflows existing line breaks and duplicated boundary glyphs into pairs', () => {
    const notation = parseNotation(`m${body}m\r\nm${body}m\nm${body}m\r\nm${body}m`, { subdivisions: 4 });
    const row = `m${body}m${body}m`;
    expect(wrapNotation(notation).text).toBe(`${row}\n${row}`);
  });

  it('leaves a final odd measure on its own row without a trailing empty row', () => {
    expect(wrapNotation(pattern(3)).text).toBe(`m${body}m${body}m\nm${body}m`);
    expect(wrapNotation(pattern(1)).text).toBe(`m${body}m`);
    expect(wrapNotation(pattern(2)).text).toBe(`m${body}m${body}m`);
  });

  it('maps the shared eight-beat boundary to the end and start of separate rows', () => {
    const layout = wrapNotation(pattern(4));
    const boundary = layout.positions.filter(position => position.tick === 8 * TICKS_PER_BEAT);
    const newline = layout.text.indexOf('\n');
    expect(boundary.map(position => [position.measureIndex, position.kind, position.offset])).toEqual([
      [1, 'barline', newline - 1], [2, 'barline', newline + 1], [2, 'pulse', newline + 2],
    ]);
  });

  it('preserves sounds, repeat markers, and every timed glyph across the song library', () => {
    const notations = new Set(songs.flatMap(song => song.sections.flatMap(section => section.parts.map(part => part.notation))));
    for (const notation of notations) {
      const layout = wrapNotation(notation);
      const reparsed = parseNotation(layout.text, notation);
      expect(reparsed.sounds, notation.name).toEqual(notation.sounds);
      expect(reparsed.durationTicks, notation.name).toBe(notation.durationTicks);
      expect(reparsed.measureCount, notation.name).toBe(notation.measureCount);
      expect(reparsed.repeating, notation.name).toBe(notation.repeating);
      expect(layout.text.split('\n'), notation.name).toHaveLength(Math.ceil(notation.measureCount / 2));
      expect(layout.positions.map(({ offset, ...position }) => ({
        ...position, glyph: layout.text[offset],
      }))).toEqual(notation.positions.map(({ offset, ...position }) => ({
        ...position, glyph: notation.raw[offset],
      })));
    }
  });
});
