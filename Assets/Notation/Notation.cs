using System.Collections.Generic;
using System.Linq;
using NotationTokenizer;

namespace Notation
{
    public class Notation
    {
        private List<Measure> _measures = new List<Measure>();

        public Notation()
        {
        }

        public Measure[] Measures => _measures.ToArray();

        public bool Repeating { get; set; }

        public int NotesPerBeat { get; set; }

        public int TotalNotes
        {
            get
            {
                var measureCount = _measures.Count;
                var notesPerMeasure = Measure.BeatCount * NotesPerBeat;
                var totalNotes = notesPerMeasure * measureCount;
                return totalNotes;
            }
        }

        public static Notation Parse(string rawNotation)
        {
            var tokenizer = new Tokenizer();
            var tokens = tokenizer.Tokenize(rawNotation);
            var notation = new Notation();

            if (!tokens.Any())
            {
                return null;
            }

            if (tokens[0].TokenType != TokenType.MeasureLine || tokens[tokens.Count - 2].TokenType != TokenType.MeasureLine)
            {
                throw new System.Exception("Notation is invalid; it should always start and end with a measure line.");
            }

            if (tokens.Count >= 4 && tokens[1].TokenType == TokenType.RepeatStart && tokens[tokens.Count - 1].TokenType == TokenType.RepeatEnd)
            {
                notation.Repeating = true;
            }

            var tokenIndex = 0;
            var measureIndex = -1;
            var lineIndex = 0;
            var beatIndex = 0;
            var noteIndex = 0f;
            TokenType? flamStart = null;
            Measure[] measures = null;

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

            notation.NotesPerBeat = notesPerBeat == 0f ? 4 : (int)notesPerBeat + 1;

            while (tokens.Any())
            {
                var token = tokens.First();
                tokens.RemoveAt(0);

                switch (token.TokenType)
                {
                    case TokenType.MeasureLine:
                        beatIndex = 0;
                        noteIndex = 0;

                        if (!tokens.Any() || tokens.First().TokenType == TokenType.NextBeatNewLine)
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
                            measures[measureIndex].Beats[beatIndex].AddSound(noteIndex, TokenToSound(flamStart.Value));
                            measures[measureIndex].Beats[beatIndex].AddSound(noteIndex + .1f, TokenToSound(token.TokenType));
                        }
                        else
                        {
                            measures[measureIndex].Beats[beatIndex].AddSound(noteIndex, TokenToSound(token.TokenType));
                        }
                        
                        break;

                    case TokenType.DounBell:
                        measures[measureIndex].Beats[beatIndex].AddSound(noteIndex, TokenToSound(token.TokenType));
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

                if (notesPerBeat > 0 && noteIndex > notesPerBeat * 2)
                {
                    noteIndex = 0f;
                    beatIndex++;
                }

                tokenIndex++;
            }

            return notation;
        }

        public Measure AddMeasure()
        {
            var measure = new Measure(this);
            _measures.Add(measure);
            return measure;
        }

        public Note NoteAt(float index)
        {
            var measureCount = _measures.Count;
            var subnotesPerBeat = NotesPerBeat * 2;
            var subnotesPerMeasure = Measure.BeatCount * subnotesPerBeat;

            var measureIndex = (int)index / subnotesPerMeasure;
            var subnotesRemainder = index % subnotesPerMeasure;
            var beatIndex = (int)subnotesRemainder / subnotesPerBeat;
            var subnoteIndex = subnotesRemainder % subnotesPerBeat;


            // index: 76
            // measureCount: 4
            // beatsCount: 16
            // subnotesPerBeat: 8
            // subnotesPerMeasure: 32
            // totalSubnotes: 128
            // measureIndex: 2 (2.375)
            // subnotesRemainder: 12
            // beatIndex: 1
            // subnoteIndex = 4
            var beat = _measures[measureIndex][beatIndex];
            return beat[subnoteIndex / 2];
        }

        private static void EnsureMeasures(Measure[] measures, int tokenIndex, Token token)
        {
            if (measures == null)
            {
                throw new ParseException("Found note before measure line; invalid syntax.", tokenIndex, token);
            }
        }

        private static SoundType TokenToSound(TokenType tokenType1)
        {
            switch (tokenType1)
            {
                case TokenType.OpenBass:
                case TokenType.OpenBassFlam:
                    return SoundType.BassOpen;


                case TokenType.OpenTone:
                case TokenType.OpenToneFlam:
                    return SoundType.ToneOpenOrDounOpen;

                case TokenType.OpenSlap:
                case TokenType.OpenSlapFlam:
                    return SoundType.SlapOpenOrDounClosed;

                case TokenType.DounBell:
                    return SoundType.DounBell;

                default:
                    return SoundType.None;
            }

        }
    }
}
