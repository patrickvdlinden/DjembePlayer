using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NotationTokenizer
{
    public class Tokenizer
    {
        private readonly List<TokenDefinition> _tokenDefinitions = new List<TokenDefinition>();

        public Tokenizer()
        {
            var enumType = typeof(TokenType);
            var tokenTypes = Enum.GetValues(enumType);
            foreach (TokenType tokenType in tokenTypes)
            {
                var patternAttribute = tokenType.GetAttributeOfType<PatternAttribute>();
                if (patternAttribute == null)
                {
                    continue;
                }

                _tokenDefinitions.Add(new TokenDefinition(tokenType, $"^{patternAttribute.Pattern}"));
            }
        }

        public List<Token> Tokenize(string input)
        {
            var tokens = new List<Token>();
            var remainingText = input;
            var position = 0;

            while (!string.IsNullOrEmpty(remainingText))
            {
                var match = FindMatch(remainingText);
                if (match.IsMatch)
                {
                    tokens.Add(new Token(match.TokenType, match.Value));
                    remainingText = match.RemainingText;
                    position = input.Length - remainingText.Length;
                }
                else
                {
                    throw new TokenizeException(position, remainingText[0]);
                }
            }

            tokens.Add(new Token(TokenType.End, string.Empty));

            return tokens;
        }

        private TokenMatch FindMatch(string input)
        {
            foreach (var tokenDefinition in _tokenDefinitions)
            {
                var match = tokenDefinition.Match(input);
                if (match.IsMatch)
                {
                    return match;
                }
            }

            return new TokenMatch(false);
        }
    }
}