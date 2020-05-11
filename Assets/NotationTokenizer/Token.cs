namespace NotationTokenizer
{
    public class Token
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

        public Token Clone()
        {
            return new Token(TokenType, Value);
        }
    }
}
