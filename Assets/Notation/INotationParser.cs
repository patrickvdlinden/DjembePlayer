namespace Notation
{
    public interface INotationParser
    {
        INotation Parse(string name, string input);

        INotation Parse(string name, string input, BeatType beatType);

        INotation Parse(string name, string input, InstrumentType instrumentType);

        INotation Parse(string name, string input, BeatType beatType, InstrumentType instrumentType);
    }
}
