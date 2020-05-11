using System;
using System.Collections.Generic;

namespace Notation
{
    public class Beat
    {
        private Dictionary<float, Note> _notes = new Dictionary<float, Note>();

        public Beat()
        {
        }

        public Note this[float index]
        {
            get
            {
                return _notes.ContainsKey(index) ? _notes[index] : null;
            }
        }

        public void AddSound(float index, SoundType soundType, float delay = 0f)
        {
            if (!_notes.ContainsKey(index))
            {
                _notes.Add(index, new Note());
            }

            _notes[index].Sounds.Add(new Sound(soundType, delay));
        }
    }
}