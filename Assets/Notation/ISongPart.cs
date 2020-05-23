using System.Collections.Generic;

namespace Notation
{
    public interface ISongPart
    {
        INotation[] Notations { get; }

        int TotalNotes { get; }

        int RepeatCount { get; }

        int NotesPerBeat { get; }

        ISongPart AddNotation(INotation notation);
    }
}
