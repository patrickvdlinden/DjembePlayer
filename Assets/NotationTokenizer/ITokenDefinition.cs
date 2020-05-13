using System.Text.RegularExpressions;

namespace NotationTokenizer
{
    public interface ITokenDefinition
    {
        Regex Regex { get; }

        TokenType TokenType { get; }

        ITokenMatch Match(string inputString);
    }
}
