using Notation;

namespace Songs
{
    public static class Soli
    {
        private static Notation.Notation _djembeCallNotation;
        private static Notation.Notation _djembeCall2Notation;
        private static Notation.Notation _djembeWaitNotation;

        private static Notation.Notation _djembeAccompany1Notation;

        private static Notation.Notation _djembePhrase1Notation;

        private static Notation.Notation _djembePhrase2Notation;

        private static Notation.Notation _djembePhrase3Notation;
        private static Notation.Notation _djembePhrase3EndNotation;

        private static Notation.Notation _djembeSolo1Notation;
        private static Notation.Notation _djembeSolo1EndNotation;

        private static Notation.Notation _djembeSolo2Notation;
        private static Notation.Notation _djembeSolo2EndNotation;

        private static Notation.Notation _djembeSolo3StartNotation;
        private static Notation.Notation _djembeSolo3Notation;
        private static Notation.Notation _djembeSolo3EndNotation;

        private static Notation.Notation _kenkeniNotation;

        private static Notation.Notation _sangbanStartNotation;
        private static Notation.Notation _sangbanStartFromBreakNotation;
        private static Notation.Notation _sangbanNotation;

        private static Notation.Notation _dununbaStartNotation;
        private static Notation.Notation _dununbaStartFromBreakNotation;
        private static Notation.Notation _dununbaNotation;

        private static Notation.Notation _djembeEchauffementCallNotation;
        private static Notation.Notation _djembeEchauffementNotation;
        private static Notation.Notation _djembeEchauffementEndNotation;

        private static Notation.Notation _sangbanEchauffementStartNotation;
        private static Notation.Notation _sangbanEchauffementNotation;
        private static Notation.Notation _sangbanEchauffementEndNotation;

        private static Notation.Notation _dununbaEchauffementNotation;

        private static Notation.Notation _djembeBreakNotation;
        private static Notation.Notation _djembeBreakWithCallNotation;
        private static Notation.Notation _djembeBreakEndNotation;

        private static Notation.Notation _kenkeniBreakNotation;
        private static Notation.Notation _kenkeniBreakEndNotation;

        private static Notation.Notation _sangbanBreakNotation;
        private static Notation.Notation _sangbanBreakEndNotation;

        private static Notation.Notation _dununbaBreakNotation;
        private static Notation.Notation _dununbaBreakEndNotation;

        private static Notation.Notation _djembeEndNotation;
        private static Notation.Notation _kenkeniEndNotation;
        private static Notation.Notation _sangbanEndNotation;
        private static Notation.Notation _dununbaEndNotation;

        public static ISong LoadSong()
        {
            LoadNotations();

            return new Song()
                .AddPart(_djembeWaitNotation)
                .AddPart(_djembeCallNotation)
                .AddPart(2, _djembeBreakEndNotation, _djembeBreakNotation, _kenkeniBreakNotation, _sangbanBreakNotation, _dununbaBreakNotation)
                .AddPart(_djembeBreakWithCallNotation, _djembeBreakNotation, _kenkeniBreakNotation, _sangbanStartFromBreakNotation, _dununbaStartFromBreakNotation)

                .AddPart(3, _djembePhrase1Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(3, _djembePhrase2Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(2, _djembePhrase3Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembePhrase3EndNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeCallNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(2, _djembeSolo1Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo1EndNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeCallNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(2, _djembeSolo2Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo2EndNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeSolo3StartNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(2, _djembeSolo3Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo3EndNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeCallNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeEchauffementCallNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeEchauffementNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanEchauffementStartNotation, _dununbaEchauffementNotation)
                .AddPart(5, _djembeEchauffementNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanEchauffementNotation, _dununbaEchauffementNotation)
                .AddPart(_djembeEchauffementEndNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanEchauffementNotation, _dununbaEchauffementNotation)

                .AddPart(_djembeCallNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanEchauffementEndNotation, _dununbaEchauffementNotation)
                .AddPart(_djembeBreakEndNotation, _djembeBreakEndNotation, _kenkeniBreakEndNotation, _sangbanBreakEndNotation, _dununbaBreakEndNotation);
        }

        private static void LoadNotations()
        {
            _djembeCallNotation = Notation.Notation.Parse("Call", "miO1.1O O1.1O O1.1O O1.1. m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembeCall2Notation = Notation.Notation.Parse("Call 2", "miX1.1X X1.1O O1X1O O1X1. m.1O1. .1.1. .1.1. .1.1. m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembeWaitNotation = Notation.Notation.Parse("Wait", "m.1.1. .1.1. .1.1. .1.1. m", BeatType.TwelveEights, InstrumentType.Djembe);

            _djembeAccompany1Notation = Notation.Notation.Parse("Accompany 1", "m>X1.1O X1.1B X1.1O X1.1. <m", BeatType.TwelveEights, InstrumentType.Djembe);

            _djembePhrase1Notation = Notation.Notation.Parse("Phrase 1", "m>O1O1X .1O1X B1.1X B1.1X <m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembePhrase2Notation = Notation.Notation.Parse("Phrase 2", "m>O1O1X .1B1X O1O1X .1B1X <m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembePhrase3Notation = Notation.Notation.Parse("Phrase 3", "m>O1O1X X1.1X X1.1X X1.1X mO1O1X X1.1X O1O1X O1O1X <m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembePhrase3EndNotation = Notation.Notation.Parse("Phrase 3 End", "m>O1O1X X1.1X X1.1X X1.1X mO1O1X X1.1. .1.1. .1.1. <m", BeatType.TwelveEights, InstrumentType.Djembe);

            _djembeSolo1Notation = Notation.Notation.Parse("Solo 1", "mB1.1. X1O1O X1.1. B1X1X mX1O1O X1O1O X1.1. B1X1X m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembeSolo1EndNotation = Notation.Notation.Parse("Solo 1 End", "mB1.1. X1O1O X1.1. B1X1X mX1O1O X1O1O X1.1. .1.1. m", BeatType.TwelveEights, InstrumentType.Djembe);

            _djembeSolo2Notation = Notation.Notation.Parse("Solo 2", "mB1.1. B1X1X O1X1O O1X1X mB1.1. B1X1X O1X1O O1X1X mB1.1. B1X1X O1X1O O1X1X mO1X1O O1X1X O1X1O O1X1X m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembeSolo2EndNotation = Notation.Notation.Parse("Solo 2 End", "mB1.1. B1X1X O1X1O O1X1X mB1.1. B1X1X O1X1O O1X1X mB1.1. B1X1X O1X1O O1X1X mO1X1O O1X1X O1X1O O1.1. m", BeatType.TwelveEights, InstrumentType.Djembe);

            _djembeSolo3StartNotation = Notation.Notation.Parse("Solo 3 Start", "miO1.1O O1.1O O1.1O B1X1X m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembeSolo3Notation = Notation.Notation.Parse("Solo 3", "mB1X1X .1o2o-O O1O1X X1.1B m.1X1X .1.1X X1.1. B1X1X m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembeSolo3EndNotation = Notation.Notation.Parse("Solo 3 End", "mB1X1X .1o2o-O O1O1X X1.1B m.1X1X .1.1X X1.1. .1.1. m", BeatType.TwelveEights, InstrumentType.Djembe);

            _kenkeniNotation = Notation.Notation.Parse("Kenkeni Base", "m>.1.1. .1O1O .1.1. .1O1O <m", BeatType.TwelveEights, InstrumentType.Kenkeni);

            _sangbanStartNotation = Notation.Notation.Parse("Sangban Start", "m>.1.1. .1.1. .1.1. vO1.1v <m", BeatType.TwelveEights, InstrumentType.Sangban);
            _sangbanStartFromBreakNotation = Notation.Notation.Parse("Sangban Start from Break", "mvO1.1v vO1.1v vO1.1vO .1vO1. mvO1.1v v1.1v v1.1v vO1.1v m", BeatType.TwelveEights, InstrumentType.Sangban);
            _sangbanNotation = Notation.Notation.Parse("Sangban Base", "m>vO1.1v .1vX1. vX1.1v vO1.1v <m", BeatType.TwelveEights, InstrumentType.Sangban);

            _dununbaStartNotation = Notation.Notation.Parse("Dununba Start", "m>.1.1. .1.1. .1.1vO vO1.1vO <m", BeatType.TwelveEights, InstrumentType.Dununba);
            _dununbaStartFromBreakNotation = Notation.Notation.Parse("Dununba Start from Break", "mvO1.1v vO1.1v vO1.1vO .1vO1. mvO1.1v v1.1v v1.1vO vO1.1vO m", BeatType.TwelveEights, InstrumentType.Dununba);
            _dununbaNotation = Notation.Notation.Parse("Dununba Base", "m>vO1.1vO .1v1. v1.1vO vO1.1vO <m", BeatType.TwelveEights, InstrumentType.Dununba);

            _djembeEchauffementCallNotation = Notation.Notation.Parse("Echauffement", "mO1O1O X1X1X .1.1. .1.1. m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembeEchauffementNotation = Notation.Notation.Parse("Echauffement", "m>O1O1O X1X1X O1O1O X1X1X <m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembeEchauffementEndNotation = Notation.Notation.Parse("Echauffement", "mO1O1O X1X1X O1O1O X1.1. m", BeatType.TwelveEights, InstrumentType.Djembe);

            _sangbanEchauffementStartNotation = Notation.Notation.Parse("Echauffement Start", "mvO1.1v .1vO1. v1.1vO .1v1. m", BeatType.TwelveEights, InstrumentType.Sangban);
            _sangbanEchauffementNotation = Notation.Notation.Parse("Echauffement", "m>vX1.1v .1vO1. vO1.1vO .1vO1. <m", BeatType.TwelveEights, InstrumentType.Sangban);
            _sangbanEchauffementEndNotation = Notation.Notation.Parse("Echauffement End", "mvX1.1v .1v1. v1.1v vO1.1v m", BeatType.TwelveEights, InstrumentType.Sangban);

            _dununbaEchauffementNotation = Notation.Notation.Parse("Echauffement", "m>vO1.1vO vO1.1vO vO1.1vO vO1.1vO <m", BeatType.TwelveEights, InstrumentType.Dununba);

            _djembeBreakNotation = Notation.Notation.Parse("Break", "m>B1X1X B1X1X B1.1O .1O1. mzX1.1. .1.1. .1.1. .1.1. <m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembeBreakWithCallNotation = Notation.Notation.Parse("Break with Call", "mB1X1X B1X1X B1.1O .1O1. mzX1.1O O1.1O O1.1O O1.1. m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembeBreakEndNotation = Notation.Notation.Parse("Break End", "mB1X1X B1X1X B1.1O .1O1. mzX1.1. .1.1. .1.1. .1.1. m", BeatType.TwelveEights, InstrumentType.Djembe);

            _kenkeniBreakNotation = Notation.Notation.Parse("Break", "m>vO1.1v vO1.1v vO1.1vO .1vO1. mvO1.1v v1.1v v1.1v v1.1v <m", BeatType.TwelveEights, InstrumentType.Kenkeni);
            _kenkeniBreakEndNotation = Notation.Notation.Parse("Break End", "mvO1.1v vO1.1v vO1.1vO .1vO1. mvO1.1. .1.1. .1.1. .1.1. m", BeatType.TwelveEights, InstrumentType.Kenkeni);

            _sangbanBreakNotation = Notation.Notation.Parse("Break", "m>vO1.1v vO1.1v vO1.1vO .1vO1. mvO1.1v v1.1v v1.1v v1.1v <m", BeatType.TwelveEights, InstrumentType.Sangban);
            _sangbanBreakEndNotation = Notation.Notation.Parse("Break End", "mvO1.1v vO1.1v vO1.1vO .1vO1. mvO1.1. .1.1. .1.1. .1.1. m", BeatType.TwelveEights, InstrumentType.Sangban);

            _dununbaBreakNotation = Notation.Notation.Parse("Break", "m>vO1.1v vO1.1v vO1.1vO .1vO1. mvO1.1v v1.1v v1.1v v1.1v <m", BeatType.TwelveEights, InstrumentType.Dununba);
            _dununbaBreakEndNotation = Notation.Notation.Parse("Break End", "mvO1.1v vO1.1v vO1.1vO .1vO1. mvO1.1. .1.1. .1.1. .1.1. m", BeatType.TwelveEights, InstrumentType.Dununba);

            _djembeEndNotation = Notation.Notation.Parse("End", "miX1.1. .1.1. .1.1. .1.1. m", InstrumentType.Djembe);
            _kenkeniEndNotation = Notation.Notation.Parse("End", "mvO1.1. .1.1. .1.1. .1.1. m", InstrumentType.Kenkeni);
            _sangbanEndNotation = Notation.Notation.Parse("End", "mvO1.1. .1.1. .1.1. .1.1. m", InstrumentType.Sangban);
            _dununbaEndNotation = Notation.Notation.Parse("End", "mvO1.1. .1.1. .1.1. .1.1. m", InstrumentType.Dununba);
        }
    }
}
