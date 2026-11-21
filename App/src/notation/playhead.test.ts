import { describe, expect, it } from 'vitest';
import { parseNotation } from '../core/parser';
import { patternTick, positionAtTick } from './playhead';

describe('notation playhead', () => {
  it('maps rests, fractional pulses, and source offsets including leading whitespace', () => {
    const raw = '\n  mO_.1X .1.1. .1.1. .1.1. m\n';
    const notation = parseNotation(raw, { subdivisions: 3 });
    const pulses = notation.positions.filter(position => position.kind === 'pulse');
    expect(pulses.slice(0, 3).map(position => [position.tick, raw[position.offset]]))
      .toEqual([[0, 'O'], [160, '.'], [400, 'X']]);
    expect(notation.positions.at(-1)?.tick).toBe(2880);
    expect(raw[notation.positions.at(-1)!.offset]).toBe('m');
  });

  it('keeps separate boundaries for two measures on different lines', () => {
    const raw = 'mO1.1.1. .1.1.1. .1.1.1. .1.1.1. m\r\nmX1.1.1. .1.1.1. .1.1.1. .1.1.1. m';
    const notation = parseNotation(raw, { subdivisions: 4 });
    const boundary = notation.positions.filter(position => position.tick === 2880);
    expect(boundary.map(position => [position.measureIndex, raw[position.offset]]))
      .toEqual([[0, 'm'], [1, 'm'], [1, 'X']]);
  });

  it('interpolates between note positions rather than assuming uniform text width', () => {
    const measures = [[
      { tick: 0, x: 20, y: 8, height: 60 },
      { tick: 180, x: 50, y: 8, height: 60 },
      { tick: 720, x: 170, y: 8, height: 60 },
    ]];
    expect(positionAtTick(measures, 720, 90)?.x).toBe(35);
    expect(positionAtTick(measures, 720, 450)?.x).toBe(110);
  });

  it('moves to the next line at a measure boundary and retains the ending position', () => {
    const measures = [
      [{ tick: 0, x: 20, y: 8, height: 60 }, { tick: 720, x: 170, y: 8, height: 60 }],
      [{ tick: 720, x: 20, y: 68, height: 60 }, { tick: 1440, x: 170, y: 68, height: 60 }],
    ];
    expect(positionAtTick(measures, 720, 720)).toMatchObject({ x: 20, y: 68 });
    expect(positionAtTick(measures, 720, 1440)).toMatchObject({ x: 170, y: 68 });
  });

  it('restarts shorter patterns within a section and freezes correctly at its end', () => {
    expect(patternTick(5000, 3000, 9000, 2880)).toBe(2000);
    expect(patternTick(6000, 3000, 9000, 2880)).toBe(120);
    expect(patternTick(9000, 3000, 9000, 2880)).toBe(240);
    expect(patternTick(8760, 3000, 8760, 2880)).toBe(2880);
    expect(patternTick(0, 3000, 9000, 2880)).toBe(0);
  });
});
