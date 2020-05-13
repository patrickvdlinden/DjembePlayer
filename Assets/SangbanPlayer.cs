using UnityEngine;

public class SangbanPlayer : InstrumentPlayer
{
    protected override void LoadAudioClips()
    {
        AudioClips[Notation.SoundType.DounBell] = Resources.Load<AudioClip>("Audio/0307 Sangban bel");
        AudioClips[Notation.SoundType.DounOpen] = Resources.Load<AudioClip>("Audio/Sangban");
        AudioClips[Notation.SoundType.DounClosed] = Resources.Load<AudioClip>("Audio/Sangban Mute");
    }
}
