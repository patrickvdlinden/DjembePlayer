# Ballet-inspired djembe

A bright, high-tuned, dry variation of the project's solo recordings. These are processed samples, not a newly recorded instrument or an AI-generated performance.

Choose **Ballet djembe** under a custom djembe channel's **Sound** selector. Channels choose their sound independently, and the choice saves with the song.

| Stroke | Original source in `Assets/Resources/Audio` | Tuning | Maximum length | Peak |
| --- | --- | ---: | ---: | ---: |
| Bass | `0101 Djembe bas.wav` | +1 semitone | 260 ms | 0.72 |
| Tone | `0102 Djembe toon.wav` | +4 semitones | 200 ms | 0.68 |
| Slap | `0103 Djembe slap.wav` | +5 semitones | 170 ms | 0.67 |

The generator removes DC offset and excess leading silence, retunes with windowed sinc interpolation, shapes body/presence with biquad filters, emphasizes the tone/slap high end, and shortens the decay with smooth edge fades. Output is mono, 48 kHz, 16-bit PCM WAV; the player's channel panning supplies stereo placement. Upsampling does not add detail to the original 16 kHz recordings.

From `App`, run `pnpm sounds:ballet` to rebuild the three tracked WAVs. It also writes an audition at `.tmp/ballet-djembe-preview.wav`: isolated bass, tone, and slap, followed by a short pattern. Generation is an explicit development step; playback and builds use the checked-in samples.

Vite copies these files alongside the original recordings into `public/assets/audio/`. The Unity sources remain unchanged.
