using System.Collections.Generic;

namespace Notation
{
    public class Beat : IBeat
    {
        public Beat()
        {
        }

        public virtual INote this[float index]
        {
            get
            {
                return Notes.ContainsKey(index) ? Notes[index] : null;
            }
        }

        public virtual IDictionary<float, INote> Notes { get; protected set; } = new Dictionary<float, INote>();

        public virtual void AddSound(float index, SoundType soundType, float delay = 0f)
        {
            if (!Notes.ContainsKey(index))
            {
                Notes.Add(index, CreateNote());
            }

            Notes[index].Sounds.Add(CreateSound(soundType, delay));
        }

        protected virtual INote CreateNote()
        {
            return new Note();
        }

        protected virtual ISound CreateSound(SoundType soundType, float delay)
        {
            return new Sound(soundType, delay);
        }
    }
}