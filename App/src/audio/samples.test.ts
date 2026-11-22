import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Track } from '../core/model';
import { sampleUrl, samplesFor } from './samples';

const track: Track = { id: 'djembe', name: 'Djembe', instrument: 'djembe', sampleSet: 'ballet', color: '#fd9203', volume: .65, pan: 0 };

describe('ballet djembe samples', () => {
  it('provides three distinct strokes and leaves the other sound sets separate', () => {
    const samples = samplesFor(track);
    expect(Object.keys(samples).sort()).toEqual(['bass-open', 'slap-open', 'tone-open']);
    expect(new Set(Object.values(samples)).size).toBe(3);
    for (const filename of Object.values(samples)) {
      expect(sampleUrl(filename)).toContain(encodeURIComponent(filename));
      expect(Object.values(samplesFor({ ...track, sampleSet: 'solo' }))).not.toContain(filename);
      expect(Object.values(samplesFor({ ...track, sampleSet: 'accompany' }))).not.toContain(filename);
    }
  });

  it.each(Object.values(samplesFor(track)))('%s is playable PCM audio with headroom and silent edges', filename => {
    const wav = readFileSync(new URL(`../../soundsets/ballet-djembe/${filename}`, import.meta.url));
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
    expect(wav.toString('ascii', 8, 12)).toBe('WAVE');
    expect(wav.readUInt32LE(4)).toBe(wav.length - 8);
    expect(wav.readUInt16LE(20)).toBe(1);
    expect(wav.readUInt16LE(22)).toBe(1);
    expect(wav.readUInt32LE(24)).toBe(48000);
    expect(wav.readUInt16LE(34)).toBe(16);
    const pcm = Array.from({ length: (wav.length - 44) / 2 }, (_, index) => wav.readInt16LE(44 + index * 2) / 32768);
    expect(Math.max(...pcm.map(Math.abs))).toBeGreaterThan(.6);
    expect(Math.max(...pcm.map(Math.abs))).toBeLessThan(.73);
    expect(pcm[0]).toBe(0);
    expect(pcm.at(-1)).toBe(0);
    expect(pcm.length / 48000).toBeGreaterThan(.1);
    expect(pcm.length / 48000).toBeLessThan(.3);
  });
});
