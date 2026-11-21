# Djembe Player — React app

The first Unity migration milestone: React, TypeScript, Vite, and Tone.js. Includes the **complete Djagbé arrangement** from `Assets/Songs/Djagbe.cs`, the original SlapToonToonSlap font, and the original recordings.

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

- Complete Djagbé: opening call, ten cycles of base/variation, closing call, ending. 43 measures / 172 beats; approximately 1:43 at 100 BPM.
- Independent djembe, sangban, and dununba tracks; simultaneous bell/drum strikes and overlapping sample tails.
- Play, Stop, tempo changes (30–240 BPM), whole-song looping, and metronome.
- Track mute, volume, and stereo panning.
- Current section, repeat pass, beat indicators, and progress.
- Notation display/editing in the original font, with a source-text toggle. Load custom patterns for djembe, kenkeni, sangban, dununba, or krin, using three or four pulses per beat; each custom pattern plays four times.
- Responsive layout for desktop and phone-sized screens.

## Structure

- `src/core/`: framework-independent tokenizer, parser, model, and arrangement compiler. No React, Tone.js, DOM, or browser dependencies; suitable for sharing with a future Expo app.
- `src/songs/djagbe.ts`: original patterns and complete arrangement expressed as data. Tracks have explicit identities, separate from instrument types.
- `src/audio/`: sample mappings and a Tone.js engine with its own AudioContext, transport, and node lifecycle.
- `src/App.tsx`: React controls and notation view.
- `scripts/sync-assets.mjs`: copy original font and samples into Vite's public directory.

## Notation and timing

The tokenizer covers the original C# grammar. `B/O/X` and lowercase variants map to bass/tone/slap; `v` adds a doun bell. `n/i/z` introduce a flam, with the next strike 50 ms later. Hand annotations and visual repeat/starting-point/triplet markers are accepted as in the original parser. Visual repeat markers are metadata; section `times` controls playback repetitions. Closed djembe strokes have no distinct syntax in the original parser.

Spacing uses exact integer units: `1` is one pulse, `-`/`2` half a pulse, and `_`/`3` two-thirds of a pulse. Musical beats use 720 ticks, allowing all these positions in straight and ternary patterns without floating-point keys. Spaces advance beats; `m` delimits measures. Pattern parsing defaults to four beats per measure, with an explicit core option for other lengths. Malformed input produces a readable error.

The arrangement compiler cycles shorter patterns through longer sections, matching the original song playback. `times` counts total performances: the Unity `AddPart(1, ...)` base section becomes `times: 2`.

Tone schedules each strike on its audio clock. React's animation loop only displays progress; it does not trigger sound. Each hit creates a separate buffer source so tails and flams overlap. Stop cancels transport events, pending flams, and any start still awaiting sample downloads. Audio assets are fetched and decoded once per player instance, with failed loads retryable.

## Validation and scope

`original-patterns.json` contains independent reference output exported from the unchanged C# parser for all **94 distinct patterns** used in Soro, Soli, Kadan, and Djagbé. The tests compare sound types, ticks, flam delays, durations, and repeat metadata. These reference fixtures are test data, not runtime adapters. Additional tests cover exact fractional spacing, malformed input, complete song counts, shorter-part cycling, distinct tracks of the same instrument, and audio cancellation/retry behavior.

Only Djagbé's complete song arrangement has been migrated. The remaining songs, persistence, offline installation, and native mobile playback are future work. Tone.js runs in the browser; a future Expo app can share `core/` and song data but needs a validated native audio backend and adapted UI. Phone lock/background audio is subject to browser/OS interruptions.
