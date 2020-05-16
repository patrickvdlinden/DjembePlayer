using System.Collections.Generic;

namespace Notation
{
    public interface ISongPart
    {
        INotation[] Notations { get; }

        int TotalNotes { get; }

        int RepeatCount { get; }

        ISongPart AddNotation(INotation notation);
    }
}
