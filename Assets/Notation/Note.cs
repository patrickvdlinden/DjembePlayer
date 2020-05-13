using System.Collections.Generic;

namespace Notation
{
    public class Note : INote
    {
        public IList<ISound> Sounds { get; } = new List<ISound>();
    }
}
