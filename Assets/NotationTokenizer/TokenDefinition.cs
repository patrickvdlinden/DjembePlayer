using System.Text.RegularExpressions;

namespace NotationTokenizer
{
    public class TokenDefinition
    {
        private Regex _regex;
        private readonly TokenType _tokenType;

        public TokenDefinition(TokenType tokenType, string regexPattern)
        {
            _tokenType = tokenType;
            _regex = new Regex(regexPattern);
        }

        public TokenMatch Match(string inputString)
        {
            var match = _regex.Match(inputString);
            if (match.Success)
            {
                var remainingText = string.Empty;
                if (match.Length != inputString.Length)
                {
                    remainingText = inputString.Substring(match.Length);
                }

                return new TokenMatch(true, _tokenType, match.Value, remainingText);
            }

            return new TokenMatch(false);
        }
    }
}
