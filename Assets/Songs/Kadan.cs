using Notation;
    
namespace Songs
{
    public static class Kadan
    {
        private static Notation.Notation _djembeCallNotation;
        private static Notation.Notation _djembeWaitNotation;
        private static Notation.Notation _djembeEchauffementNotation;
        private static Notation.Notation _djembeEchauffementEndNotation;
        private static Notation.Notation _djembeIntroBreakNotation;
        private static Notation.Notation _djembeBreakNotation;
        private static Notation.Notation _djembeAccompany1Notation;
        private static Notation.Notation _djembeAccompany2Notation;
        private static Notation.Notation _djembeAccompany2EndNotation;
        private static Notation.Notation _djembeAccompany3Notation;
        private static Notation.Notation _djembeSolo1Notation;
        private static Notation.Notation _djembeSolo2Notation;
        private static Notation.Notation _djembeSolo3Notation;
        private static Notation.Notation _djembeSolo4Notation;

        private static Notation.Notation _dununbaIntroBreakNotation;
        private static Notation.Notation _dununbaBreakNotation;
        private static Notation.Notation _dununbaWaitNotation;
        private static Notation.Notation _dununbaNotation;

        private static Notation.Notation _kenkeniIntroBreakNotation;
        private static Notation.Notation _kenkeniBreakNotation;
        private static Notation.Notation _kenkeniNotation;

        private static Notation.Notation _sangbanIntroBreakNotation;
        private static Notation.Notation _sangbanBreakNotation;
        private static Notation.Notation _sangbanWaitNotation;
        private static Notation.Notation _sangbanNotation;

        public static ISong LoadSong()
        {
            LoadNotations();

            var song = new Song().AddPart(_djembeCallNotation)
                .AddPart(_djembeIntroBreakNotation, _djembeIntroBreakNotation, _kenkeniIntroBreakNotation, _sangbanIntroBreakNotation, _dununbaIntroBreakNotation)
                .AddPart(3, _djembeAccompany2Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeAccompany2EndNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeCallNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(3, _djembeEchauffementNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeEchauffementEndNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeCallNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeBreakNotation, _djembeBreakNotation, _kenkeniBreakNotation, _sangbanBreakNotation, _dununbaBreakNotation)
                .AddPart(_djembeWaitNotation, _djembeWaitNotation, _kenkeniNotation, _sangbanWaitNotation, _dununbaWaitNotation)
                .AddPart(1, _djembeSolo1Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(1, _djembeSolo2Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(3, _djembeSolo3Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(1, _djembeSolo4Notation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(3, _djembeEchauffementNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeEchauffementEndNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeCallNotation, _djembeAccompany1Notation, _kenkeniNotation, _sangbanNotation, _dununbaNotation)
                .AddPart(_djembeBreakNotation, _djembeBreakNotation, _kenkeniBreakNotation, _sangbanBreakNotation, _dununbaBreakNotation);

            return song;
        }

        private static void LoadNotations()
        {
            _djembeCallNotation = Notation.Notation.Parse("Call", "m.o2o2O.1O O1.1O O1.1O O1.1. m", InstrumentType.Djembe);
            _djembeWaitNotation = Notation.Notation.Parse("Wait", "m.1.1. .1.1. .1.1. .1.1. m", InstrumentType.Djembe);
            _djembeEchauffementNotation = Notation.Notation.Parse("Call", "mO1O1O X1X1X O1O1O X1X1X m", InstrumentType.Djembe);
            _djembeEchauffementEndNotation = Notation.Notation.Parse("Call end", "mO1O1O X1X1X O1O1O X1.1. m", InstrumentType.Djembe);
            _djembeIntroBreakNotation = Notation.Notation.Parse("Intro break", "mX1X1X X1.1. X1X1X X1.1. mO1.1. O1.1. O1.1. O1.1. m\r\nmX1X1X X1.1. X1X1X X1.1. mO1.1. O1.1. O1.1. .1.1. m", InstrumentType.Djembe);
            _djembeAccompany1Notation = Notation.Notation.Parse("Accompany 1", "m>X1.1O X1.1. X1.1O X1.1B <m", InstrumentType.Djembe);
            _djembeAccompany2Notation = Notation.Notation.Parse("Accompany 2", "m>X1.1. X1O1O X1.1B X1O1O <m", InstrumentType.Djembe);
            _djembeAccompany2EndNotation = Notation.Notation.Parse("Accompany 2 end", "m>X1.1. X1O1O X1.1B X1.1. <m", InstrumentType.Djembe);
            _djembeAccompany3Notation = Notation.Notation.Parse("Accompany 3", "m>B1.1X .1O1X .1.1X .1O1X <m", InstrumentType.Djembe);
            _djembeBreakNotation = Notation.Notation.Parse("Break", "mX1X1X X1.1. X1X1X X1.1. mO1.1. O1.1. O1.1. O1.1. m\r\nmX1X1X X1.1. X1X1X X1.1. mO1.1. O1.1. O1.1. O1.1. m\r\nmX1X1X X1.1O .1O1. X1X1X mX1.1O .1O1. X1X1X X1.1O m\r\nm.1X1. O1.1X .1O1. X1X1X mX1.1O .1O1. .iXR1.1. .1.1. m", InstrumentType.Djembe);
            _djembeSolo1Notation = Notation.Notation.Parse("Solo 1", "m.1.1. .1.1. .1.1. .1Or1Ol mxr2xl2Xr1Xl Xr1.1. .1.1. .1Or1Ol m\r\nmxr2xl2Xr1Xl Xr1.1. .1.1. .1Or1Ol mxr2xl2Xr1Xl xr2xl2Xr1Xl xr2xl2Xr1Xl .1Or1Ol m\r\nmxr2xl2Xr1Xl Xr1.1. .1.1. .1.1.m", InstrumentType.Djembe);
            _djembeSolo2Notation = Notation.Notation.Parse("Solo 2", "m.1.1. .1.1. .1.1. .1.1Xl mor2ol2Or1Ol Or1Xl1. .1.1. .1.1Xl m\r\nmor2ol2Or1Ol Or1Xl1. .1.1. .1.1.m", InstrumentType.Djembe);
            _djembeSolo3Notation = Notation.Notation.Parse("Solo 3", "mor2ol2Or1Xl or2ol2Or1X Xr1Xl1. Xl1Xr1Xl m.1.1. .1.1. .1.1. .1.1. m", BeatType.TwelveEights, InstrumentType.Djembe);
            _djembeSolo4Notation = Notation.Notation.Parse("Solo 4", "m.1.1. .1.1. .1.1. .1Xr1Xl mOr1Ol1. .1Xr1Xl Or1Ol1. .1Xr1Xl m\r\nmOr1Ol1. .1Xr1Xl Or1Ol1. .1.1.m", InstrumentType.Djembe);

            _kenkeniIntroBreakNotation = Notation.Notation.Parse("Kenkeni Into break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1.m.1.1vO .1.1. .1.1. .1.1.m", InstrumentType.Kenkeni);
            _kenkeniNotation = Notation.Notation.Parse("Kenkeni Base", "m>.1v.1vO .1vO1vO .1v.1vO .1vO1vO <m", InstrumentType.Kenkeni);
            _kenkeniBreakNotation = Notation.Notation.Parse("Kenkeni Break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. .1.1. vO1vO1vO mvO1.1. .1.1. vO1vO1vO vO1.1. m\r\nm.1vO1. .1.1vO .1.1. vO1vO1vO mvO1.1 .1.1. vO1.1. .1.1. m", InstrumentType.Kenkeni);

            _sangbanIntroBreakNotation = Notation.Notation.Parse("Sangban Into break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1. .1.1. .1.1.m", InstrumentType.Sangban);
            _sangbanNotation = Notation.Notation.Parse("Sangban Base", "m>vO1.1v. vX1.1v. vO1.1v. vX1.1v. <m", InstrumentType.Sangban);
            _sangbanWaitNotation = Notation.Notation.Parse("Kenkeni Wait", "m.1.1. .1.1. .1.1. .1.1.m", InstrumentType.Sangban);
            _sangbanBreakNotation = Notation.Notation.Parse("Sangban Break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. m.1.1vO .1.1vO .1.1vO .1.1vO m\r\nmvO1vO1vO vO1.1. .1.1. vO1vO1vO mvO1.1. .1.1. vO1vO1vO vO1.1. m\r\nm.1vO1. .1.1vO .1.1. vO1vO1vO mvO1.1 .1.1. vO1.1. .1.1. m", InstrumentType.Sangban);

            _dununbaIntroBreakNotation = Notation.Notation.Parse("Dununba Intro break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. mvO1.1. vO1.1. vO1.1. vO1.1. m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. mvO1.1. vO1.1vO vO1.1vO vO1.1. m", InstrumentType.Dununba);
            _dununbaNotation = Notation.Notation.Parse("Dununba Base", "m>v.1.1v v1.1vO vO1.1vO vO1.1v. <m", InstrumentType.Dununba);
            _dununbaWaitNotation = Notation.Notation.Parse("Kenkeni Wait", "m.1.1. .1.1. .1.1. .1.1.m", InstrumentType.Dununba);
            _dununbaBreakNotation = Notation.Notation.Parse("Dununba Break", "mvO1vO1vO vO1.1. vO1vO1vO vO1.1. mvO1.1. vO1.1. vO1.1. vO1.1. m\r\nmvO1vO1vO vO1.1. vO1vO1vO vO1.1. mvO1.1. vO1.1. vO1.1. vO1.1. m\r\nm.1.1. .1.1vO .1vO1. .1.1. m.1.1vO .1vO1. .1.1. .1.1vO m\r\nm.1.1. vO1.1. .1vO1. .1.1. m.1.1vO .1vO1. vO1.1. .1.1. m", InstrumentType.Dununba);
        }
    }
}
