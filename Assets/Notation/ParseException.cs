using System;
using NotationTokenizer;

namespace Notation
{
    public class ParseException : Exception
    {
        private readonly string _message;

        public ParseException(string message, int index, Token token)
            : base()
        {
            _message = message;
            Index = index;
            Token = token;
        }

        public int Index { get; }

        public Token Token { get; }

        public override string Message => $"{_message} (At: {Index}, Token: {Token.TokenType} ({Token.Value}))";
    }
}
