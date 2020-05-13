using System.Collections.Generic;

namespace NotationTokenizer
{
    public interface ITokenizer
    {
        IList<ITokenDefinition> TokenDefinitions { get; }

        IList<IToken> Tokenize(string input);
    }
}
