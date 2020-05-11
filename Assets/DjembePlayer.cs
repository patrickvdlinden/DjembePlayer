using Notation;
using UnityEngine;

[RequireComponent(typeof(AudioSource))]
public class DjembePlayer : MonoBehaviour
{
    AudioSource _audioSource;
    AudioClip _bassClip;
    AudioClip _toneClip;
    AudioClip _slapClip;

    void Start()
    {
        _audioSource = GetComponent<AudioSource>();
        _bassClip = Resources.Load<AudioClip>("Audio/0101 Djembe bas");
        _toneClip = Resources.Load<AudioClip>("Audio/0102 Djembe toon");
        _slapClip = Resources.Load<AudioClip>("Audio/0103 Djembe slap");
    }

    public void Play(SoundType sound, float channel = 0f)
    {
        _audioSource.panStereo = channel;

        switch (sound)
        {
            case SoundType.BassOpen:
                _audioSource.PlayOneShot(_bassClip, 0.5f);
                break;

            case SoundType.ToneOpenOrDounOpen:
                _audioSource.PlayOneShot(_toneClip, 0.5f);
                break;

            case SoundType.SlapOpenOrDounClosed:
                _audioSource.PlayOneShot(_slapClip, 0.5f);
                break;
        }
    }
}
