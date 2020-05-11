using System.Collections;
using System.Collections.Generic;
using NotationTokenizer;
using UnityEngine;

[RequireComponent(typeof(AudioListener))]
public class NotationPlayer : MonoBehaviour
{
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

    int _bpm = 100;

    bool _playDjembe1 = true;
    bool _playDjembe2 = true;
    bool _playKenkeni = true;
    bool _playSangban = true;
    bool _playDununba = true;
    bool _playMetronome = true;

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
        var djembeNotation1 = Notation.Notation.Parse("m>X1.1.1X X1.1O1O X1.1.1X X1.1O1O<m");
        var djembeEchauffementNotation = Notation.Notation.Parse("m>O1O1O1X X1X1X1X O1O1O1X X1X1X1X<m");
        var djembeCallNotation = Notation.Notation.Parse("m>iX1.1O1O .1O1.1O O1.1O1. O1.1.1 miX1.1.1. .1.1.1. .1.1.1. .1.1.1.<m");
        var djembeNotation2 = Notation.Notation.Parse("m>B1.1O1O .1.1X1. B1.1O1O .1B1X1.<m");
        var kenkeniNotation = Notation.Notation.Parse("m>vO1.1v1. vO1.1v1. vO1.1v1. vO1.1v1.<m");
        var sangbanNotation = Notation.Notation.Parse("m>vO1.1v1. v1.1vX1. vX1.1v1. vO1.1v1.<m");
        var dununbaNotation = Notation.Notation.Parse("m>vO1.1vO1vO .1v1v1. v1.1vO1. vO1.1vO1.<m");
        
        var index = 0f;
        var interval = 60000f / _bpm / (djembeNotation1.NotesPerBeat * 2) / 1000f;

        while (true)
        {
            //var soundsToPlay = new List<Notation.SoundType>();
            var djembe1Notation = djembeNotation1;
            if (_djembePlayer1.Echauffement)
            {
                djembe1Notation = djembeEchauffementNotation;
            }
            else if (_djembePlayer1.Call)
            {
                djembe1Notation = djembeCallNotation;
            }
                       
            var note = djembe1Notation.NoteAt(index);
            //soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null && _playDjembe1)
            {
                foreach (var sound in note.Sounds)
                {
                    _djembePlayer1.Play(sound, .33f);
                }
            }

            var djembe2Notation = djembeNotation2;
            if (_djembePlayer2.Echauffement)
            {
                djembe2Notation = djembeEchauffementNotation;
            }
            else if (_djembePlayer2.Call)
            {
                djembe2Notation = djembeCallNotation;
            }

            note = djembe2Notation.NoteAt(index);
            //soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null && _playDjembe2)
            {
                foreach (var sound in note.Sounds)
                {
                    _djembePlayer2.Play(sound, -.33f);
                }
            }

            note = kenkeniNotation.NoteAt(index);
            //soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null && _playKenkeni)
            {
                foreach (var sound in note.Sounds)
                {
                    _kenkeniPlayer.Play(sound, -.66f);
                }
            }

            note = sangbanNotation.NoteAt(index);
            //soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null && _playSangban)
            {
                foreach (var sound in note.Sounds)
                {
                    _sangbanPlayer.Play(sound, 1f);
                }
            }

            note = dununbaNotation.NoteAt(index);
            //soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null && _playDununba)
            {
                foreach (var sound in note.Sounds)
                {
                    _dununbaPlayer.Play(sound, -1f);
                }
            }

            if (index % 4 == 0 && _playMetronome)
            {
                _metronomePlayer.Play(0f);
            }

            //Debug.Log(index + ": " + string.Join(", ", soundsToPlay));

            yield return new WaitForSeconds(interval);

            index += .5f;
            if (index > djembeNotation1.TotalNotes - .5f)
            {
                index = 0f;
            }
        }
    }
    void OnGUI()
    {
        if (GUI.Button(new Rect(10, 70, 150, 30), "Play"))
        {
            _coroutine = StartCoroutine(WaitAndPlay());
        }

        if (GUI.Button(new Rect(170, 70, 150, 30), "Stop"))
        {
            StopCoroutine(_coroutine);
        }

        int.TryParse(GUI.TextField(new Rect(10, 10, 150, 30), _bpm.ToString()), out _bpm);

        GUI.color = Color.black;
        GUI.BeginGroup(new Rect(10, 100, 600, 190));
        _playDjembe1 = GUI.Toggle(new Rect(10, 10, 150, 30), _playDjembe1, "Djembe 1");
        _djembePlayer1.Echauffement = GUI.Toggle(new Rect(160, 10, 150, 30), _djembePlayer1.Echauffement, "Echauffement");
        _djembePlayer1.Call = GUI.Toggle(new Rect(320, 10, 150, 30), _djembePlayer1.Call, "Call");
        _playDjembe2 = GUI.Toggle(new Rect(10, 40, 150, 30), _playDjembe2, "Djembe 2");
        _djembePlayer2.Echauffement = GUI.Toggle(new Rect(160, 40, 150, 30), _djembePlayer2.Echauffement, "Echauffement");
        _djembePlayer2.Call = GUI.Toggle(new Rect(320, 40, 150, 30), _djembePlayer2.Call, "Call");
        _playKenkeni = GUI.Toggle(new Rect(10, 70, 150, 30), _playKenkeni, "Kenkeni");
        _playSangban = GUI.Toggle(new Rect(10, 100, 150, 30), _playSangban, "Sangban");
        _playDununba = GUI.Toggle(new Rect(10, 130, 150, 30), _playDununba, "Dununba");
        _playMetronome = GUI.Toggle(new Rect(10, 160, 150, 30), _playMetronome, "Metronome");
        GUI.EndGroup();
    }
}
