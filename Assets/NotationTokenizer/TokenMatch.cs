namespace NotationTokenizer
{
    public class TokenMatch : ITokenMatch
    {
        public TokenMatch(bool isMatch)
        {
            IsMatch = isMatch;
        }

        public TokenMatch(bool isMatch, TokenType tokenType, string value, string remainingText)
            : this(isMatch)
        {
            TokenType = tokenType;
            Value = value;
            RemainingText = remainingText;
        }

        public bool IsMatch { get; }

        public TokenType TokenType { get; }

        public string Value { get; }

        public string RemainingText { get; }
    }
}
