export interface MeasuredPosition {
  tick: number;
  x: number;
  y: number;
  height: number;
}

/** Shorter tracks cycle independently; at a section's end retain its final position. */
export function patternTick(songTick: number, sectionStart: number, sectionEnd: number, duration: number): number {
  const elapsed = Math.max(0, Math.min(songTick, sectionEnd) - sectionStart);
  const local = elapsed % duration;
  return songTick >= sectionEnd && elapsed > 0 && local === 0 ? duration : local;
}

/** Interpolate between rendered pulse glyphs, with a discrete move at each new measure. */
export function positionAtTick(measures: MeasuredPosition[][], measureTicks: number, tick: number): MeasuredPosition | undefined {
  const position = Math.max(0, Math.min(tick, measures.length * measureTicks));
  const measure = measures[Math.min(Math.floor(position / measureTicks), measures.length - 1)];
  if (!measure?.length) return;
  let before = measure[0]!;
  for (const after of measure) {
    if (after.tick > position) {
      const fraction = Math.max(0, (position - before.tick) / (after.tick - before.tick));
      return { ...before, tick: position, x: before.x + (after.x - before.x) * fraction };
    }
    before = after;
  }
  return before;
}
