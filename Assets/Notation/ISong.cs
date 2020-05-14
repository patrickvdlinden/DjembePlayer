using System.Collections.Generic;

namespace Notation
{
    public interface ISong
    {
        ISongPart[] Parts { get; }

        ISong AddPart(params INotation[] notations);

        ISong AddPart(int repeatCount, params INotation[] notations);
    }
}
