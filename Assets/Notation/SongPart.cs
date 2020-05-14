using System.Collections.Generic;
using System.Linq;

namespace Notation
{
    public class SongPart : ISongPart
    {
        private readonly IList<INotation> _notations = new List<INotation>();

        public SongPart()
            : this(0)
        {
        }

        public SongPart(int repeatCount)
            : this(repeatCount, null)
        {
        }

        public SongPart(params INotation[] notations)
            : this(0, notations)
        {
        }

        public SongPart(int repeatCount, params INotation[] notations)
        {
            RepeatCount = repeatCount;

            if (notations != null && notations.Any())
            {
                _notations = notations.ToList();
            }
        }

        public INotation[] Notations => _notations.ToArray();

        public int RepeatCount { get; }

        public ISongPart AddNotation(INotation notation)
        {
            _notations.Add(notation);
            return this;
        }
    }
}
