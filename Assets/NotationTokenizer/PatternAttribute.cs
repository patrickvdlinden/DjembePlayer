using System;

namespace NotationTokenizer
{
    public class PatternAttribute : Attribute
    {
        public PatternAttribute(string pattern)
        {
            Pattern = pattern;
        }

        public string Pattern { get; }
    }
}
