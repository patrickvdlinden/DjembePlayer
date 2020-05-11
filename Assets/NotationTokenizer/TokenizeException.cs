using System;

namespace NotationTokenizer
{
    public class TokenizeException : Exception
    {
        public TokenizeException(int position, char character)
            : base()
        {
            Position = position;
            Character = character;
        }

        public int Position { get; private set; }

        public char Character { get; private set; }

        public override string Message => $"Tokenize error at position {Position}: Unknown character '{Character}'.";
    }
}
