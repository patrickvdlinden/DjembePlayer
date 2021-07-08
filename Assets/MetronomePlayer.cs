using Notation;
using UnityEngine;

public class MetronomePlayer : SoundPlayer
{
    protected override void OnLoad()
    {
        AudioClip = Resources.Load<AudioClip>("Audio/1001 Metronome");
    }
}
