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

        public virtual INotation Parse(string name, string input)
        {
            return Parse(name, input, BeatType.Unknown, InstrumentType.Djembe);
        }

        public virtual INotation Parse(string name, string input, BeatType beatType)
        {
            return Parse(name, input, beatType, InstrumentType.Djembe);
        }

        public virtual INotation Parse(string name, string input, InstrumentType instrumentType)
        {
            return Parse(name, input, BeatType.Unknown, instrumentType);
        }

        public virtual INotation Parse(string name, string input, BeatType beatType, InstrumentType instrumentType)
        {
            EnsureInput(input);

            var tokenizer = CreateTokenizer();
            var tokens = tokenizer.Tokenize(input);

            if (beatType == BeatType.Unknown)
            {
                beatType = DetectBeatType(tokens);
            }

            var notation = CreateNotation(name, beatType, instrumentType);
            notation.RawNotation = input;

            EnsureTokens(name, tokens);
            EnsureMeasureLines(name, tokens);

            Parse(tokens, notation, beatType, instrumentType);

            return notation;
        }

        protected virtual INotation CreateNotation(string name, BeatType beatType, InstrumentType instrumentType)
        {
            return new Notation(name, beatType, instrumentType);
        }

        protected virtual ITokenizer CreateTokenizer()
        {
            return new Tokenizer();
        }

        protected virtual BeatType DetectBeatType(IList<IToken> tokens)
        {
            var beatSeparatorIndexStart = tokens.FindIndex(t => t.TokenType == TokenType.NextBeat);
            var beatSeparatorIndexEnd = tokens.FindIndex(beatSeparatorIndexStart + 1, t => t.TokenType == TokenType.NextBeat);
            var notesPerBeat = 1f;
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

            return (BeatType)(int)notesPerBeat;
        }

        protected virtual bool DetectRepeating(IList<IToken> tokens)
        {
            return tokens.Count >= 4 && tokens[1].TokenType == TokenType.RepeatStart && tokens[tokens.Count - 3].TokenType == TokenType.RepeatEnd;
        }

        protected virtual void EnsureMeasureLines(string notationName, IList<IToken> tokens)
        {
            if (tokens[0].TokenType != TokenType.MeasureLine || tokens[tokens.Count - 2].TokenType != TokenType.MeasureLine)
            {
                throw new ParseException("Invalid syntax: Notation should always start and end with a measure line.", notationName);
            }
        }

        protected virtual void EnsureMeasures(string notationName, IMeasure[] measures, int tokenIndex, IToken token)
        {
            if (measures == null)
            {
                throw new ParseException("Invalid syntax: Found note before measure line.", notationName, tokenIndex, token);
            }
        }

        protected virtual void EnsureInput(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                throw new ArgumentException("The input cannot be null or empty.", nameof(input));
            }
        }

        protected virtual void EnsureTokens(string notationName, IList<IToken> tokens)
        {
            if (tokens == null || !tokens.Any())
            {
                throw new ParseException("Invalid syntax: No tokens were parsed.", notationName);
            }
        }

        protected virtual void Parse(IList<IToken> tokens, INotation notation, BeatType beatType, InstrumentType instrumentType)
        {
            notation.Repeating = DetectRepeating(tokens);
            notation.BeatType = beatType;
            notation.InstrumentType = instrumentType;

            var tokenIndex = 0;
            var measureIndex = -1;
            var lineIndex = 0;
            var beatIndex = 0;
            var noteIndex = 0f;
            TokenType? flamStart = null;
            IMeasure[] measures = null;

            var tokensToParse = tokens.ToList();
            while (tokensToParse.Any())
            {
                var token = tokensToParse.First();
                tokensToParse.RemoveAt(0);

                switch (token.TokenType)
                {
                    case TokenType.MeasureLine:
                        beatIndex = 0;
                        noteIndex = 0;

                        if (!tokensToParse.Any() || tokensToParse.First().TokenType == TokenType.NextBeatNewLine || tokensToParse.First().TokenType == TokenType.End)
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
                        EnsureMeasures(notation.Name, measures, tokenIndex, token);
                        flamStart = token.TokenType;
                        break;

                    case TokenType.OpenBass:
                    case TokenType.OpenBassSmall:
                    case TokenType.OpenTone:
                    case TokenType.OpenToneSmall:
                    case TokenType.OpenSlap:
                    case TokenType.OpenSlapSmall:
                        EnsureMeasures(notation.Name, measures, tokenIndex, token);
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
                    case TokenType.DoubleConnectionLineHalf:
                        noteIndex += .5f;
                        break;

                    case TokenType.ConnectionLineTwoThird:
                    case TokenType.DoubleConnectionLineTwoThird:
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
                case TokenType.OpenBassSmall:
                case TokenType.OpenBassFlam:
                    if (instrumentType == InstrumentType.Djembe)
                    {
                        return SoundType.BassOpen;
                    }
                    else if (instrumentType == InstrumentType.Krin)
                    {
                        return SoundType.KrinLow;
                    }

                    return SoundType.None;

                case TokenType.OpenTone:
                case TokenType.OpenToneSmall:
                case TokenType.OpenToneFlam:
                    if (instrumentType == InstrumentType.Djembe)
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
                case TokenType.OpenSlapSmall:
                case TokenType.OpenSlapFlam:
                    if (instrumentType == InstrumentType.Djembe)
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
                    if (instrumentType == InstrumentType.Kenkeni
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
