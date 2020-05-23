using Notation;
using UnityEngine;

public class DjembePlayer : InstrumentPlayer
{
    public DjembeType Type;

    protected override void LoadAudioClips()
    {
        if (Type == DjembeType.Solo)
        {
            AudioClips[SoundType.BassOpen] = Resources.Load<AudioClip>("Audio/0101 Djembe bas");
            AudioClips[SoundType.ToneOpen] = Resources.Load<AudioClip>("Audio/0102 Djembe toon");
            AudioClips[SoundType.SlapOpen] = Resources.Load<AudioClip>("Audio/0103 Djembe slap");
        }
        else
        {
            AudioClips[SoundType.BassOpen] = Resources.Load<AudioClip>("Audio/Djembe Bass");
            AudioClips[SoundType.ToneOpen] = Resources.Load<AudioClip>("Audio/Djembe Tone");
            AudioClips[SoundType.SlapOpen] = Resources.Load<AudioClip>("Audio/Djembe Slap");
        }
    }
}
