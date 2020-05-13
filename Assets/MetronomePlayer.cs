using UnityEngine;

[RequireComponent(typeof(AudioSource))]
public class MetronomePlayer : MonoBehaviour
{
    private AudioSource _audioSource;
    private AudioClip _audioClip;

    public float PanStereo = 0f;
    public float VolumeScale = 0.5f;

    private void Start()
    {
        _audioSource = GetComponent<AudioSource>();
        _audioClip = Resources.Load<AudioClip>("Audio/1001 Metronome");
    }

    public void PlaySound()
    {
        _audioSource.panStereo = PanStereo;
        _audioSource.PlayOneShot(_audioClip, VolumeScale);
    }
}
