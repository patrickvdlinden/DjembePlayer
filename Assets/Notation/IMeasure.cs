namespace Notation
{
    public interface IMeasure
    {
        IBeat this[int index] { get; }

        INotation Notation { get; }

        IBeat[] Beats { get; }
    }
}
