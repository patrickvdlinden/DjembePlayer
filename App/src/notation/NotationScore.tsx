import { useLayoutEffect, useMemo, useRef } from 'react';
import { TICKS_PER_BEAT } from '../core/model';
import type { Notation, NotationPosition } from '../core/model';
import { patternTick, positionAtTick } from './playhead';
import type { MeasuredPosition } from './playhead';
import { wrapNotation } from './wrapNotation';

interface Props {
  notation: Notation;
  label: string;
  readTick: () => number;
  sectionStart: number;
  sectionEnd: number;
  playing: boolean;
}

export function NotationScore({ notation, label, readTick, sectionStart, sectionEnd, playing }: Props) {
  const layout = useMemo(() => wrapNotation(notation), [notation]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLPreElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current!;
    const container = viewport.parentElement!;
    const content = contentRef.current!;
    const text = textRef.current!;
    const cursor = cursorRef.current!;
    const measureTicks = notation.beatsPerMeasure * TICKS_PER_BEAT;
    let measures: MeasuredPosition[][] = [];
    let frame = 0;
    let resizeFrame = 0;
    let mounted = true;

    const draw = () => {
      const tick = patternTick(readTick(), sectionStart, sectionEnd, notation.durationTicks);
      const position = positionAtTick(measures, measureTicks, tick);
      if (!position) { cursor.hidden = true; return; }
      cursor.hidden = false;
      cursor.style.height = `${position.height}px`;
      cursor.style.transform = `translate3d(${position.x - 1}px, ${position.y}px, 0)`;
      viewport.scrollLeft = Math.max(0, Math.min(position.x - viewport.clientWidth * 0.65,
        viewport.scrollWidth - viewport.clientWidth));
    };

    const measure = () => {
      const range = document.createRange();
      const bounds = content.getBoundingClientRect();
      const style = getComputedStyle(text);
      const lineHeight = Number.parseFloat(style.lineHeight);
      const paddingTop = Number.parseFloat(style.paddingTop);
      const groups = Array.from({ length: notation.measureCount }, () =>
        new Map<number, { source: NotationPosition; point: MeasuredPosition }>());
      for (const source of layout.positions) {
        const group = groups[source.measureIndex]!;
        const previous = group.get(source.tick);
        // Bells, hand marks, and flams can share a pulse. Use its first glyph;
        // a pulse glyph takes precedence over the opening measure line.
        if (previous && (previous.source.kind === 'pulse' || source.kind === 'barline')) continue;
        range.setStart(text.firstChild!, source.offset);
        range.setEnd(text.firstChild!, source.offset + 1);
        const glyph = range.getBoundingClientRect();
        const row = layout.text.slice(0, source.offset).split('\n').length - 1;
        group.set(source.tick, { source, point: {
          tick: source.tick,
          x: glyph.left - bounds.left + glyph.width / 2,
          y: paddingTop + row * lineHeight - 4,
          height: lineHeight + 8,
        } });
      }
      measures = groups.map(group => [...group.values()].map(item => item.point).sort((a, b) => a.tick - b.tick));
      draw();
    };

    const animate = () => {
      draw();
      frame = requestAnimationFrame(animate);
    };
    measure();
    let width = container.clientWidth;
    const observer = new ResizeObserver(() => {
      if (container.clientWidth === width) return;
      width = container.clientWidth;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(measure);
    });
    observer.observe(container);
    void document.fonts.ready.then(() => { if (mounted) measure(); });
    if (playing) frame = requestAnimationFrame(animate);
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
    };
  }, [notation, layout, readTick, sectionStart, sectionEnd, playing]);

  return (
    <div className="score-viewport" ref={viewportRef} tabIndex={0} role="region" aria-label={label}>
      <div className="score-content" ref={contentRef}>
        <pre className="notation" ref={textRef} aria-label={notation.raw}>{layout.text}</pre>
        <span className="notation-playhead" ref={cursorRef} aria-hidden="true" hidden />
      </div>
    </div>
  );
}
