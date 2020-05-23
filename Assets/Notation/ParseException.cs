using System;
using NotationTokenizer;

namespace Notation
{
    public class ParseException : Exception
    {
        public ParseException(string message)
            : base(message)
        {
        }

        public ParseException(string message, string notationName)
           : base($"{message} (Notation: {notationName})")
        {
        }

        public ParseException(string message, string notationName, int index, IToken token)
            : base($"{message} (Notation: {notationName}, At: {index}, Token: {token.TokenType} ({token.Value}))")
        {
            Index = index;
            Token = token;
        }

        public int Index { get; }

        public IToken Token { get; }
    }
}
