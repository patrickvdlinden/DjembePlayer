import type { Arrangement, Song } from './model';

/** Compile patterns and section repetitions without any UI or audio dependency. */
export function compileArrangement(song: Song): Arrangement {
  const arrangement: Arrangement = { events: [], sections: [], durationTicks: 0 };
  const trackIds = new Set(song.tracks.map(track => track.id));
  if (trackIds.size !== song.tracks.length) throw new Error('Track IDs must be unique.');
  if (!song.sections.length) throw new Error('A song needs at least one section.');
  for (const section of song.sections) {
    if (!Number.isInteger(section.times) || section.times < 1) throw new Error('Section times must be a positive integer.');
    if (!section.parts.length) throw new Error('A section needs at least one part.');
    const partTrackIds = new Set<string>();
    for (const part of section.parts) {
      if (!trackIds.has(part.trackId)) throw new Error(`Unknown track: ${part.trackId}`);
      if (partTrackIds.has(part.trackId)) throw new Error(`Duplicate part for track: ${part.trackId}`);
      if (part.notation.durationTicks <= 0) throw new Error('A pattern must have a duration.');
      partTrackIds.add(part.trackId);
    }
    const duration = Math.max(...section.parts.map(part => part.notation.durationTicks));
    for (let iteration = 1; iteration <= section.times; iteration++) {
      const startTick = arrangement.durationTicks;
      arrangement.sections.push({ sectionId: section.id, name: section.name, startTick,
        endTick: startTick + duration, iteration, times: section.times });
      for (const part of section.parts) {
        // Shorter parts cycle through the section, as in the original player.
        for (let offset = 0; offset < duration; offset += part.notation.durationTicks) {
          for (const sound of part.notation.sounds) {
            if (offset + sound.tick < duration) {
              arrangement.events.push({ ...sound, trackId: part.trackId, tick: startTick + offset + sound.tick });
            }
          }
        }
      }
      arrangement.durationTicks += duration;
    }
  }
  arrangement.events.sort((a, b) => a.tick - b.tick || a.delaySeconds - b.delaySeconds);
  return arrangement;
}
