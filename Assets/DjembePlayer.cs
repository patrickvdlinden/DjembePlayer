using System.Collections;
using Notation;
using UnityEngine;

[RequireComponent(typeof(AudioSource))]
public class DjembePlayer : MonoBehaviour
{
    public bool IsSolist;

    public bool PlayEchauffement
    {
        get => _playEchauffement;
        set
        {
            _playEchauffement = value;
            if (value)
            {
                _playCall = false;
            }
        }
    }

    public bool PlayCall
    {
        get => _playCall;
        set
        {
            _playCall = value;
            if (value)
            {
                _playEchauffement = false;
            }
        }
    }

    AudioSource _audioSource;

    AudioClip _bassSoloClip;
    AudioClip _toneSoloClip;
    AudioClip _slapSoloClip;
    
    AudioClip _bassAccompanyClip;
    AudioClip _toneAccompanyClip;
    AudioClip _slapAccompanyClip;

    private bool _playEchauffement;
    private bool _playCall;

    void Start()
    {
        _audioSource = GetComponent<AudioSource>();
        LoadAudioClips();
    }

    private void LoadAudioClips()
    {
        _bassSoloClip = Resources.Load<AudioClip>("Audio/0101 Djembe bas");
        _toneSoloClip = Resources.Load<AudioClip>("Audio/0102 Djembe toon");
        _slapSoloClip = Resources.Load<AudioClip>("Audio/0103 Djembe slap");

        _bassAccompanyClip = Resources.Load<AudioClip>("Audio/Djembe Bass");
        _toneAccompanyClip = Resources.Load<AudioClip>("Audio/Djembe Tone");
        _slapAccompanyClip = Resources.Load<AudioClip>("Audio/Djembe Slap");
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
                _audioSource.PlayOneShot(IsSolist ? _bassSoloClip : _bassAccompanyClip, 0.5f);
                break;

            case SoundType.ToneOpenOrDounOpen:
                _audioSource.PlayOneShot(IsSolist ? _toneSoloClip : _toneAccompanyClip, 0.5f);
                break;

            case SoundType.SlapOpenOrDounClosed:
                _audioSource.PlayOneShot(IsSolist ? _slapSoloClip : _slapAccompanyClip, 0.5f);
                break;
        }
    }
}
