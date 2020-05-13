using System.Collections.Generic;

namespace Notation
{
    public class Measure : IMeasure
    {
        public const int BeatCount = 4;

        private List<IBeat> _beats = new List<IBeat>();

        public Measure(INotation notation)
        {
            Notation = notation;

            _beats = new List<IBeat>(BeatCount);
            for (var i = 0; i < BeatCount; i++)
            {
                _beats.Add(CreateBeat());
            }
        }

        public virtual IBeat this[int index]
        {
            get
            {
                return Beats[index];
            }
        }

        public virtual INotation Notation { get; }

        public virtual IBeat[] Beats => _beats.ToArray();

        protected virtual IBeat CreateBeat()
        {
            return new Beat();
        }
    }
}
