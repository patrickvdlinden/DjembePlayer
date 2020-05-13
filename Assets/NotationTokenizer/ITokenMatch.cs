namespace NotationTokenizer
{
    public interface ITokenMatch
    {
        bool IsMatch { get; }

        TokenType TokenType { get; }

        string Value { get; }

        string RemainingText { get; }
    }
}
