﻿using UnityEngine;

public class KenkeniPlayer : DounPlayer
{
    protected override void LoadAudioClips()
    {
        DounBellClip = Resources.Load<AudioClip>("Audio/0207 Kenkeni Bel");
        DounOpenClip = Resources.Load<AudioClip>("Audio/Kenkeni");
        DounClosedClip = Resources.Load<AudioClip>("Audio/0203 Kenkeni Trommel dicht");
    }
}
