using System.Collections.Generic;

namespace Notation
{
    public interface INote
    {
        IList<ISound> Sounds { get; }
    }
}
