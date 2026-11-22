# jedeyafola — Rhythm studio

A React, TypeScript, Vite, and Tone.js player with the **complete Djagbé, Soro, Soli, and Kadan arrangements** from `Assets/Songs/`, the original SlapToonToonSlap font, and the original recordings.

The supplied jedeyafola artwork is preserved in `public/branding/jedeyafola.svg`. Its default view displays the wordmark, and the `#icon` view displays the matching app icon. Dark mode uses `public/branding/jedeyafola-dark.svg`, a transparent variant with fixed warm cream lettering and the orange drum detail. The interface uses the artwork's cream, deep brown, and orange palette.

Use the sun/moon switch in the header to choose light or dark mode. The first visit follows the system preference; an explicit choice is remembered on this device. Dark mode uses a near-black brown page with slightly lighter content panels, the logo's deep brown (`#511700`) borders, cream text, and orange accents.

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

Vite copies the audio and font from `../Assets/Resources/`, plus App sound sets from `soundsets/`, into the ignored `public/assets/` directory before development, tests, and builds. The built `dist/` contains everything needed to host the player, including those assets. Keep the app beside the existing Unity `Assets` directory when building. The relative Vite base supports hosting the build in a subdirectory.

## What works

- Song selector for Djagbé, Soro, Soli, Kadan, and your custom songs. Choose `+ New song` to open the builder. The editing tools stay hidden for library songs.
- Complete calls, accompaniments, solos, breaks, échauffement, section order, and repeats from each original song definition.
- Playback starts with the opening call. Soro and Soli omit the original one-measure metronome rest; Djagbé and Kadan already start with their calls.
- Soro, Soli, and Kadan group consecutive sections only where all instrument parts are identical, showing repeat counts such as `Accompany 1 (3x)` and `Solo 1 (4x)`. Sections with different accompaniment or an intervening section remain separate. Soli and Kadan already express all eligible repetitions as repeat counts in their original arrangements.
- Independent tracks, including two djembes with separate solo/accompaniment recordings, kenkeni, sangban, and dununba; simultaneous bell/drum strikes and overlapping sample tails.
- Play, Stop, tempo changes (30–240 BPM), whole-song looping, and metronome.
- Jump to any section using the playback dropdown or a row in the full arrangement. While stopped, Play begins at the selected section; during playback, a jump continues from that section's first pass. Stop returns to the beginning. Tempo, mixer settings, and whole-song looping are preserved when jumping.
- Track mute, volume, and stereo panning.
- Current section, repeat pass, labeled beat indicators, and progress.
- Smooth red playheads follow the audio clock across notes, rests, pattern repeats, and multiline measures, remaining aligned when the score resizes.
- Scores wrap after every two measures (eight beats) at a fixed 25px font size. A complete two-measure reference in the same font reserves the notation panel's width, keeping it stable for shorter parts; notation backgrounds fill that width. The mixer moves below when it cannot fit beside the score. Narrow screens can scroll the notation horizontally, following the playhead. Existing line breaks are reflowed for display; source notation and playback timing stay unchanged.
- Custom songs with multiple instrument channels, separate djembe recordings, named sections, repeat counts, section duplication, and arrangement reordering.
- The djembe channel's **Sound** selector offers Solo, Accompaniment, and Ballet djembe. The ballet-inspired set retunes and processes the original solo recordings for brighter tones, crisp slaps, and shorter decay; it is not a new live recording. See `soundsets/ballet-djembe/README.md` for its sources and `pnpm sounds:ballet` regeneration command.
- Each channel's pattern can be typed in the original font or source text, or built using stroke buttons and a pulse grid. The buttons support rests, instrument-specific strokes, combined bell/drum hits, djembe flams, and adding/removing measures.
- Play one section as a fragment, or the complete custom arrangement. Choose three or four pulses per beat and 1–12 beats per measure, including one-beat fragments. Loop playback for practice.
- Custom songs, unfinished notation, editor modes, tempo, and mix settings save in browser storage on this device. Switching back to a library song keeps your drafts.
- Responsive layout for desktop and phone-sized screens.

| Song | App sections | Measures including repeats | Beats | Sound events |
| --- | ---: | ---: | ---: | ---: |
| Djagbé | 23 | 43 | 172 | 1,153 |
| Soro | 31 | 70 | 280 | 4,159 |
| Soli | 23 | 73 | 292 | 3,157 |
| Kadan | 18 | 70 | 280 | 3,425 |

To create a fragment, choose `+ New song`, name the song and its first section, then use the stroke buttons or custom notation to fill a channel. Add channels to layer instruments. `Play section` auditions the section being edited; `Play song` follows the full section order and repeat counts. The builder has its own Stop button. Shorter patterns cycle through longer sections, as they do in the library arrangements.

Edits apply to playback when you next press Play; they do not interrupt a running preview. Buttons and custom mode share the same notation text. Switching modes preserves that text. Button mode refuses patterns with fractional spacing, hand markings, visual repeat markers, or mixed-stroke flams that it cannot represent exactly; these remain fully editable and playable in custom mode. Timing changes are refused if they would remove notes. Failed storage writes are reported while keeping edits in memory. Browser storage is local to the current browser and site address; there is no cross-device syncing or export yet.

## Structure

- `src/core/`: framework-independent tokenizer, parser, model, and arrangement compiler. No React, Tone.js, DOM, or browser dependencies; suitable for sharing with a future Expo app.
- `src/songs/`: original patterns and complete arrangements expressed as native TypeScript data. `catalog.ts` lists the library; `ensemble.ts` defines explicit lead/accompaniment/percussion track identities for the five-track songs.
- `src/audio/`: sample mappings and a Tone.js engine with its own AudioContext, transport, and node lifecycle.
- `src/composer/`: custom-song editing models, safe grid/notation conversion, arrangement compilation, and the React builder.
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

`src/songs/__tests__/original-arrangements.json` was independently exported by executing the C# song definitions. All four song imports are checked against its section/track/pattern/repeat sequences and a SHA-256 digest of every timed sound event, including short-part cycles and flam delays. For Soro and Soli, the tests account for the omitted opening rest by comparing the remaining sections and shifting event times back one measure before hashing. For Soro, Soli, and Kadan, expected groups are determined from the reference by comparing every instrument part of adjacent sections; each complete timed-sound digest remains identical. The original reference stays unchanged. The tests also verify that all referenced instrument recordings exist.

Composer tests cover one-beat fragments, combined drum/bell hits, separate channels for the same instrument, section order and repetitions, shorter-pattern cycling, safe editor conversions, flams, timing changes, contextual notation errors, and saved-draft validation.

For real Web Audio regressions, run `pnpm dev`, open `http://127.0.0.1:5173/tests/audio.html`, and click **Run audio regressions (silent)**. This development-only page measures hard-left/right separation, live panning of the original dununba recordings, the exact strike count at a natural ending, silence after Stop, and clean section jumps while stopped or playing. It uses the actual player, Tone transport, and audio nodes; synthetic sine buffers replace sample I/O only where deterministic input is needed. Speaker output is muted. These measurements occur before the device/preview's final output path, so they cannot verify downstream mono settings. The test page is not included in the production build.

All four existing song arrangements are migrated, and custom songs are saved locally in the browser. Cross-device syncing, offline installation, and native mobile playback are future work. Tone.js runs in the browser; a future Expo app can share `core/` and song data but needs a validated native audio backend and adapted UI. Phone lock/background audio is subject to browser/OS interruptions.
