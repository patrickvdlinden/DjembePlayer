using System.Text.RegularExpressions;

namespace NotationTokenizer
{
    public class TokenDefinition : ITokenDefinition
    {
        public TokenDefinition(TokenType tokenType, string regexPattern)
        {
            TokenType = tokenType;
            Regex = new Regex(regexPattern);
        }

        public virtual Regex Regex { get; }

        public virtual TokenType TokenType { get; }

        public virtual ITokenMatch Match(string inputString)
        {
            var match = Regex.Match(inputString);
            if (match.Success)
            {
                var remainingText = string.Empty;
                if (match.Length != inputString.Length)
                {
                    remainingText = inputString.Substring(match.Length);
                }

                return new TokenMatch(true, TokenType, match.Value, remainingText);
            }

            return new TokenMatch(false);
        }
    }
}
