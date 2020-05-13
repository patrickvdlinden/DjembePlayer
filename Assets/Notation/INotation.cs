namespace Notation
{
    public interface INotation
    {
        IMeasure[] Measures { get; }

        bool Repeating { get; set; }

        BeatType BeatType { get; set; }

        int NotesPerBeat { get; }

        int TotalNotes { get; }

        InstrumentType InstrumentType { get; set; }

        IMeasure AddMeasure();

        INote NoteAt(float index);

    }
}
