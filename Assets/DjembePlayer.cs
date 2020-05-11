using System.Collections;
using Notation;
using UnityEngine;

[RequireComponent(typeof(AudioSource))]
public class DjembePlayer : MonoBehaviour
{
    public bool Solo;
    public bool Echauffement;
    public bool Call;

    AudioSource _audioSource;
    AudioClip _bassClip;
    AudioClip _toneClip;
    AudioClip _slapClip;

    void Start()
    {
        _audioSource = GetComponent<AudioSource>();

        if (Solo)
        {
            _bassClip = Resources.Load<AudioClip>("Audio/0101 Djembe bas");
            _toneClip = Resources.Load<AudioClip>("Audio/0102 Djembe toon");
            _slapClip = Resources.Load<AudioClip>("Audio/0103 Djembe slap");
        }
        else
        {
            _bassClip = Resources.Load<AudioClip>("Audio/Djembe Bass");
            _toneClip = Resources.Load<AudioClip>("Audio/Djembe Tone");
            _slapClip = Resources.Load<AudioClip>("Audio/Djembe Slap");

        }
    }

    public void Play(Sound sound, float channel = 0f)
    {
        if (sound.Delay > 0f)
        {
            StartCoroutine(PlayDelayed(sound, channel));
        }
        else
        {
            PlayInternal(sound, channel);
        }
    }
        
    private IEnumerator PlayDelayed(Sound sound, float channel = 0f)
    {
        while (true)
        {
            yield return new WaitForSeconds(sound.Delay);
            PlayInternal(sound, channel);
            break;
        }
    }

    private void PlayInternal(Sound sound, float channel = 0f)
    {
        _audioSource.panStereo = channel;

        switch (sound.Type)
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
