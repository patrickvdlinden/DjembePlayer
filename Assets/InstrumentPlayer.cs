using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Notation;
using UnityEngine;

public abstract class InstrumentPlayer : SoundPlayer
{
    protected Dictionary<SoundType, AudioClip> AudioClips = new Dictionary<SoundType, AudioClip>();

    public virtual void PlaySound(ISound sound)
    {
        if (sound.Delay > 0f)
        {
            StartCoroutine(PlaySoundDelayed(sound));
        }
        else
        {
            PlaySoundInternal(sound);
        }
    }

    protected virtual IEnumerator PlaySoundDelayed(ISound sound)
    {
        while (true)
        {
            yield return new WaitForSecondsRealtime(sound.Delay);
            PlaySoundInternal(sound);
            break;
        }
    }

    protected virtual void PlaySoundInternal(ISound sound)
    {
        if (!AudioClips.Any())
        {
            // When the scene is reloaded (i.e. script update), the AudioClips dictionary gets cleared by Unity while Start() is not being invoked again.
            Debug.LogWarning($"Note: The AudioClips dictionary for {GetType().Name} was empty. Trying to reload clips.");
            Load();
        }

        if (AudioClips.ContainsKey(sound.Type))
        {
            AudioClip = AudioClips[sound.Type];
            base.PlaySound();
        }
    }
}
