using System.Collections;
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
        var djembeNotation1 = Notation.Notation.Parse("m>X1.1.1X X1.1O1O X1.1.1X X1.1O1O<m", InstrumentType.Djembe);
        var djembeEchauffementNotation = Notation.Notation.Parse("m>O1O1O1X X1X1X1X O1O1O1X X1X1X1X<m", InstrumentType.Djembe);
        var djembeCallNotation = Notation.Notation.Parse("m>iX1.1O1O .1O1.1O O1.1O1. O1.1.1 miX1.1.1. .1.1.1. .1.1.1. .1.1.1.<m", InstrumentType.Djembe);
        var djembeNotation2 = Notation.Notation.Parse("m>B1.1O1O .1.1X1. B1.1O1O .1B1X1.<m", InstrumentType.Djembe);
        var kenkeniNotation = Notation.Notation.Parse("m>vO1.1v1. vO1.1v1. vO1.1v1. vO1.1v1.<m", InstrumentType.Kenkeni);
        var sangbanNotation = Notation.Notation.Parse("m>vO1.1v1. v1.1vX1. vX1.1v1. vO1.1v1.<m", InstrumentType.Sangban);
        var dununbaNotation = Notation.Notation.Parse("m>vO1.1vO1vO .1v1v1. v1.1vO1. vO1.1vO1.<m", InstrumentType.Dununba);
        
        var index = 0f;

        while (true)
        {
            var interval = 60000f / _bpm / (djembeNotation1.NotesPerBeat * 2) / 1000f;

            //var soundsToPlay = new List<Notation.SoundType>();
            var djembe1Notation = djembeNotation1;
            if (_djembePlayer1.PlayEchauffement)
            {
                djembe1Notation = djembeEchauffementNotation;
            }
            else if (_djembePlayer1.PlayCall)
            {
                djembe1Notation = djembeCallNotation;
            }
                       
            var note = djembe1Notation.NoteAt(index);
            //soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null && _djembePlayer1.enabled)
            {
                foreach (var sound in note.Sounds)
                {
                    _djembePlayer1.PlaySound(sound);
                }
            }

            var djembe2Notation = djembeNotation2;
            if (_djembePlayer2.PlayEchauffement)
            {
                djembe2Notation = djembeEchauffementNotation;
            }
            else if (_djembePlayer2.PlayCall)
            {
                djembe2Notation = djembeCallNotation;
            }

            note = djembe2Notation.NoteAt(index);
            //soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null && _djembePlayer2.enabled)
            {
                foreach (var sound in note.Sounds)
                {
                    _djembePlayer2.PlaySound(sound);
                }
            }

            note = kenkeniNotation.NoteAt(index);
            //soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null && _kenkeniPlayer.enabled)
            {
                foreach (var sound in note.Sounds)
                {
                    _kenkeniPlayer.PlaySound(sound);
                }
            }

            note = sangbanNotation.NoteAt(index);
            //soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null && _sangbanPlayer.enabled)
            {
                foreach (var sound in note.Sounds)
                {
                    _sangbanPlayer.PlaySound(sound);
                }
            }

            note = dununbaNotation.NoteAt(index);
            //soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null && _dununbaPlayer.enabled)
            {
                foreach (var sound in note.Sounds)
                {
                    _dununbaPlayer.PlaySound(sound);
                }
            }

            if (index % 4 == 0 && _metronomePlayer.enabled)
            {
                _metronomePlayer.PlaySound();
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
        GUI.color = Color.white;
        if (GUI.Button(new Rect(10, 70, 150, 30), "Play") && _coroutine == null)
        {
            _coroutine = StartCoroutine(WaitAndPlay());
        }

        if (GUI.Button(new Rect(170, 70, 150, 30), "Stop") && _coroutine != null)
        {
            StopCoroutine(_coroutine);
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
