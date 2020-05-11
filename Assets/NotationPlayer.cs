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

    Coroutine _coroutine;
    DjembePlayer _djembePlayer1;
    DjembePlayer _djembePlayer2;
    KenkeniPlayer _kenkeniPlayer;
    SangbanPlayer _sangbanPlayer;
    DununbaPlayer _dununbaPlayer;

    void Start()
    {
        _djembePlayer1 = Djembe.GetComponent<DjembePlayer>();
        _djembePlayer2 = Djembe2.GetComponent<DjembePlayer>();
        _kenkeniPlayer = Kenkeni.GetComponent<KenkeniPlayer>();
        _sangbanPlayer = Sangban.GetComponent<SangbanPlayer>();
        _dununbaPlayer = Dununba.GetComponent<DununbaPlayer>();
        Debug.Log("started");
    }

    void Update()
    {
    }

    IEnumerator WaitAndPlay()
    {
        //var notation = Notation.Notation.Parse("m>O1O1O .1Xr1. Or1O1O X1X1. <m");
        var djembeNotation1 = Notation.Notation.Parse("m>B1.1O1O .1.1X1. B1.1O1O .1B1X1.<m");
        var djembeNotation2 = Notation.Notation.Parse("m>X1.1.1X X1.1O1O X1.1.1X X1.1O1O<m");
        var kenkeniNotation = Notation.Notation.Parse("m>vO1.1v1. vO1.1v1. vO1.1v1. vO1.1v1.<m");
        var sangbanNotation = Notation.Notation.Parse("m>vO1.1v1. v1.1vX1. vX1.1v1. vO1.1v1.<m");
        var dununbaNotation = Notation.Notation.Parse("m>vO1.1vO1vO .1v1v1. v1.1vO1. vO1.1vO1.<m");
        var index = 0f;

        while (true)
        {
            var soundsToPlay = new List<Notation.SoundType>();
            var note = djembeNotation1.NoteAt(index);
            soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null)
            {
                foreach (var sound in note.Sounds)
                {
                    _djembePlayer1.Play(sound, .33f);
                }
            }

            note = djembeNotation2.NoteAt(index);
            soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null)
            {
                foreach (var sound in note.Sounds)
                {
                    _djembePlayer2.Play(sound, -.33f);
                }
            }

            note = kenkeniNotation.NoteAt(index);
            soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null)
            {
                foreach (var sound in note.Sounds)
                {
                    _kenkeniPlayer.Play(sound, -.66f);
                }
            }

            note = sangbanNotation.NoteAt(index);
            soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null)
            {
                foreach (var sound in note.Sounds)
                {
                    _sangbanPlayer.Play(sound, 1f);
                }
            }

            note = dununbaNotation.NoteAt(index);
            soundsToPlay.AddRange(note?.Sounds ?? new List<Notation.SoundType>());
            if (note != null)
            {
                foreach (var sound in note.Sounds)
                {
                    _dununbaPlayer.Play(sound, -1f);
                }
            }

            Debug.Log(index + ": " + string.Join(", ", soundsToPlay));

            yield return new WaitForSeconds(0.1f);

            index++;
            if (index >= djembeNotation1.TotalNotes)
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
    }
}
