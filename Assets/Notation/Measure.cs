using System.Collections.Generic;

namespace Notation
{
    public class Measure
    {
        public const int BeatCount = 4;

        private List<Beat> _beats = new List<Beat>();

        public Measure(Notation notation)
        {
            Notation = notation;
            _beats = new List<Beat>(BeatCount);

            for (var i = 0; i < BeatCount; i++)
            {
                _beats.Add(new Beat());
            }
        }

        public Beat this[int index]
        {
            get
            {
                return Beats[index];
            }
        }

        public Notation Notation { get; }

        public Beat[] Beats => _beats.ToArray();
    }
}
