using System.Collections.Generic;

namespace Notation
{
    public class Song : ISong
    {
        private readonly List<ISongPart> _parts = new List<ISongPart>();

        public ISongPart[] Parts => _parts.ToArray();

        public virtual ISong AddPart(params INotation[] notations)
        {
            return AddPart(0, notations);
        }

        public virtual ISong AddPart(int repeatCount = 0, params INotation[] notations)
        {
            _parts.Add(CreateSongPart(repeatCount, notations));
            return this;
        }

        protected virtual ISongPart CreateSongPart(int repeatCount, INotation[] notations)
        {
            return new SongPart(repeatCount, notations);
        }
    }
}
