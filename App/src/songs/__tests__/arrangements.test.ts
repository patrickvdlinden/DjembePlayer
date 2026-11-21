import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { describe, expect, it } from 'vitest';
import { samplesFor } from '../../audio/samples';
import { compileArrangement } from '../../core/arrangement';
import { TICKS_PER_BEAT } from '../../core/model';
import { songs } from '../catalog';

interface Reference {
  id: string;
  sectionCount: number;
  occurrences: number;
  durationTicks: number;
  soundEvents: number;
  timelineHash: string;
  sections: { times: number; parts: { trackId: string; raw: string; subdivisions: number }[] }[];
}

// Independent reference exported by executing Assets/Songs/*.cs and enumerating
// its parsed sounds and repeats. No TypeScript parser/compiler produced this data.
const references = JSON.parse(readFileSync(new URL('./original-arrangements.json', import.meta.url), 'utf8')) as Reference[];

describe.each(songs)('$name complete arrangement', song => {
  const reference = references.find(item => item.id === song.id)!;
  // The app omits Soro/Soli's silent count-in; the C# reference stays unchanged.
  const omittedSections = song.id === 'soro' || song.id === 'soli' ? 1 : 0;
  const omittedTicks = omittedSections * 4 * TICKS_PER_BEAT;
  const groupConsecutiveSections = ['soro', 'soli', 'kadan'].includes(song.id);

  it('preserves every musical section, pattern, track assignment, and repeat count', () => {
    const expected: Reference['sections'] = [];
    for (const source of reference.sections.slice(omittedSections)) {
      const section = { ...source, parts: source.parts.map(part => ({
        ...part,
        // Soro's lead notation includes the closing beat space needed by the font.
        raw: song.id === 'soro' && part.trackId === 'djembe-1'
          ? part.raw.replace(/(\S)(<m)$/, '$1 $2') : part.raw,
      })) };
      const previous = expected.at(-1);
      // Group adjacent entries only when every instrument part matches.
      if (groupConsecutiveSections && previous && isDeepStrictEqual(previous.parts, section.parts)) {
        previous.times += section.times;
      } else {
        expected.push({ ...section });
      }
    }
    expect(song.sections).toHaveLength(expected.length);
    expect(song.sections.map(section => ({
      times: section.times,
      parts: section.parts.map(part => ({
        trackId: part.trackId, raw: part.notation.raw, subdivisions: part.notation.subdivisions,
      })),
    }))).toEqual(expected);
  });

  it('matches every timed sound in the C# arrangement, including flams and shorter-part cycles', () => {
    const arrangement = compileArrangement(song);
    expect(arrangement.sections).toHaveLength(reference.occurrences - omittedSections);
    expect(arrangement.durationTicks).toBe(reference.durationTicks - omittedTicks);
    expect(arrangement.events).toHaveLength(reference.soundEvents);
    const timeline = arrangement.events
      .map(event => `${event.tick + omittedTicks},${event.trackId},${event.type},${event.delaySeconds.toFixed(3)}`)
      .sort().join('\n');
    expect(createHash('sha256').update(timeline).digest('hex')).toBe(reference.timelineHash);
  });

  it('has an existing recording for every strike on every instrument track', () => {
    for (const track of song.tracks) {
      const samples = samplesFor(track);
      const sounds = new Set(song.sections.flatMap(section => section.parts
        .filter(part => part.trackId === track.id)
        .flatMap(part => part.notation.sounds.map(sound => sound.type))));
      for (const sound of sounds) {
        const filename = samples[sound];
        expect(filename, `${track.name}: ${sound}`).toBeDefined();
        expect(existsSync(new URL(`../../../../Assets/Resources/Audio/${filename!}`, import.meta.url))).toBe(true);
      }
    }
  });
});

it('uses separate solo and accompaniment samples for the two djembe tracks', () => {
  for (const song of songs.filter(item => item.id !== 'djagbe')) {
    const djembes = song.tracks.filter(track => track.instrument === 'djembe');
    expect(djembes.map(track => track.id)).toEqual(['djembe-1', 'djembe-2']);
    expect(djembes.map(track => track.sampleSet)).toEqual(['solo', 'accompany']);
  }
});
