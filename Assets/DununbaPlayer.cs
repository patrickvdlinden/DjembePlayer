using UnityEngine;

public class DununbaPlayer : InstrumentPlayer
{
    protected override void LoadAudioClips()
    {
        AudioClips[Notation.SoundType.DounBell] = Resources.Load<AudioClip>("Audio/0407 Dununba bel");
        AudioClips[Notation.SoundType.DounOpen] = Resources.Load<AudioClip>("Audio/Dununba");
        AudioClips[Notation.SoundType.DounClosed] = Resources.Load<AudioClip>("Audio/0403 Dununba Trommel dicht");
    }
}
