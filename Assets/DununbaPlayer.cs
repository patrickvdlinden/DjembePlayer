using UnityEngine;

public class DununbaPlayer : DounPlayer
{
    protected override void LoadAudioClips()
    {
        DounBellClip = Resources.Load<AudioClip>("Audio/0407 Dununba bel");
        DounOpenClip = Resources.Load<AudioClip>("Audio/0402 Dununba Trommel");
        DounClosedClip = Resources.Load<AudioClip>("Audio/0403 Dununba Trommel dicht");
    }
}
