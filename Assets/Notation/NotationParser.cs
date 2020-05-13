using System;
using System.Collections.Generic;
using System.Linq;
using NotationTokenizer;

namespace Notation
{
    public class NotationParser : INotationParser
    {
        public NotationParser()
        {
        }

        public virtual INotation Parse(string input)
        {
            return Parse(input, BeatType.Unknown, InstrumentType.Any);
        }

        public virtual INotation Parse(string input, BeatType beatType)
        {
            return Parse(input, beatType, InstrumentType.Any);
        }

        public virtual INotation Parse(string input, InstrumentType instrumentType)
        {
            return Parse(input, BeatType.Unknown, instrumentType);
        }

        public virtual INotation Parse(string input, BeatType beatType, InstrumentType instrumentType)
        {
            EnsureInput(input);

            var tokenizer = CreateTokenizer();
            var tokens = tokenizer.Tokenize(input);
            var notation = CreateNotation(beatType, instrumentType);

            EnsureTokens(tokens);
            EnsureMeasureLines(tokens);

            Parse(tokens, notation, beatType, instrumentType);

            return notation;
        }

        protected virtual INotation CreateNotation(BeatType beatType, InstrumentType instrumentType)
        {
            return new Notation(beatType, instrumentType);
        }

        protected virtual ITokenizer CreateTokenizer()
        {
            return new Tokenizer();
        }

        protected virtual BeatType DetectBeatType(IList<IToken> tokens)
        {
            var beatSeparatorIndexStart = tokens.FindIndex(t => t.TokenType == TokenType.NextBeat);
            var beatSeparatorIndexEnd = tokens.FindIndex(beatSeparatorIndexStart + 1, t => t.TokenType == TokenType.NextBeat);
            var notesPerBeat = 0f;
            for (var i = beatSeparatorIndexStart; i < beatSeparatorIndexEnd; i++)
            {
                var token = tokens[i].TokenType;
                switch (token)
                {
                    case TokenType.ConnectionLine:
                        notesPerBeat++;
                        break;
                    case TokenType.ConnectionLineHalf:
                        notesPerBeat += .5f;
                        break;
                    case TokenType.ConnectionLineTwoThird:
                        notesPerBeat += .6667f;
                        break;
                }
            }

            if ((int)notesPerBeat != (int)BeatType.TwelveEights && (int)notesPerBeat != (int)BeatType.FourEights)
            {
                return BeatType.Unknown;
            }

            return (BeatType)((int)notesPerBeat + 1);
        }

        protected virtual bool DetectRepeating(IList<IToken> tokens)
        {
            return tokens.Count >= 4 && tokens[1].TokenType == TokenType.RepeatStart && tokens[tokens.Count - 1].TokenType == TokenType.RepeatEnd;
        }

        protected virtual void EnsureMeasureLines(IList<IToken> tokens)
        {
            if (tokens[0].TokenType != TokenType.MeasureLine || tokens[tokens.Count - 2].TokenType != TokenType.MeasureLine)
            {
                throw new ParseException("Invalid syntax: Notation should always start and end with a measure line.");
            }
        }

        protected virtual void EnsureMeasures(IMeasure[] measures, int tokenIndex, IToken token)
        {
            if (measures == null)
            {
                throw new ParseException("Invalid syntax: Found note before measure line.", tokenIndex, token);
            }
        }

        protected virtual void EnsureInput(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                throw new ArgumentException("The input cannot be null or empty.", nameof(input));
            }
        }

        protected virtual void EnsureTokens(IList<IToken> tokens)
        {
            if (tokens == null || !tokens.Any())
            {
                throw new ParseException("Invalid syntax: No tokens were parsed.");
            }
        }

        protected virtual void Parse(IList<IToken> tokens, INotation notation, BeatType beatType, InstrumentType instrumentType)
        {
            notation.Repeating = DetectRepeating(tokens);
            notation.BeatType = beatType == BeatType.Unknown ? DetectBeatType(tokens) : beatType;
            notation.InstrumentType = instrumentType;

            var tokenIndex = 0;
            var measureIndex = -1;
            var lineIndex = 0;
            var beatIndex = 0;
            var noteIndex = 0f;
            TokenType? flamStart = null;
            IMeasure[] measures = null;

            while (tokens.Any())
            {
                var token = tokens.First();
                tokens.RemoveAt(0);

                switch (token.TokenType)
                {
                    case TokenType.MeasureLine:
                        beatIndex = 0;
                        noteIndex = 0;

                        if (!tokens.Any() || tokens.First().TokenType == TokenType.NextBeatNewLine || tokens.First().TokenType == TokenType.End)
                        {
                            break;
                        }

                        measureIndex++;
                        notation.AddMeasure();
                        measures = notation.Measures;
                        break;

                    case TokenType.NextBeat:
                        beatIndex++;
                        noteIndex = 0;
                        break;

                    case TokenType.NextBeatHalf:
                        if (noteIndex % .5f == 0f)
                        {
                            beatIndex++;
                            noteIndex = 0f;
                        }
                        else
                        {
                            noteIndex += .5f;
                        }
                        break;

                    case TokenType.NextBeatTwoThird:
                        if (noteIndex % .6667f == 0f)
                        {
                            beatIndex++;
                            noteIndex = 0f;
                        }
                        else
                        {
                            noteIndex += .6667f;
                        }
                        break;

                    case TokenType.NextBeatNewLine:
                        lineIndex++;
                        beatIndex = 0;
                        noteIndex = 0;
                        break;

                    case TokenType.OpenBassFlam:
                    case TokenType.OpenToneFlam:
                    case TokenType.OpenSlapFlam:
                        EnsureMeasures(measures, tokenIndex, token);
                        flamStart = token.TokenType;
                        break;

                    case TokenType.OpenBass:
                    case TokenType.OpenBassSmall:
                    case TokenType.OpenTone:
                    case TokenType.OpenToneSmall:
                    case TokenType.OpenSlap:
                    case TokenType.OpenSlapSmall:
                        EnsureMeasures(measures, tokenIndex, token);
                        if (flamStart != null)
                        {
                            measures[measureIndex].Beats[beatIndex].AddSound(noteIndex, TokenToSound(instrumentType, flamStart.Value));
                            measures[measureIndex].Beats[beatIndex].AddSound(noteIndex, TokenToSound(instrumentType, token.TokenType), .05f);
                            flamStart = null;
                        }
                        else
                        {
                            measures[measureIndex].Beats[beatIndex].AddSound(noteIndex, TokenToSound(instrumentType, token.TokenType));
                        }

                        break;

                    case TokenType.DounBell:
                        measures[measureIndex].Beats[beatIndex].AddSound(noteIndex, TokenToSound(instrumentType, token.TokenType));
                        break;

                    case TokenType.ConnectionLine:
                        noteIndex++;
                        break;

                    case TokenType.ConnectionLineHalf:
                        noteIndex += .5f;
                        break;

                    case TokenType.ConnectionLineTwoThird:
                        noteIndex += .6667f;
                        break;
                }

                if (notation.BeatType != BeatType.Unknown && noteIndex > notation.NotesPerBeat * 2)
                {
                    noteIndex = 0f;
                    beatIndex++;
                }

                tokenIndex++;
            }
        }

        protected virtual SoundType TokenToSound(InstrumentType instrumentType, TokenType tokenType1)
        {
            switch (tokenType1)
            {
                case TokenType.OpenBass:
                case TokenType.OpenBassFlam:
                    if (instrumentType == InstrumentType.Djembe || instrumentType == InstrumentType.Any)
                    {
                        return SoundType.BassOpen;
                    }
                    else if (instrumentType == InstrumentType.Krin)
                    {
                        return SoundType.KrinLow;
                    }

                    return SoundType.None;

                case TokenType.OpenTone:
                case TokenType.OpenToneFlam:
                    if (instrumentType == InstrumentType.Djembe || instrumentType == InstrumentType.Any)
                    {
                        return SoundType.ToneOpen;
                    }
                    else if (instrumentType == InstrumentType.Kenkeni
                        || instrumentType == InstrumentType.Sangban
                        || instrumentType == InstrumentType.Dununba)
                    {
                        return SoundType.DounOpen;
                    }
                    else if (instrumentType == InstrumentType.Krin)
                    {
                        return SoundType.KrinHigh;
                    }
                    else if (instrumentType == InstrumentType.Rattle)
                    {
                        return SoundType.Rattle;
                    }

                    return SoundType.None;

                case TokenType.OpenSlap:
                case TokenType.OpenSlapFlam:
                    if (instrumentType == InstrumentType.Djembe || instrumentType == InstrumentType.Any)
                    {
                        return SoundType.SlapOpen;
                    }
                    else if (instrumentType == InstrumentType.Kenkeni
                        || instrumentType == InstrumentType.Sangban
                        || instrumentType == InstrumentType.Dununba)
                    {
                        return SoundType.DounClosed;
                    }
                    else if (instrumentType == InstrumentType.Krin)
                    {
                        return SoundType.KrinSide;
                    }

                    return SoundType.None;

                case TokenType.DounBell:
                    if (instrumentType == InstrumentType.Any
                        || instrumentType == InstrumentType.Kenkeni
                        || instrumentType == InstrumentType.Sangban
                        || instrumentType == InstrumentType.Dununba)
                    {
                        return SoundType.DounBell;
                    }

                    return SoundType.None;

                default:
                    return SoundType.None;
            }
        }
    }
}
