using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Notation;
using Songs;
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
    bool _customNotationEnabled;
    string _customNotation = @"mv1.1vO1vO .1v.1v.1. .v1.1vO1. v.1.1v.1. m
mv1.1vO1vO .1v.1v.1. .v1.1vO1. v.1.1v.1. m
mv1.1vO1vO .1v.1v.1. .v1.1vO1. v.1vO1.1v. mvO1.1v1vO .1v.1v.1. .v1.1vO1. v.1.1v.1. m";
    int _customNotationRepeatCount = 999;
    Font _slapToonToonSlapFont;

    int _bpm = DefaultBpm;
    string _bpmValue = DefaultBpm.ToString();
    int _selectedSongIndex;

    private readonly Dictionary<string, Func<ISong>> _songs = new Dictionary<string, Func<ISong>>
    {
        { "Soro (4/8)", () => Soro.LoadSong() },
        { "Soli (12/8)", () => Soli.LoadSong() },
        { "Djagbé (4/8)", () => Djagbe.LoadSong() },
        { "Kadan (6/8)", () => Kadan.LoadSong() }
    };

    void Start()
    {
        _djembePlayer1 = Djembe.GetComponent<DjembePlayer>();
        _djembePlayer2 = Djembe2.GetComponent<DjembePlayer>();
        _kenkeniPlayer = Kenkeni.GetComponent<KenkeniPlayer>();
        _sangbanPlayer = Sangban.GetComponent<SangbanPlayer>();
        _dununbaPlayer = Dununba.GetComponent<DununbaPlayer>();
        _metronomePlayer = Metronome.GetComponent<MetronomePlayer>();

        _slapToonToonSlapFont = (Font)Resources.Load("Fonts/SlapToonToonSlap");
        Debug.Log("started");
    }

    void Update()
    {
    }

    IEnumerator WaitAndPlay()
    {
        // TODO: Rename Song to SongDefinition and add Song as a new class.
        // Each SongDefinition describes how a song is played for ONE instrument only. The Song contains all the definitions.
        // Else, it is not possible to have different parts playing for the same instrument type. For example; There can be 
        // multiple djembe's, krins or even multiple douns of the same type playing different parts.
        //var song = Soro.LoadSong();
        ISong song;

        if (_customNotationEnabled)
        {
            var instrumentType = InstrumentType.Dununba;
            var customNotation = Notation.Notation.Parse("Custom", _customNotation, BeatType.Unknown, instrumentType);
            song = new Song();
            song.AddPart(_customNotationRepeatCount > 0 ? _customNotationRepeatCount : 0, customNotation);
        }
        else
        {
            var songName = _songs.Keys.ToArray()[_selectedSongIndex];
            song = _songs[songName]();
        }

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
            var interval = ((60000f / _bpm / song.NotesPerBeat) / 2f) / 1000f;
            var songPart = song.Parts[songPartIndex];
            var notations = songPart.Notations;
            var djembeIndex = 0;
            foreach (var notation in notations)
            {
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

            if (noteIndex % song.NotesPerBeat == 0 && _metronomePlayer.enabled)
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
        GUI.BeginGroup(new Rect(10, 10, 600, 30));
        GUI.color = Color.black;
        GUI.Label(new Rect(10, 0, 50, 30), "BPM:");

        GUI.color = Color.white;

        if (GUI.Button(new Rect(50, 0, 35, 30), "-"))
        {
            _bpm = _bpm % 5 == 0 ? _bpm - 5 : _bpm - _bpm % 5;
            _bpmValue = _bpm.ToString();
        }

        if (GUI.Button(new Rect(90, 0, 35, 30), "+"))
        {
            _bpm = _bpm % 5 == 0 ? _bpm + 5 : _bpm + 5 - _bpm % 5;
            _bpmValue = _bpm.ToString();
        }

        _bpmValue = GUI.TextField(new Rect(130, 0, 50, 30), _bpmValue);

        if (GUI.Button(new Rect(185, 0, 35, 30), "OK"))
        {
            int.TryParse(_bpmValue, out _bpm);
        }

        if (GUI.Button(new Rect(225, 0, 60, 30), "Reset"))
        {
            _bpm = DefaultBpm;
            _bpmValue = DefaultBpm.ToString();
        }

        GUI.EndGroup();

        GUI.BeginGroup(new Rect(10, 50, 650, 40));
        GUI.color = Color.white;
        _selectedSongIndex = GUI.SelectionGrid(new Rect(10, 0, 620, 30), _selectedSongIndex, _songs.Keys.ToArray(), 4);

        GUI.EndGroup();

        GUI.BeginGroup(new Rect(10, 120, 650, 40));
        GUI.color = Color.white;
        if (GUI.Button(new Rect(10, 0, 150, 30), "Play") && _coroutine == null)
        {
            _coroutine = StartCoroutine(WaitAndPlay());
        }

        if (GUI.Button(new Rect(170, 0, 150, 30), "Stop") && _coroutine != null)
        {
            StopCoroutine(_coroutine);
            _coroutine = null;
        }

        GUI.EndGroup();

        GUI.BeginGroup(new Rect(10, 160, 650, 190));
        var players = new Dictionary<string, SoundPlayer>
        {
            { "Djembe 1", _djembePlayer1 },
            { "Djembe 2", _djembePlayer2 },
            { "Kenkeni", _kenkeniPlayer },
            { "Sangban", _sangbanPlayer },
            { "Dununba", _dununbaPlayer },
            { "Metronome", _metronomePlayer },
        };

        GUI.color = Color.black;
        var yOffset = 0;
        foreach (var pair in players)
        {
            var label = pair.Key;
            var player = pair.Value;

            player.enabled = GUI.Toggle(new Rect(10, yOffset + 10, 150, 30), player.enabled, label);

            GUI.Label(new Rect(145, yOffset + 5, 15, 30), "L");
            player.PanStereo = GUI.HorizontalSlider(new Rect(160, yOffset + 10, 150, 30), player.PanStereo, -1f, 1f);
            GUI.Label(new Rect(315, yOffset + 5, 15, 30), "R");

            GUI.Label(new Rect(345, yOffset + 5, 35, 30), "Vol -");
            player.VolumeScale = GUI.HorizontalSlider(new Rect(375, yOffset + 10, 150, 30), player.VolumeScale, 0f, 1f);
            GUI.Label(new Rect(530, yOffset + 5, 35, 30), "Vol +");

            yOffset += 30;
        }

        GUI.EndGroup();

        GUI.BeginGroup(new Rect(10, 370, 650, 200));
        _customNotationEnabled = GUI.Toggle(new Rect(10, 10, 150, 30), _customNotationEnabled, "Custom notation");

        GUI.color = Color.black;
        var customNotationGUIStyle = new GUIStyle(GUI.skin.textArea)
        {
            font = _slapToonToonSlapFont,
            fontSize = 16,
            padding = new RectOffset(15, 15, 10, 10),
        };
        _customNotation = GUI.TextArea(new Rect(10, 40, 630, 150), _customNotation, customNotationGUIStyle);
        GUI.EndGroup();
    }
}
