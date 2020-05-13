using System;
using System.Collections.Generic;

namespace NotationTokenizer
{
    public class Tokenizer : ITokenizer
    {
        public IList<ITokenDefinition> TokenDefinitions { get; protected set; } = new List<ITokenDefinition>();

        public Tokenizer()
        {
            TokenDefinitions = CreateTokenDefinitions();
        }

        public virtual IList<IToken> Tokenize(string input)
        {
            var tokens = new List<IToken>();
            var remainingText = input;
            var position = 0;

            while (!string.IsNullOrEmpty(remainingText))
            {
                var match = FindMatch(remainingText);
                if (match.IsMatch)
                {
                    tokens.Add(CreateToken(match));
                    remainingText = match.RemainingText;
                    position = input.Length - remainingText.Length;
                }
                else
                {
                    throw new TokenizeException(position, remainingText[0]);
                }
            }

            // End-token.
            tokens.Add(CreateToken(FindMatch(string.Empty)));

            return tokens;
        }

        protected virtual IList<ITokenDefinition> CreateTokenDefinitions()
        {
            var enumType = typeof(TokenType);
            var tokenTypes = Enum.GetValues(enumType);
            var tokenDefinitions = new List<ITokenDefinition>();

            foreach (TokenType tokenType in tokenTypes)
            {
                var patternAttribute = tokenType.GetAttributeOfType<PatternAttribute>();
                if (patternAttribute == null)
                {
                    continue;
                }

                tokenDefinitions.Add(new TokenDefinition(tokenType, $"^{patternAttribute.Pattern}"));
            }

            return tokenDefinitions;
        }

        protected virtual IToken CreateToken(ITokenMatch match)
        {
            return new Token(match.TokenType, match.Value);
        }

        protected virtual ITokenMatch FindMatch(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return new TokenMatch(true, TokenType.End, string.Empty, string.Empty);
            }

            foreach (var tokenDefinition in TokenDefinitions)
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