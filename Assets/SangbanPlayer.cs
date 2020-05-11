using UnityEngine;

public class SangbanPlayer : DounPlayer
{
    protected override void LoadAudioClips()
    {
        DounBellClip = Resources.Load<AudioClip>("Audio/0307 Sangban bel");
        DounOpenClip = Resources.Load<AudioClip>("Audio/0302 Sangban Trommel");
        DounClosedClip = Resources.Load<AudioClip>("Audio/0303 Sangban Trommel dicht");
    }
}
