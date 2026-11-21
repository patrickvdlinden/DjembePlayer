import { useLayoutEffect, useRef } from 'react';
import { TICKS_PER_BEAT } from '../core/model';
import type { Notation, NotationPosition } from '../core/model';
import { patternTick, positionAtTick } from './playhead';
import type { MeasuredPosition } from './playhead';

interface Props {
  notation: Notation;
  label: string;
  readTick: () => number;
  sectionStart: number;
  sectionEnd: number;
  playing: boolean;
}

export function NotationScore({ notation, label, readTick, sectionStart, sectionEnd, playing }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLPreElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const scroll = scrollRef.current!;
    const content = contentRef.current!;
    const text = textRef.current!;
    const cursor = cursorRef.current!;
    const measureTicks = notation.beatsPerMeasure * TICKS_PER_BEAT;
    let measures: MeasuredPosition[][] = [];
    let frame = 0;
    let mounted = true;

    const draw = () => {
      const tick = patternTick(readTick(), sectionStart, sectionEnd, notation.durationTicks);
      const position = positionAtTick(measures, measureTicks, tick);
      if (!position) { cursor.hidden = true; return; }
      cursor.hidden = false;
      cursor.style.height = `${position.height}px`;
      cursor.style.transform = `translate3d(${position.x - 1}px, ${position.y}px, 0)`;
      // Keep long patterns visible as their playhead moves through the score.
      scroll.scrollLeft = Math.max(0, Math.min(position.x - scroll.clientWidth * 0.65,
        scroll.scrollWidth - scroll.clientWidth));
    };

    const measure = () => {
      const bounds = content.getBoundingClientRect();
      const style = getComputedStyle(text);
      const lineHeight = Number.parseFloat(style.lineHeight);
      const paddingTop = Number.parseFloat(style.paddingTop);
      const range = document.createRange();
      const groups = Array.from({ length: notation.measureCount }, () =>
        new Map<number, { source: NotationPosition; point: MeasuredPosition }>());
      for (const source of notation.positions) {
        const group = groups[source.measureIndex]!;
        const previous = group.get(source.tick);
        // Bells, hand marks, and flams can share a pulse. Use its first glyph;
        // a pulse glyph takes precedence over the opening measure line.
        if (previous && (previous.source.kind === 'pulse' || source.kind === 'barline')) continue;
        range.setStart(text.firstChild!, source.offset);
        range.setEnd(text.firstChild!, source.offset + 1);
        const glyph = range.getBoundingClientRect();
        const row = notation.raw.slice(0, source.offset).split('\n').length - 1;
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
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    observer.observe(scroll);
    void document.fonts.ready.then(() => { if (mounted) measure(); });
    if (playing) frame = requestAnimationFrame(animate);
    return () => { mounted = false; cancelAnimationFrame(frame); observer.disconnect(); };
  }, [notation, readTick, sectionStart, sectionEnd, playing]);

  return (
    <div className="score-scroll" ref={scrollRef} tabIndex={0} role="region" aria-label={label}>
      <div className="score-content" ref={contentRef}>
        <pre className="notation" ref={textRef} aria-label={notation.raw}>{notation.raw}</pre>
        <span className="notation-playhead" ref={cursorRef} aria-hidden="true" hidden />
      </div>
    </div>
  );
}
