using Notation;
    
namespace Songs
{
    public static class Kadan
    {
        private static Notation.Notation _djembeCallNotation;
        private static Notation.Notation _djembeIntroBreakNotation;
        private static Notation.Notation _djembeAccompany1Notation;
        private static Notation.Notation _djembeAccompany2Notation;
        private static Notation.Notation _djembeAccompany3Notation;
        private static Notation.Notation _djembeEndNotation;

        private static Notation.Notation _dununbaIntroBreakNotation;
        private static Notation.Notation _dununbaNotation;
        private static Notation.Notation _dununbaVariationNotation;
        private static Notation.Notation _dununbaEndNotation;

        private static Notation.Notation _kenkeniIntroBreakNotation;
        private static Notation.Notation _kenkeniNotation;

        private static Notation.Notation _sangbanIntroBreakNotation;
        private static Notation.Notation _sangbanNotation;
        private static Notation.Notation _sangbanEndNotation;

        public static ISong LoadSong()
        {
            LoadNotations();

            var song = new Song().AddPart(_djembeCallNotation)
                .AddPart(_djembeIntroBreakNotation, _djembeIntroBreakNotation, _kenkeniIntroBreakNotation, _sangbanIntroBreakNotation, _dununbaIntroBreakNotation);

            for (var i = 0; i < 10; i++)
            {
                song.AddPart(1, _djembeAccompany2Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation);
            }

            return song;
        }

        private static void LoadNotations()
        {
            _djembeCallNotation = Notation.Notation.Parse("Call", "m.o2o2O.1O O1.1O O1.1O O1.1. m", InstrumentType.Djembe);
            _djembeIntroBreakNotation = Notation.Notation.Parse("Intro break", "mX1X1X X1.1. X1X1X X1.1. mO1.1. O1.1. O1.1. O1.1. m\r\nmX1X1X X1.1. X1X1X X1.1. mO1.1. O1.1. O1.1. .1.1. m", InstrumentType.Djembe);
            _djembeAccompany1Notation = Notation.Notation.Parse("Accompany 1", "m>X1.1O X1.1. X1.1O X1.1B <m", InstrumentType.Djembe);
            _djembeAccompany2Notation = Notation.Notation.Parse("Accompany 2", "m>X1.1. X1O1O X1.1B X1O1O <m", InstrumentType.Djembe);
            _djembeAccompany3Notation = Notation.Notation.Parse("Accompany 3", "m>B1.1X .1O1X .1.1X .1O1X <m", InstrumentType.Djembe);
            //_djembeEndNotation = Notation.Notation.Parse("Call", "miO1.1.1. .1.1.1. .1.1.1. .1.1.1. m", InstrumentType.Djembe);

            _kenkeniIntroBreakNotation = Notation.Notation.Parse("Kenkeni Into break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1.vO1vO1vO vO1.1.m.1.1vO .1.1. .1.1. .1.1.m", InstrumentType.Kenkeni);
            _kenkeniNotation = Notation.Notation.Parse("Kenkeni Base", "m>.1v.1vO .1vO1vO .1v.1vO .1vO1vO <m", InstrumentType.Kenkeni);

            _sangbanIntroBreakNotation = Notation.Notation.Parse("Sangban Into break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1.vO1vO1vO vO1.1.m.1.1vO .1.1. .1.1. .1.1.m", InstrumentType.Sangban);
            _sangbanNotation = Notation.Notation.Parse("Sangban Base", "m>vO1.1v. vX1.1v. vO1.1v. vX1.1v. <m", InstrumentType.Sangban);
            //_sangbanEndNotation = Notation.Notation.Parse("Sangban Base", "mvO1.1.1. .1.1.1. .1.1.1. .1.1.1.m", InstrumentType.Sangban);

            _dununbaIntroBreakNotation = Notation.Notation.Parse("Dununba Intro break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. mvO1.1. vO1.1. vO1.1. vO1.1. m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. mvO1.1. vO1.1vO vO1.1vO vO1.1. m", InstrumentType.Dununba);
            _dununbaNotation = Notation.Notation.Parse("Dununba Base", "m>v.1.1v v1.1vO vO1.1vO vO1.1v. <m", InstrumentType.Dununba);
            //_dununbaVariationNotation = Notation.Notation.Parse("Dununba Variation", "mv1.1vO1vO .1v.1v.1. .v1.1vO1. v.1vO1.1v. mvO1.1v1vO .1v.1v.1. .v1.1vO1. v.1.1v.1. m", InstrumentType.Dununba);
            //_dununbaEndNotation = Notation.Notation.Parse("Dununba Base", "mvO1.1.1. .1.1.1. .1.1.1. .1.1.1. m", InstrumentType.Dununba);
        }
    }
}
