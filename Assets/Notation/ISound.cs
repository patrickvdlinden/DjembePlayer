namespace Notation
{
    public interface ISound
    {
        SoundType Type { get; set; }

        float Delay { get; set; }
    }
}
