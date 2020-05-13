using System.Collections.Generic;

namespace Notation
{
    public interface IBeat
    {
        INote this[float index] { get; }

        IDictionary<float, INote> Notes { get; }

        void AddSound(float index, SoundType soundType, float delay = 0f);
    }
}