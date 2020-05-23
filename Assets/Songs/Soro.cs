using Notation;

namespace Songs
{
    public static class Soro
    {
        private static Notation.Notation _djembeCallNotation;
        private static Notation.Notation _djembeWaitNotation;

        private static Notation.Notation _sangbanStartNotation;
        private static Notation.Notation _dununbaStartNotation;

        private static Notation.Notation _djembeAccompany1Notation;
        private static Notation.Notation _djembeAccompany1EndNotation;

        private static Notation.Notation _djembeAccompany2Notation;
        private static Notation.Notation _djembeAccompany2EndNotation;

        private static Notation.Notation _kenkeniNotation;
        private static Notation.Notation _sangbanNotation;
        private static Notation.Notation _dununbaNotation;

        private static Notation.Notation _djembeSolo1Notation;
        private static Notation.Notation _djembeSolo2Notation;

        private static Notation.Notation _djembeSolo3StartNotation;
        private static Notation.Notation _djembeSolo3Notation;
        private static Notation.Notation _djembeSolo3EndNotation;

        private static Notation.Notation _djembeSolo4Notation;

        private static Notation.Notation _djembeSolo5Notation;

        private static Notation.Notation _djembeLanding1Notation;
        private static Notation.Notation _djembeLanding2Notation;
        private static Notation.Notation _djembeLanding3Notation;

        private static Notation.Notation _djembeEchauffementNotation;
        private static Notation.Notation _djembeEchauffementEndNotation;

        private static Notation.Notation _sangbanEchauffementNotation;
        private static Notation.Notation _sangbanEchauffementEndNotation;

        private static Notation.Notation _dununbaEchauffementNotation;
        private static Notation.Notation _dununbaEchauffementEndNotation;

        private static Notation.Notation _djembeEndNotation;
        private static Notation.Notation _kenkeniEndNotation;
        private static Notation.Notation _sangbanEndNotation;
        private static Notation.Notation _dununbaEndNotation;

        public static ISong LoadSong()
        {
            LoadNotations();

            // TODO: Rename Song to SongDefinition and add Song as a new class.
            // Each SongDefinition describes how a song is played for ONE instrument only. The Song contains all the definitions.
            // Else, it is not possible to have different parts playing for the same instrument type. For example; There can be 
            // multiple djembe's, krins or even multiple douns of the same type playing different parts.
            return new Song()
                .AddPart(_djembeWaitNotation)
                .AddPart(_djembeCallNotation, _sangbanStartNotation, _dununbaStartNotation)
                .AddPart(_djembeAccompany1Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeAccompany1Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeAccompany1Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeAccompany1EndNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeCallNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeEchauffementNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(1, _djembeEchauffementNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanEchauffementNotation, _dununbaEchauffementNotation)
                .AddPart(_djembeEchauffementEndNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanEchauffementNotation, _dununbaEchauffementNotation)
                .AddPart(_djembeCallNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanEchauffementEndNotation, _dununbaEchauffementEndNotation)

                .AddPart(_djembeWaitNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeWaitNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeSolo1Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo1Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo1Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo1Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeCallNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeSolo2Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo2Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo2Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo2Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeLanding1Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeSolo3StartNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo3Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo3EndNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeLanding3Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeWaitNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeSolo4Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo4Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeWaitNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeSolo5Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeWaitNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeSolo5Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeLanding2Notation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeWaitNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)

                .AddPart(_djembeCallNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeEchauffementNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(5, _djembeEchauffementNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanEchauffementNotation, _dununbaEchauffementNotation)
                .AddPart(_djembeEchauffementEndNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanEchauffementNotation, _dununbaEchauffementNotation)
                .AddPart(_djembeCallNotation, _djembeAccompany2Notation, _kenkeniNotation, _sangbanEchauffementEndNotation, _dununbaEchauffementEndNotation)
                .AddPart(_djembeEndNotation, _djembeEndNotation, _kenkeniEndNotation, _sangbanEndNotation, _dununbaEndNotation);
        }

        private static void LoadNotations()
        {
            _djembeCallNotation = Notation.Notation.Parse("Call", "miX1.1X1X .1X1.1O O1.1X1. O1O1.1. m", InstrumentType.Djembe);
            _djembeWaitNotation = Notation.Notation.Parse("Wait", "m.1.1.1. .1.1.1. .1.1.1. .1.1.1. m", InstrumentType.Djembe);
            _sangbanStartNotation = Notation.Notation.Parse("Start", "m.1.1.1. .1.1.1. .1.1.1. vO1.1v1. m", InstrumentType.Sangban);
            _dununbaStartNotation = Notation.Notation.Parse("Start", "m.1.1.1. .1.1.1. .1.1vO1. vO1.1vO1. m", InstrumentType.Dununba);

            _djembeAccompany1Notation = Notation.Notation.Parse("Accompany 1", "m>B1.1O1O .1.1X1. B1.1O1O .1B1X1. <m", InstrumentType.Djembe);
            _djembeAccompany1EndNotation = Notation.Notation.Parse("Accompany 1 End", "m>B1.1O1O .1.1X1. B1.1O1O .1.1.1. <m", InstrumentType.Djembe);

            _djembeAccompany2Notation = Notation.Notation.Parse("Accompany 2", "m>X1.1.1X X1.1O1O X1.1.1X X1.1O1O <m", InstrumentType.Djembe);
            _djembeAccompany2EndNotation = Notation.Notation.Parse("Accompany 2 End", "m>X1.1.1X X1.1O1O X1.1.1X X1.1.1. <m", InstrumentType.Djembe);

            _kenkeniNotation = Notation.Notation.Parse("Base", "m>vO1.1v1. vO1.1v1. vO1.1v1. vO1.1v1. <m", InstrumentType.Kenkeni);
            _sangbanNotation = Notation.Notation.Parse("Base", "m>vO1.1v1. v1.1vX1. vX1.1v1. vO1.1v1. <m", InstrumentType.Sangban);
            _dununbaNotation = Notation.Notation.Parse("Base", "m>vO1.1vO1vO .1v1v1. v1.1vO1. vO1.1vO1. <m", InstrumentType.Dununba);

            _djembeSolo1Notation = Notation.Notation.Parse("Solo 1", "m>X1O1O1X O1O1X1. .1.1X1. X1.1.1.<m", InstrumentType.Djembe);
            _djembeSolo2Notation = Notation.Notation.Parse("Solo 2", "m>.1.1iX1. x2x-x2x-X1X X1O1.1. .1.1.1.<m", BeatType.FourEights, InstrumentType.Djembe);

            _djembeSolo3StartNotation = Notation.Notation.Parse("Solo 3 Start", "miX1.1X1X .1X1.1O O1.1X1. O1O1.1O m", InstrumentType.Djembe);
            _djembeSolo3Notation = Notation.Notation.Parse("Solo 3", "m>O1.1X1X X1.1.1O O1.1X1X X1.1.1O mO1.1X1X X1.1.1O O1.1X1X X1.1.1. mO1O1.1O O1.1O1O .1O1O1. O1O1.1O mO1.1.1x2x=X1X1O1O X1X1X1. .1.1.1O <m", BeatType.FourEights, InstrumentType.Djembe);
            _djembeSolo3EndNotation = Notation.Notation.Parse("Solo 3 End", "mO1.1X1X X1.1.1O O1.1X1X X1.1.1O mO1.1X1X X1.1.1O O1.1X1X X1.1.1. mO1O1.1O O1.1O1O .1O1O1. O1O1.1O mO1.1.1x2x=X1X1O1O X1X1X1. .1.1.1. m", BeatType.FourEights, InstrumentType.Djembe);

            _djembeSolo4Notation = Notation.Notation.Parse("Solo 4", "mO1O1X1X .1.1X1X O1O1X1X .1X1.1X mO1O1X1X .1.1X1X O1O1X1X .1X1.1X mO1O1X1X .1.1X1X O1O1X1X .1.1X1X mO1O1X1X .1X1iX1. X1X1.1X iX1.1X1X m.1X1X1X .1O1O1X O1O1X1. x2o-o2o-O1O mX1X1.1. .1.1.1. .1.1.1. .1.1.1. m", BeatType.FourEights, InstrumentType.Djembe);

            _djembeSolo5Notation = Notation.Notation.Parse("Solo 5", "mO1X1.1x2x=X1X1O1O X1.1.1. .1.1.1. mO1X1.1x2x=X1X1O1O X1.1.1. .1.1.1. mO1X1.1x2x=X1X1O1O X1.1.1x2x=X1X1O1O mX1.1.1x2x=X1X1O1O .1X1X1X .1X1iX1. m", BeatType.FourEights, InstrumentType.Djembe);

            _djembeLanding1Notation = Notation.Notation.Parse("Landing 1", "miX1.1X1X .1O1O1X O1O1X1. x2o-o2o-O1O mX1X1.1. .1.1.1. .1.1.1. .1.1.1. m", InstrumentType.Djembe);
            _djembeLanding2Notation = Notation.Notation.Parse("Landing 2", "m.1.1X1zX .1X1zX1. X1zX1.1X zX1.1X1. m", InstrumentType.Djembe);
            _djembeLanding3Notation = Notation.Notation.Parse("Landing 3", "mzX1.1X1X .1X1O1. X1O1.1X O1.1X1. m", InstrumentType.Djembe);

            _djembeEchauffementNotation = Notation.Notation.Parse("Echauffement", "m>O1O1O1X X1X1X1X O1O1O1X X1X1X1X <m", InstrumentType.Djembe);
            _djembeEchauffementEndNotation = Notation.Notation.Parse("Echauffement End", "mO1O1O1X X1X1X1X O1O1O1. zX1.1.1. m", InstrumentType.Djembe);

            _sangbanEchauffementNotation = Notation.Notation.Parse("Echauffement", "m>vO1.1v1vO .1v1vO1. v1vO1.1v vO1.1v1. <m", InstrumentType.Sangban);
            _sangbanEchauffementEndNotation = Notation.Notation.Parse("Echauffement End", "mv1vO1.1vO .1vO1.1vO vO1.1v1. vO1.1v1. m", InstrumentType.Sangban);

            _dununbaEchauffementNotation = Notation.Notation.Parse("Echauffement", "m>vO1vO1.1vO .1vO1.1vO vO1.1vO1vO .1vO1vO1. <m", InstrumentType.Dununba);
            _dununbaEchauffementEndNotation = Notation.Notation.Parse("Echauffement End", "mvO1vO1.1vO .1vO1.1vO vO1.1vO1. vO1.1vO1. m", InstrumentType.Dununba);

            _djembeEndNotation = Notation.Notation.Parse("End", "miX1.1.1. .1.1.1. .1.1.1. .1.1.1. m", InstrumentType.Djembe);
            _kenkeniEndNotation = Notation.Notation.Parse("End", "mvO1.1.1. .1.1.1. .1.1.1. .1.1.1. m", InstrumentType.Kenkeni);
            _sangbanEndNotation = Notation.Notation.Parse("End", "mvO1.1.1. .1.1.1. .1.1.1. .1.1.1. m", InstrumentType.Sangban);
            _dununbaEndNotation = Notation.Notation.Parse("End", "mvO1.1.1. .1.1.1. .1.1.1. .1.1.1. m", InstrumentType.Dununba);
        }
    }
}
