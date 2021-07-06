using Notation;
    
namespace Songs
{
    public static class Djagbe
    {
        private static Notation.Notation _djembeCallNotation;
        private static Notation.Notation _djembeEndNotation;
        private static Notation.Notation _dununbaNotation;
        private static Notation.Notation _dununbaVariationNotation;
        private static Notation.Notation _dununbaEndNotation;
        private static Notation.Notation _sangbanStartNotation;
        private static Notation.Notation _sangbanNotation;
        private static Notation.Notation _sangbanEndNotation;

        public static Notation.ISong LoadSong()
        {
            LoadNotations();

            var song = new Song().AddPart(_djembeCallNotation, _sangbanStartNotation);
            for (var i = 0; i < 10; i++)
            {
                song.AddPart(1, _dununbaNotation, _sangbanNotation)
                    .AddPart(_dununbaVariationNotation, _sangbanNotation);
            }

            song.AddPart(_djembeCallNotation, _dununbaNotation, _sangbanNotation)
                .AddPart(_djembeEndNotation, _dununbaEndNotation, _sangbanEndNotation);

            return song;
        }

        private static void LoadNotations()
        {
            _djembeCallNotation = Notation.Notation.Parse("Call", "miO1.1O1O .1O1.1O O1.1O1. O1.1.1. m", InstrumentType.Djembe);
            _djembeEndNotation = Notation.Notation.Parse("Call", "miO1.1.1. .1.1.1. .1.1.1. .1.1.1. m", InstrumentType.Djembe);

            _sangbanStartNotation = Notation.Notation.Parse("Sangban Base", "m.1.1.1. .1.1.1. .1.1.1. .1.1vX1.m", InstrumentType.Sangban);
            _sangbanNotation = Notation.Notation.Parse("Sangban Base", "m>vX1.1v.1vO .1vO1.1v. vO1.1vO1. v.1.1vX1.<m", InstrumentType.Sangban);
            _sangbanEndNotation = Notation.Notation.Parse("Sangban Base", "mvO1.1.1. .1.1.1. .1.1.1. .1.1.1.m", InstrumentType.Sangban);

            _dununbaNotation = Notation.Notation.Parse("Dununba Base", "m>v1.1vO1vO .1v.1v.1. .v1.1vO1. v.1.1v.1. <m", InstrumentType.Dununba);
            _dununbaVariationNotation = Notation.Notation.Parse("Dununba Variation", "mv1.1vO1vO .1v.1v.1. .v1.1vO1. v.1vO1.1v. mvO1.1v1vO .1v.1v.1. .v1.1vO1. v.1.1v.1. m", InstrumentType.Dununba);
            _dununbaEndNotation = Notation.Notation.Parse("Dununba Base", "mvO1.1.1. .1.1.1. .1.1.1. .1.1.1. m", InstrumentType.Dununba);
        }
    }
}
