namespace NotationTokenizer
{
    public interface IToken
    {
        TokenType TokenType { get; set; }

        string Value { get; set; }

        IToken Clone();
    }
}
