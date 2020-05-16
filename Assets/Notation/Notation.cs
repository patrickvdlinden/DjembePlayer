using System.Collections.Generic;

namespace Notation
{
    public class Notation : INotation
    {
        private readonly List<IMeasure> _measures = new List<IMeasure>();

        public Notation(string name, BeatType beatType, InstrumentType instrumentType)
        {
            Name = name;
            BeatType = beatType;
            InstrumentType = instrumentType;
        }

        public string Name { get; set; }

        public string RawNotation { get; set; }

        public IMeasure[] Measures => _measures.ToArray();

        public bool Repeating { get; set; }

        public BeatType BeatType { get; set; }

        public int NotesPerBeat => (int)BeatType;

        public int TotalNotes
        {
            get
            {
                var measureCount = _measures.Count;
                var notesPerMeasure = Measure.BeatCount * (int)NotesPerBeat;
                var totalNotes = notesPerMeasure * measureCount;
                return totalNotes;
            }
        }

        public InstrumentType InstrumentType { get; set; }

        public static Notation Parse(string name, string notation)
        {
            return Parse(name, notation, BeatType.Unknown, InstrumentType.Djembe);
        }

        public static Notation Parse(string name, string notation, BeatType beatType)
        {
            return Parse(name, notation, beatType, InstrumentType.Djembe);
        }

        public static Notation Parse(string name, string notation, InstrumentType instrumentType)
        {
            return Parse(name, notation, BeatType.Unknown, instrumentType);
        }

        public static Notation Parse(string name, string notation, BeatType beatType, InstrumentType instrumentType)
        {
            return (Notation)new NotationParser().Parse(name, notation, beatType, instrumentType);
        }

        public virtual IMeasure AddMeasure()
        {
            var measure = CreateMeasure();
            _measures.Add(measure);
            return measure;
        }

        public virtual INote NoteAt(float index)
        {
            var notesPerMeasure = Measure.BeatCount * (int)NotesPerBeat;
            var measureIndex = (int)(index / notesPerMeasure);
            var subnotesRemainder = index % notesPerMeasure;
            var beatIndex = (int)subnotesRemainder / (int)NotesPerBeat;
            var noteIndex = subnotesRemainder % (int)NotesPerBeat;
            var beat = _measures[measureIndex][beatIndex];
            return beat[noteIndex];
        }

        protected virtual IMeasure CreateMeasure()
        {
            return new Measure(this);
        }
    }
}
