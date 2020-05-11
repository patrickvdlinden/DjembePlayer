namespace Notation
{
    public class Sound
    {
        public Sound(SoundType type, float delay = 0f)
        {
            Type = type;
            Delay = delay;
        }

        public SoundType Type { get; set; }

        public float Delay { get; set; }
    }
}
