namespace Notation
{
    public interface INotationParser
    {
        INotation Parse(string input);

        INotation Parse(string input, BeatType beatType);

        INotation Parse(string input, InstrumentType instrumentType);

        INotation Parse(string input, BeatType beatType, InstrumentType instrumentType);
    }
}
