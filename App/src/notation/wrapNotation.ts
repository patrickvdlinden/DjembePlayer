import type { Notation, NotationPosition } from '../core/model';

/** A complete two-measure row supplies the font's intrinsic width for layout. */
export function notationWidthReference(notation: Pick<Notation, 'subdivisions' | 'beatsPerMeasure'>): string {
  const beat = `${Array.from({ length: notation.subdivisions }, () => '.').join('1')} `;
  return `m${beat.repeat(notation.beatsPerMeasure)}m${beat.repeat(notation.beatsPerMeasure)}m`;
}

/** Reflow the score into two-measure rows, retaining each glyph's musical time. */
export function wrapNotation(notation: Notation): { text: string; positions: NotationPosition[] } {
  let text = '';
  const positions: NotationPosition[] = [];
  for (let measureIndex = 0; measureIndex < notation.measureCount; measureIndex++) {
    const sources = notation.positions.filter(position => position.measureIndex === measureIndex);
    const boundaries = sources.filter(position => position.kind === 'barline');
    const opening = boundaries[0]!;
    const closing = boundaries.at(-1)!;
    if (measureIndex % 2 === 0) {
      if (measureIndex > 0) text += '\n';
      text += 'm';
    }
    // Adjacent measures share a barline within a row. At a row break each
    // measure gets its own boundary, so the cursor stays on the correct row.
    const offsets = new Map<number, number>([[opening.offset, text.length - 1]]);
    for (let offset = opening.offset + 1; offset < closing.offset; offset++) {
      const glyph = notation.raw[offset]!;
      if (glyph !== '\r' && glyph !== '\n') {
        offsets.set(offset, text.length);
        text += glyph;
      }
    }
    offsets.set(closing.offset, text.length);
    text += 'm';
    positions.push(...sources.map(source => ({ ...source, offset: offsets.get(source.offset)! })));
  }
  return { text, positions };
}
