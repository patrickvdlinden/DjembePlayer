using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Notation;
using UnityEngine;

[RequireComponent(typeof(AudioListener))]
public class NotationPlayer : MonoBehaviour
{
    public const int DefaultBpm = 100;

    public GameObject Djembe;
    public GameObject Djembe2;
    public GameObject Kenkeni;
    public GameObject Sangban;
    public GameObject Dununba;
    public GameObject Metronome;

    Coroutine _coroutine;
    DjembePlayer _djembePlayer1;
    DjembePlayer _djembePlayer2;
    KenkeniPlayer _kenkeniPlayer;
    SangbanPlayer _sangbanPlayer;
    DununbaPlayer _dununbaPlayer;
    MetronomePlayer _metronomePlayer;

    int _bpm = DefaultBpm;
    string _bpmValue = DefaultBpm.ToString();

    void Start()
    {
        _djembePlayer1 = Djembe.GetComponent<DjembePlayer>();
        _djembePlayer2 = Djembe2.GetComponent<DjembePlayer>();
        _kenkeniPlayer = Kenkeni.GetComponent<KenkeniPlayer>();
        _sangbanPlayer = Sangban.GetComponent<SangbanPlayer>();
        _dununbaPlayer = Dununba.GetComponent<DununbaPlayer>();
        _metronomePlayer = Metronome.GetComponent<MetronomePlayer>();
        Debug.Log("started");
    }

    void Update()
    {
    }

    IEnumerator WaitAndPlay()
    {
        //var notation = Notation.Notation.Parse("m>O1O1O .1Xr1. Or1O1O X1X1. <m");
        var djembeCallNotation                  = Notation.Notation.Parse("Call",                   "miX1.1X1X .1X1.1O O1.1X1. O1O1.1. m",                  InstrumentType.Djembe);
        var djembeWaitNotation                  = Notation.Notation.Parse("Wait",                   "m.1.1.1. .1.1.1. .1.1.1. .1.1.1. m",                   InstrumentType.Djembe);
        var sangbanStartNotation                = Notation.Notation.Parse("Start",                  "m.1.1.1. .1.1.1. .1.1.1. vO1.1v1. m",                  InstrumentType.Sangban);
        var dununbaStartNotation                = Notation.Notation.Parse("Start",                  "m.1.1.1. .1.1.1. .1.1vO1. vO1.1vO1. m",                InstrumentType.Dununba);

        var djembeAccompany2Notation            = Notation.Notation.Parse("Accompany 1",            "m>B1.1O1O .1.1X1. B1.1O1O .1B1X1. <m",                 InstrumentType.Djembe);
        var djembeAccompany2EndNotation         = Notation.Notation.Parse("Accompany 1 End",        "m>B1.1O1O .1.1X1. B1.1O1O .1.1.1. <m",                 InstrumentType.Djembe);

        var djembeAccompany1Notation            = Notation.Notation.Parse("Accompany 2",            "m>X1.1.1X X1.1O1O X1.1.1X X1.1O1O <m",                 InstrumentType.Djembe);
        var djembeAccompany1EndNotation         = Notation.Notation.Parse("Accompany 2 End",        "m>X1.1.1X X1.1O1O X1.1.1X X1.1.1. <m",                 InstrumentType.Djembe);

        var kenkeniNotation                     = Notation.Notation.Parse("Base",                   "m>vO1.1v1. vO1.1v1. vO1.1v1. vO1.1v1. <m",             InstrumentType.Kenkeni);
        var sangbanNotation                     = Notation.Notation.Parse("Base",                   "m>vO1.1v1. v1.1vX1. vX1.1v1. vO1.1v1. <m",             InstrumentType.Sangban);
        var dununbaNotation                     = Notation.Notation.Parse("Base",                   "m>vO1.1vO1vO .1v1v1. v1.1vO1. vO1.1vO1. <m",           InstrumentType.Dununba);

        var djembeSolo1Notation                 = Notation.Notation.Parse("Solo 1",                 "m>X1O1O1X O1O1X1. .1.1X1. X1.1.1.<m",                  InstrumentType.Djembe);
        var djembeSolo2Notation                 = Notation.Notation.Parse("Solo 2",                 "m>.1.1iX1. x2x-x2x-X1X X1O1.1. .1.1.1.<m",             BeatType.FourEights, InstrumentType.Djembe);

        var djembeSolo3StartNotation            = Notation.Notation.Parse("Solo 3 Start",           "m.1.1.1. .1.1.1. .1.1.1. .1.1.1O m",                   InstrumentType.Djembe);
        var djembeSolo3Notation                 = Notation.Notation.Parse("Solo 3",                 "m>O1.1X1X X1.1.1O O1.1X1X X1.1.1O mO1.1X1X X1.1.1O O1.1X1X X1.1.1. mO1O1.1O O1.1O1O .1O1O1. O1O1.1O mO1.1.1x2x=X1X1O1O X1X1X1. .1.1.1O <m", BeatType.FourEights, InstrumentType.Djembe);
        var djembeSolo3EndNotation              = Notation.Notation.Parse("Solo 3 End",             "mO1.1X1X X1.1.1O O1.1X1X X1.1.1O mO1.1X1X X1.1.1O O1.1X1X X1.1.1. mO1O1.1O O1.1O1O .1O1O1. O1O1.1O mO1.1.1x2x=X1X1O1O X1X1X1. .1.1.1. m", BeatType.FourEights, InstrumentType.Djembe);

        var djembeLanding1Notation              = Notation.Notation.Parse("Landing 1",              "miX1.1X1X .1O1O1X O1O1X1. x2o-o2o-O1O mX1X1.1. .1.1.1. .1.1.1. .1.1.1. m", InstrumentType.Djembe);

        var djembeEchauffementNotation          = Notation.Notation.Parse("Echauffement",           "m>O1O1O1X X1X1X1X O1O1O1X X1X1X1X <m",                 InstrumentType.Djembe);
        var djembeEchauffementEndNotation       = Notation.Notation.Parse("Echauffement End",       "mO1O1O1X X1X1X1X O1O1O1. zX1.1.1. m",                  InstrumentType.Djembe);

        var sangbanEchauffementNotation         = Notation.Notation.Parse("Echauffement",           "m>vO1.1v1vO .1v1vO1. v1vO1.1v vO1.1v1. <m",            InstrumentType.Sangban);
        var sangbanEchauffementEndNotation      = Notation.Notation.Parse("Echauffement End",       "mv1vO1.1vO .1vO1.1vO vO1.1v1. vO1.1v1. m",             InstrumentType.Sangban);

        var dununbaEchauffementNotation         = Notation.Notation.Parse("Echauffement",           "m>vO1vO1.1vO .1vO1.1vO vO1.1vO1vO .1vO1vO1. <m",       InstrumentType.Dununba);
        var dununbaEchauffementEndNotation      = Notation.Notation.Parse("Echauffement End",       "mvO1vO1.1vO .1vO1.1vO vO1.1vO1. vO1.1vO1. m",          InstrumentType.Dununba);

        var djembeEndNotation                   = Notation.Notation.Parse("End",                    "miX1.1.1. .1.1.1. .1.1.1. .1.1.1. m",                  InstrumentType.Djembe);
        var kenkeniEndNotation                  = Notation.Notation.Parse("End",                    "mvO1.1.1. .1.1.1. .1.1.1. .1.1.1. m",                  InstrumentType.Kenkeni);
        var sangbanEndNotation                  = Notation.Notation.Parse("End",                    "mvO1.1.1. .1.1.1. .1.1.1. .1.1.1. m",                  InstrumentType.Sangban);
        var dununbaEndNotation                  = Notation.Notation.Parse("End",                    "mvO1.1.1. .1.1.1. .1.1.1. .1.1.1. m",                  InstrumentType.Dununba);

        // TODO: Rename Song to SongDefinition and add Song as a new class.
        // Each SongDefinition describes how a song is played for ONE instrument only. The Song contains all the definitions.
        // Else, it is not possible to have different parts playing for the same instrument type. For example; There can be 
        // multiple djembe's, krins or even multiple douns of the same type playing different parts.
        var song = new Song()
            .AddPart(djembeCallNotation, sangbanStartNotation, dununbaStartNotation)
            .AddPart(djembeAccompany1Notation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeAccompany1Notation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeAccompany1Notation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeAccompany1EndNotation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)

            .AddPart(djembeCallNotation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeEchauffementNotation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(1, djembeEchauffementNotation, djembeAccompany2Notation, kenkeniNotation, sangbanEchauffementNotation, dununbaEchauffementNotation)
            .AddPart(djembeEchauffementEndNotation, djembeAccompany2Notation, kenkeniNotation, sangbanEchauffementNotation, dununbaEchauffementNotation)
            .AddPart(djembeCallNotation, djembeAccompany2Notation, kenkeniNotation, sangbanEchauffementEndNotation, dununbaEchauffementEndNotation)

            .AddPart(djembeWaitNotation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeWaitNotation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)

            .AddPart(djembeCallNotation, djembeSolo3StartNotation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeSolo3Notation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeSolo3EndNotation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeLanding1Notation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)

            .AddPart(djembeSolo2Notation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeSolo2Notation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeSolo2Notation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeSolo2Notation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeLanding1Notation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)

            .AddPart(djembeWaitNotation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeCallNotation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(djembeEchauffementNotation, djembeAccompany2Notation, kenkeniNotation, sangbanNotation, dununbaNotation)
            .AddPart(1, djembeEchauffementNotation, djembeAccompany2Notation, kenkeniNotation, sangbanEchauffementNotation, dununbaEchauffementNotation)
            .AddPart(djembeEchauffementEndNotation, djembeAccompany2Notation, kenkeniNotation, sangbanEchauffementNotation, dununbaEchauffementNotation)
            .AddPart(djembeCallNotation, djembeAccompany2Notation, kenkeniNotation, sangbanEchauffementEndNotation, dununbaEchauffementEndNotation)
            .AddPart(djembeEndNotation, kenkeniEndNotation, sangbanEndNotation, dununbaEndNotation);

        var players = new Dictionary<InstrumentType, InstrumentPlayer[]>
        {
            { InstrumentType.Djembe, new[] { _djembePlayer1, _djembePlayer2 } },
            { InstrumentType.Kenkeni, new[] { _kenkeniPlayer } },
            { InstrumentType.Sangban, new[] { _sangbanPlayer } },
            { InstrumentType.Dununba, new[] { _dununbaPlayer } },
        };

        var noteIndex = 0f;
        var songPartIndex = 0;
        var songPartRepeatIndex = 0;
        var totalTime = 0f;
        var totalNotesSong = song.Parts.Sum(p => p.Notations.Max(n => n.TotalNotes));
        while (true)
        {
            var interval = ((60000f / _bpm / djembeAccompany1Notation.NotesPerBeat) / 2f) / 1000f;
            var songPart = song.Parts[songPartIndex];
            var notations = songPart.Notations;
            var djembeIndex = 0;
            foreach (var notation in notations)
            {
                if (notation == djembeSolo3StartNotation)
                {
                    djembeIndex--;
                }

                var player = players[notation.InstrumentType];
                var playerIndex = notation.InstrumentType == InstrumentType.Djembe ? djembeIndex : 0;
                var index = noteIndex % notation.TotalNotes;
                var note = notation.NoteAt(index);
                if (note != null && player[playerIndex].enabled)
                {
                    foreach (var sound in note.Sounds)
                    {
                        player[playerIndex].PlaySound(sound);
                    }
                }

                if (notation.InstrumentType == InstrumentType.Djembe)
                {
                    djembeIndex++;
                }
            }

            if (noteIndex % 4 == 0 && _metronomePlayer.enabled)
            {
                _metronomePlayer.PlaySound();
            }

            yield return new WaitForSecondsRealtime(interval);
            totalTime += interval;

            if (noteIndex > songPart.TotalNotes - 1f)
            {
                noteIndex = 0f;

                if (songPartRepeatIndex >= songPart.RepeatCount)
                {
                    songPartIndex++;
                    songPartRepeatIndex = 0;
                }
                else
                {
                    songPartRepeatIndex++;
                }

                if (songPartIndex >= song.Parts.Length)
                {
                    StopCoroutine(_coroutine);
                    _coroutine = null;
                    break;
                }

            }
            else
            {
                noteIndex += .5f;
            }
        }
    }
    void OnGUI()
    {
        GUI.color = Color.white;
        if (GUI.Button(new Rect(10, 70, 150, 30), "Play") && _coroutine == null)
        {
            _coroutine = StartCoroutine(WaitAndPlay());
        }

        if (GUI.Button(new Rect(170, 70, 150, 30), "Stop") && _coroutine != null)
        {
            StopCoroutine(_coroutine);
            _coroutine = null;
        }

        GUI.BeginGroup(new Rect(10, 10, 200, 30));
        GUI.color = Color.black;
        GUI.Label(new Rect(0, 0, 50, 30), "BPM:");

        GUI.color = Color.white;
        _bpmValue = GUI.TextField(new Rect(50, 0, 50, 30), _bpmValue);
        if (GUI.Button(new Rect(100, 0, 35, 30), "OK"))
        {
            int.TryParse(_bpmValue, out _bpm);
        }
        if (GUI.Button(new Rect(135, 0, 60, 30), "Reset"))
        {
            _bpm = DefaultBpm;
            _bpmValue = DefaultBpm.ToString();
        }

        GUI.EndGroup();

        GUI.BeginGroup(new Rect(10, 100, 650, 190));
        GUI.color = Color.black;
        _djembePlayer1.enabled = GUI.Toggle(new Rect(10, 10, 150, 30), _djembePlayer1.enabled, "Djembe 1");
        _djembePlayer1.PanStereo = GUI.HorizontalSlider(new Rect(160, 10, 150, 30), _djembePlayer1.PanStereo, -1f, 1f);

        GUI.color = Color.white;
        var djembe1PlayMode = GUI.SelectionGrid(new Rect(320, 5, 300, 30), _djembePlayer1.PlayEchauffement ? 2 : (_djembePlayer1.PlayCall ? 1 : 0), new[] { "Accomp. 1", "Call", "Echauffement" }, 3);
        _djembePlayer1.PlayEchauffement = djembe1PlayMode == 2;
        _djembePlayer1.PlayCall = djembe1PlayMode == 1;

        GUI.color = Color.black;
        _djembePlayer2.enabled = GUI.Toggle(new Rect(10, 40, 150, 30), _djembePlayer2.enabled, "Djembe 2");
        _djembePlayer2.PanStereo = GUI.HorizontalSlider(new Rect(160, 40, 150, 30), _djembePlayer2.PanStereo, -1f, 1f);

        GUI.color = Color.white;
        var djembe2PlayMode = GUI.SelectionGrid(new Rect(320, 35, 300, 30), _djembePlayer2.PlayEchauffement ? 2 : (_djembePlayer2.PlayCall ? 1 : 0), new[] { "Accomp. 2", "Call", "Echauffement" }, 3);
        _djembePlayer2.PlayEchauffement = djembe2PlayMode == 2;
        _djembePlayer2.PlayCall = djembe2PlayMode == 1;

        GUI.color = Color.black;
        _kenkeniPlayer.enabled = GUI.Toggle(new Rect(10, 70, 150, 30), _kenkeniPlayer.enabled, "Kenkeni");
        _kenkeniPlayer.PanStereo = GUI.HorizontalSlider(new Rect(160, 70, 150, 30), _kenkeniPlayer.PanStereo, -1f, 1f);

        _sangbanPlayer.enabled = GUI.Toggle(new Rect(10, 100, 150, 30), _sangbanPlayer.enabled, "Sangban");
        _sangbanPlayer.PanStereo = GUI.HorizontalSlider(new Rect(160, 100, 150, 30), _sangbanPlayer.PanStereo, -1f, 1f);

        _dununbaPlayer.enabled = GUI.Toggle(new Rect(10, 130, 150, 30), _dununbaPlayer.enabled, "Dununba");
        _dununbaPlayer.PanStereo = GUI.HorizontalSlider(new Rect(160, 130, 150, 30), _dununbaPlayer.PanStereo, -1f, 1f);

        _metronomePlayer.enabled = GUI.Toggle(new Rect(10, 160, 150, 30), _metronomePlayer.enabled, "Metronome");
        _metronomePlayer.PanStereo = GUI.HorizontalSlider(new Rect(160, 160, 150, 30), _metronomePlayer.PanStereo, -1f, 1f);
        GUI.EndGroup();
    }
}
