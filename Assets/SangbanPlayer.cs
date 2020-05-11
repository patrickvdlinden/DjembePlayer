using UnityEngine;

public class SangbanPlayer : DounPlayer
{
    protected override void LoadAudioClips()
    {
        DounBellClip = Resources.Load<AudioClip>("Audio/0307 Sangban bel");
        DounOpenClip = Resources.Load<AudioClip>("Audio/Sangban");
        DounClosedClip = Resources.Load<AudioClip>("Audio/Sangban Mute");
    }
}
