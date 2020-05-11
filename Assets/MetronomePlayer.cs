using UnityEngine;

[RequireComponent(typeof(AudioSource))]
public class MetronomePlayer : MonoBehaviour
{
    AudioSource _audioSource;
    AudioClip _audioClip;

    private void Start()
    {
        _audioSource = GetComponent<AudioSource>();
        _audioClip = Resources.Load<AudioClip>("Audio/1001 Metronome");
    }

    public void Play(float channel = 0f)
    {
        _audioSource.panStereo = channel;
        _audioSource.PlayOneShot(_audioClip, 0.5f);
    }
}
