# Djembe Player — React app

A React, TypeScript, Vite, and Tone.js player with the **complete Djagbé, Soro, Soli, and Kadan arrangements** from `Assets/Songs/`, the original SlapToonToonSlap font, and the original recordings.

## Run

Use Node.js 22.12 or later (Node 24 recommended) and pnpm 11.25.

```sh
cd App
pnpm install
pnpm dev
```

Open the URL printed by Vite (normally `http://127.0.0.1:5173/`) and click **Play** to enable browser audio.

```sh
pnpm test       # parser, arrangement, and audio lifecycle tests
pnpm check      # strict TypeScript checking
pnpm build     # type-check and create dist/
pnpm preview   # serve the production build locally
```

Vite copies the audio and font from `../Assets/Resources/` into the ignored `public/assets/` directory before development, tests, and builds. The built `dist/` contains everything needed to host the player, including those assets. Keep the app beside the existing Unity `Assets` directory when building. The relative Vite base supports hosting the build in a subdirectory.

## What works

- Song selector for Djagbé, Soro, Soli, and Kadan. Changing songs stops playback and resets the position, tempo, and track mixer for the selected song.
- Complete calls, accompaniments, solos, breaks, échauffement, section order, and repeats from each original song definition.
- Independent tracks, including two djembes with separate solo/accompaniment recordings, kenkeni, sangban, and dununba; simultaneous bell/drum strikes and overlapping sample tails.
- Play, Stop, tempo changes (30–240 BPM), whole-song looping, and metronome.
- Track mute, volume, and stereo panning.
- Current section, repeat pass, labeled beat indicators, and progress.
- Smooth red playheads follow the audio clock across notes, rests, pattern repeats, and multiline measures. Long notation scrolls to keep the playhead visible.
- Notation display/editing in the original font, with a source-text toggle. Load custom patterns for djembe, kenkeni, sangban, dununba, or krin, using three or four pulses per beat; each custom pattern plays four times.
- Responsive layout for desktop and phone-sized screens.

| Song | Source sections | Measures including repeats | Beats | Sound events |
| --- | ---: | ---: | ---: | ---: |
| Djagbé | 23 | 43 | 172 | 1,153 |
| Soro | 42 | 71 | 284 | 4,159 |
| Soli | 24 | 74 | 296 | 3,157 |
| Kadan | 18 | 70 | 280 | 3,425 |

The pattern editor remains separate from the song library. Loading a custom pattern remembers which library song you were practicing, so its return button takes you back to that song.

## Structure

- `src/core/`: framework-independent tokenizer, parser, model, and arrangement compiler. No React, Tone.js, DOM, or browser dependencies; suitable for sharing with a future Expo app.
- `src/songs/`: original patterns and complete arrangements expressed as native TypeScript data. `catalog.ts` lists the library; `ensemble.ts` defines explicit lead/accompaniment/percussion track identities for the five-track songs.
- `src/audio/`: sample mappings and a Tone.js engine with its own AudioContext, transport, and node lifecycle.
- `src/App.tsx`: React controls and notation view.
- `scripts/sync-assets.mjs`: copy original font and samples into Vite's public directory.

## Notation and timing

The tokenizer covers the original C# grammar. `B/O/X` and lowercase variants map to bass/tone/slap; `v` adds a doun bell. `n/i/z` introduce a flam, with the next strike 50 ms later. Hand annotations and visual repeat/starting-point/triplet markers are accepted as in the original parser. Visual repeat markers are metadata; section `times` controls playback repetitions. Closed djembe strokes have no distinct syntax in the original parser.

Spacing uses exact integer units: `1` is one pulse, `-`/`2` half a pulse, and `_`/`3` two-thirds of a pulse. Musical beats use 720 ticks, allowing all these positions in straight and ternary patterns without floating-point keys. Spaces advance beats; `m` delimits measures. Pattern parsing defaults to four beats per measure, with an explicit core option for other lengths. Malformed input produces a readable error.

The arrangement compiler cycles shorter patterns through longer sections, matching the original song playback. `times` counts total performances: the Unity `AddPart(1, ...)` base section becomes `times: 2`.

Tone schedules each strike on its audio clock. React's animation loop only displays progress; it does not trigger sound. Each hit creates a separate buffer source so tails and flams overlap. Stop cancels transport events, pending flams, and any start still awaiting sample downloads. A 5 ms master fade silences active and already-queued voices before their nodes are disconnected, avoiding an abrupt cutoff. The output bus explicitly preserves two channels. Audio assets are fetched and decoded once per player instance, with failed loads retryable.

At a natural ending, playback callbacks are invalidated and removed **before** the transport's tick counter is reset. Otherwise, Tone's current scheduling batch can revisit tick zero and replay the opening strikes repeatedly. The final recorded tails are allowed to finish naturally.

## Validation and scope

`original-patterns.json` contains independent reference output exported from the unchanged C# parser for all **94 distinct patterns** used in Soro, Soli, Kadan, and Djagbé. The tests compare sound types, ticks, flam delays, durations, and repeat metadata. These reference fixtures are test data, not runtime adapters. Additional tests cover exact fractional spacing, malformed input, complete song counts, shorter-part cycling, distinct tracks of the same instrument, and audio cancellation/retry behavior.

`src/songs/__tests__/original-arrangements.json` was independently exported by executing the C# song definitions. All four song imports are checked against its complete section/track/pattern/repeat sequences and a SHA-256 digest of every timed sound event, including short-part cycles and flam delays. The tests also verify that all referenced instrument recordings exist.

For real Web Audio regressions, run `pnpm dev`, open `http://127.0.0.1:5173/tests/audio.html`, and click **Run audio regressions (silent)**. This development-only page measures hard-left/right separation, live panning of the original dununba recordings, the exact strike count at a natural ending, and silence after Stop. It uses the actual player, Tone transport, and audio nodes; synthetic sine buffers replace sample I/O only where deterministic input is needed. Speaker output is muted. These measurements occur before the device/preview's final output path, so they cannot verify downstream mono settings. The test page is not included in the production build.

All four existing song arrangements are migrated. Persistence, offline installation, and native mobile playback are future work. Tone.js runs in the browser; a future Expo app can share `core/` and song data but needs a validated native audio backend and adapted UI. Phone lock/background audio is subject to browser/OS interruptions.
