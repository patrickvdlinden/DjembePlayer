namespace NotationTokenizer
{
    public enum TokenType
    {
        Unknown,

        [Pattern("B")]
        OpenBass,

        [Pattern("b")]
        OpenBassSmall,

        [Pattern("n")]
        OpenBassFlam,

        [Pattern("O")]
        OpenTone,

        [Pattern("o")]
        OpenToneSmall,

        [Pattern("i")]
        OpenToneFlam,

        [Pattern("X")]
        OpenSlap,

        [Pattern("x")]
        OpenSlapSmall,

        [Pattern("z")]
        OpenSlapFlam,

        [Pattern("v")]
        DounBell,

        [Pattern("\\.")]
        Pulse,

        [Pattern("1")]
        ConnectionLine,

        [Pattern("-")]
        ConnectionLineHalf,

        [Pattern("_")]
        ConnectionLineTwoThird,

        [Pattern("2")]
        DoubleConnectionLineHalf,

        [Pattern("3")]
        DoubleConnectionLineTwoThird,

        [Pattern("l")]
        HandPositionLeft,

        [Pattern("r")]
        HandPositionRight,

        [Pattern("L")]
        HandPositionLeftRight,

        [Pattern("R")]
        HandPositionRightLeft,

        [Pattern("m")]
        MeasureLine,

        [Pattern(">")]
        RepeatStart,

        [Pattern("<")]
        RepeatEnd,

        [Pattern("p")]
        StartingPoint,

        [Pattern("#")]
        TripletSignature,

        [Pattern(" ")]
        NextBeat,

        [Pattern("=")]
        NextBeatHalf,

        [Pattern("\\+")]
        NextBeatTwoThird,

        [Pattern("\\r\\n|\\n")]
        NextBeatNewLine,

        End
    }
}
