using UnityEngine;

[RequireComponent(typeof(AudioSource))]
public abstract class SoundPlayer : MonoBehaviour
{
    public float PanStereo = 0f;
    public float VolumeScale = 0.5f;

    protected AudioSource AudioSource;
    protected AudioClip AudioClip;

    public virtual void PlaySound()
    {
        AudioSource.panStereo = PanStereo;
        AudioSource.PlayOneShot(AudioClip, VolumeScale);
    }

    public void Start()
    {
        OnStart();
        Load();
    }

    protected void Load()
    {
        AudioSource = GetComponent<AudioSource>();
        OnLoad();
    }

    protected virtual void OnStart()
    {
    }

    protected abstract void OnLoad();
}
