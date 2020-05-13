namespace NotationTokenizer
{
    public class Token : IToken
    {
        public Token(TokenType tokenType)
            : this(tokenType, string.Empty)
        {
        }

        public Token(TokenType tokenType, string value)
        {
            TokenType = tokenType;
            Value = value;
        }

        public TokenType TokenType { get; set; }

        public string Value { get; set; }

        public static Token Empty => new Token(TokenType.Unknown);

        public IToken Clone()
        {
            return new Token(TokenType, Value);
        }
    }
}
