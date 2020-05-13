using System.Collections;
using System.Collections.Generic;
using Notation;
using UnityEngine;

[RequireComponent(typeof(AudioSource))]
public abstract class InstrumentPlayer : MonoBehaviour
{
    private AudioSource _audioSource;

    public float PanStereo = 0f;
    public float VolumeScale = 0.5f;

    protected Dictionary<SoundType, AudioClip> AudioClips { get; private set; } = new Dictionary<SoundType, AudioClip>();

    public void Start()
    {
        OnStart();
    }

    protected virtual void OnStart()
    {
        _audioSource = GetComponent<AudioSource>();
        LoadAudioClips();
    }

    protected abstract void LoadAudioClips();

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
            yield return new WaitForSeconds(sound.Delay);
            PlaySoundInternal(sound);
            break;
        }
    }

    protected virtual void PlaySoundInternal(ISound sound)
    {
        _audioSource.panStereo = PanStereo;

        if (AudioClips.ContainsKey(sound.Type))
        {
            _audioSource.PlayOneShot(AudioClips[sound.Type], VolumeScale);
        }
    }
}
