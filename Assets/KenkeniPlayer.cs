using UnityEngine;

public class KenkeniPlayer : InstrumentPlayer
{
    protected override void LoadAudioClips()
    {
        AudioClips[Notation.SoundType.DounBell] = Resources.Load<AudioClip>("Audio/0207 Kenkeni bel");
        AudioClips[Notation.SoundType.DounOpen] = Resources.Load<AudioClip>("Audio/Kenkeni");
        AudioClips[Notation.SoundType.DounClosed] = Resources.Load<AudioClip>("Audio/0203 Kenkeni Trommel dicht");
    }
}
