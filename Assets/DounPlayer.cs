using Notation;
using UnityEngine;

[RequireComponent(typeof(AudioSource))]
public abstract class DounPlayer : MonoBehaviour
{
    AudioSource _audioSource;

    protected AudioClip DounBellClip { get; set; }

    protected AudioClip DounOpenClip { get; set; }

    protected AudioClip DounClosedClip { get; set; }

    void Start()
    {
        _audioSource = GetComponent<AudioSource>();
        LoadAudioClips();
    }

    protected abstract void LoadAudioClips();

    public void Play(Sound sound, float channel = 0f)
    {
        _audioSource.panStereo = channel;

        switch (sound.Type)
        {
            case SoundType.DounBell:
                _audioSource.PlayOneShot(DounBellClip);
                break;

            case SoundType.ToneOpenOrDounOpen:
                _audioSource.PlayOneShot(DounOpenClip);
                break;

            case SoundType.SlapOpenOrDounClosed:
                _audioSource.PlayOneShot(DounClosedClip);
                break;
        }
    }
}
