import { useEffect, useMemo, useRef, useState } from 'react';
import { PlayerEngine } from './audio/PlayerEngine';
import type { TrackMix } from './audio/PlayerEngine';
import { compileArrangement } from './core/arrangement';
import { TICKS_PER_BEAT } from './core/model';
import type { Instrument, Song } from './core/model';
import { parseNotation } from './core/parser';
import { djagbe } from './songs/djagbe';

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
const initialPattern = djagbe.sections[2]!.parts[0]!.notation.raw;
const instruments: Instrument[] = ['djembe', 'kenkeni', 'sangban', 'dununba', 'krin'];

export function App() {
  const [song, setSong] = useState(djagbe);
  const [bpm, setBpm] = useState(djagbe.bpm);
  const [loop, setLoop] = useState(false);
  const [metronome, setMetronome] = useState(false);
  const [, refresh] = useState(0);
  const [tick, setTick] = useState(0);
  const [mixes, setMixes] = useState<Record<string, TrackMix>>({});
  const [raw, setRaw] = useState(initialPattern);
  const [instrument, setInstrument] = useState<Instrument>('dununba');
  const [subdivisions, setSubdivisions] = useState<3 | 4>(4);
  const [patternError, setPatternError] = useState('');
  const [plainText, setPlainText] = useState(false);
  const engineRef = useRef<PlayerEngine | null>(null);
  const arrangement = useMemo(() => compileArrangement(song), [song]);

  useEffect(() => {
    let mounted = true;
    const engine = new PlayerEngine(song, () => { if (mounted) refresh(value => value + 1); });
    engineRef.current = engine;
    setTick(0);
    setMixes(Object.fromEntries(song.tracks.map(track =>
      [track.id, { volume: track.volume, pan: track.pan, muted: false }])));
    return () => { mounted = false; engine.dispose(); engineRef.current = null; };
  }, [song]);

  useEffect(() => {
    let frame = 0;
    let lastUpdate = 0;
    const update = (time: number) => {
      if (time - lastUpdate > 75) { setTick(engineRef.current?.tick ?? 0); lastUpdate = time; }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => { engineRef.current?.setBpm(bpm); }, [bpm, song]);
  useEffect(() => { engineRef.current?.setLoop(loop); }, [loop, song]);
  useEffect(() => { engineRef.current?.setMetronome(metronome); }, [metronome, song]);

  const engine = engineRef.current;
  const state = engine?.state ?? 'stopped';
  const current = arrangement.sections.find(item => tick >= item.startTick && tick < item.endTick);
  const section = state === 'finished' ? song.sections.at(-1)!
    : song.sections.find(item => item.id === current?.sectionId) ?? song.sections[0]!;
  const totalBeats = arrangement.durationTicks / TICKS_PER_BEAT;
  const beat = Math.floor(tick / TICKS_PER_BEAT) % song.beatsPerMeasure;
  const progress = Math.min(1, tick / arrangement.durationTicks);
  const status = state === 'playing' ? 'Playing' : state === 'loading' ? 'Loading samples…'
    : state === 'finished' ? 'Song complete' : state === 'error' ? 'Playback unavailable' : 'Ready to play';

  function updateMix(id: string, change: Partial<TrackMix>) {
    setMixes(previous => ({ ...previous, [id]: { ...previous[id]!, ...change } }));
    engineRef.current?.setMix(id, change);
  }

  function loadPattern() {
    try {
      const notation = parseNotation(raw, { instrument, subdivisions, name: 'Your pattern' });
      if (!notation.sounds.length) throw new Error('This pattern contains no playable sounds for the selected instrument.');
      const custom: Song = {
        id: 'custom', name: 'Your pattern', bpm, beatsPerMeasure: 4,
        description: 'Four passes through your notation. Make a change and try it again.',
        tracks: [{ id: 'custom-1', name: instrument[0]!.toUpperCase() + instrument.slice(1), instrument,
          sampleSet: 'solo', color: '#e2ad6e', volume: 0.65, pan: 0 }],
        sections: [{ id: 'custom-pattern', name: 'Your pattern', times: 4,
          parts: [{ trackId: 'custom-1', notation }] }],
      };
      engineRef.current?.stop();
      setSong(custom);
      setPatternError('');
    } catch (error) { setPatternError(error instanceof Error ? error.message : 'Invalid notation.'); }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Djembe Player home">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <ellipse cx="20" cy="11" rx="14" ry="6" />
            <path d="M6 11l6 16h16l6-16M15 27l-3 8h16l-3-8M12 14l5 13m11-13l-5 13" />
          </svg>
          <span>Djembe<span className="brand-light">Player</span></span>
        </a>
        <span className="header-note">A little practice. A deeper groove.</span>
      </header>

      <main>
        <div className="song-heading">
          <div>
            <p className="eyebrow">THE PRACTICE ROOM</p>
            <h1>{song.name}<span className="title-dot">.</span></h1>
            <p className="description">{song.description}</p>
          </div>
          <div className="song-facts">
            <span><strong>{song.tracks.length}</strong> {song.tracks.length === 1 ? 'instrument' : 'instruments'}</span>
            <span><strong>{totalBeats / song.beatsPerMeasure}</strong> measures</span>
            <span><strong>{song.sections[0]!.parts[0]!.notation.subdivisions}</strong> pulses / beat</span>
          </div>
        </div>

        <section className="transport panel" aria-label="Playback controls">
          <div className="transport-top">
            <div className="playback-buttons">
              <button className="play-button" onClick={() => void engineRef.current?.play()}
                disabled={state === 'loading' || state === 'playing'}>
                <span aria-hidden="true">▶</span>
                {state === 'loading' ? 'Loading…' : state === 'playing' ? 'Playing'
                  : state === 'finished' ? 'Play again' : 'Play'}
              </button>
              <button className="stop-button" aria-label="Stop playback"
                onClick={() => engineRef.current?.stop()}
                disabled={!['playing', 'loading', 'finished'].includes(state)}>
                <span aria-hidden="true">■</span>
              </button>
            </div>
            <div className="tempo">
              <label htmlFor="bpm">TEMPO</label>
              <button aria-label="Decrease tempo" onClick={() => setBpm(value => Math.max(30, value - 5))}>−</button>
              <input id="bpm" type="number" min="30" max="240" value={bpm}
                onChange={event => {
                  const value = event.currentTarget.valueAsNumber;
                  if (Number.isFinite(value)) setBpm(Math.max(30, Math.min(240, value)));
                }} />
              <button aria-label="Increase tempo" onClick={() => setBpm(value => Math.min(240, value + 5))}>+</button>
              <span>BPM</span>
            </div>
            <div className="transport-options">
              <label><input type="checkbox" checked={metronome}
                onChange={event => setMetronome(event.target.checked)} /> Metronome</label>
              <label><input type="checkbox" checked={loop}
                onChange={event => setLoop(event.target.checked)} /> Loop song</label>
            </div>
          </div>
          <div className="transport-bottom">
            <div className="beat-indicators" aria-label={`Beat ${beat + 1} of ${song.beatsPerMeasure}`}>
              {Array.from({ length: song.beatsPerMeasure }, (_, index) =>
                <span key={index} className={state === 'playing' && beat === index ? 'beat active' : 'beat'}>{index + 1}</span>)}
            </div>
            <span className="status" role="status">{status}</span>
            <span className="time">{formatTime(tick / TICKS_PER_BEAT * 60 / bpm)}
              <span> / {formatTime(totalBeats * 60 / bpm)}</span>
            </span>
          </div>
          <div className="progress" role="progressbar" aria-label="Song progress"
            aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress * 100}%` }} />
          </div>
          {engine?.error && <p className="error" role="alert">{engine.error} Try Play again.</p>}
        </section>

        <div className="workspace-grid">
          <section className="panel notation-panel" aria-labelledby="notation-heading">
            <div className="panel-heading">
              <div><p className="eyebrow">THE NOTATION</p><h2 id="notation-heading">{section.name}</h2></div>
              <span className="tag">{current && current.times > 1
                ? `Pass ${current.iteration} / ${current.times}` : 'SlapToonToonSlap'}</span>
            </div>
            <div className="notation-tracks">
              {song.tracks.map(track => {
                const part = section.parts.find(item => item.trackId === track.id);
                return (
                  <div className="notation-track" key={track.id}>
                    <div className="track-label">
                      <span className="track-swatch" style={{ background: track.color }} />
                      <h3>{track.name}</h3><span>{part ? part.notation.name : 'Rest'}</span>
                    </div>
                    {part ? <div className="score-scroll" tabIndex={0} role="region"
                      aria-label={`${track.name}: ${part.notation.name}`}>
                      <pre className="notation" aria-label={part.notation.raw}>{part.notation.raw}</pre>
                    </div> : <div className="rest">Listening for the next entrance</div>}
                  </div>
                );
              })}
            </div>
            <details className="arrangement">
              <summary>Explore the full arrangement <span>{song.sections.length} {song.sections.length === 1 ? 'section' : 'sections'}</span></summary>
              <ol>{song.sections.map((item, index) =>
                <li key={item.id} className={current?.sectionId === item.id ? 'current-section' : ''}>
                  <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
                  <span>{item.name}</span><span>× {item.times}</span>
                </li>)}
              </ol>
            </details>
          </section>

          <section className="panel mixer" aria-labelledby="mixer-heading">
            <div className="panel-heading">
              <div><p className="eyebrow">MAKE SOME SPACE</p><h2 id="mixer-heading">Your mix</h2></div>
              <svg className="mixer-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 3v18m7-18v18m7-18v18M2 8h6m1 8h6m1-10h6" />
              </svg>
            </div>
            <p className="panel-description">Bring your part forward. Let the others guide you.</p>
            {song.tracks.map(track => {
              const mix = mixes[track.id] ?? { volume: track.volume, pan: track.pan, muted: false };
              return (
                <div className={`mixer-track ${mix.muted ? 'muted' : ''}`} key={track.id}>
                  <div className="mixer-track-heading">
                    <h3><span className="track-swatch" style={{ background: track.color }} />{track.name}</h3>
                    <button className={`mute-button ${mix.muted ? 'is-muted' : ''}`}
                      aria-label={`${mix.muted ? 'Unmute' : 'Mute'} ${track.name}`} aria-pressed={mix.muted}
                      onClick={() => updateMix(track.id, { muted: !mix.muted })}>
                      {mix.muted ? 'Muted' : 'Mute'}
                    </button>
                  </div>
                  <label className="range-label" htmlFor={`volume-${track.id}`}>
                    <span>Volume</span><span>{Math.round(mix.volume * 100)}%</span>
                  </label>
                  <input id={`volume-${track.id}`} aria-label={`${track.name} volume`} type="range"
                    min="0" max="1" step="0.01" value={mix.volume}
                    onChange={event => updateMix(track.id, { volume: Number(event.target.value) })} />
                  <label className="range-label pan-label" htmlFor={`pan-${track.id}`}>
                    <span>Left</span><span>Pan</span><span>Right</span>
                  </label>
                  <input id={`pan-${track.id}`} aria-label={`${track.name} pan`} type="range"
                    min="-1" max="1" step="0.01" value={mix.pan}
                    onChange={event => updateMix(track.id, { pan: Number(event.target.value) })} />
                </div>
              );
            })}
            <p className="mixer-footnote">Headphones help you hear each instrument’s place.</p>
          </section>
        </div>

        <section className="panel pattern-lab" aria-labelledby="lab-heading">
          <div className="panel-heading">
            <div><p className="eyebrow">MAKE IT YOUR OWN</p><h2 id="lab-heading">Try a pattern</h2></div>
            <label className="plain-toggle"><input type="checkbox" checked={plainText}
              onChange={event => setPlainText(event.target.checked)} /> Show source text</label>
          </div>
          <p className="panel-description">Write with your notation font, choose an instrument, and hear four passes.</p>
          <label className="sr-only" htmlFor="custom-notation">Custom notation</label>
          <textarea id="custom-notation" className={plainText ? 'source-input' : 'notation-input'}
            value={raw} onChange={event => setRaw(event.target.value)} spellCheck={false}
            autoCapitalize="off" autoCorrect="off" />
          <div className="lab-controls">
            <label>Instrument<select value={instrument}
              onChange={event => setInstrument(event.target.value as Instrument)}>
              {instruments.map(item => <option key={item} value={item}>{item[0]!.toUpperCase() + item.slice(1)}</option>)}
            </select></label>
            <label>Pulses per beat<select value={subdivisions}
              onChange={event => setSubdivisions(Number(event.target.value) as 3 | 4)}>
              <option value="4">4 · straight</option><option value="3">3 · ternary</option>
            </select></label>
            <button className="secondary-button" onClick={loadPattern}>Load pattern</button>
            {song.id === 'custom' && <button className="text-button"
              onClick={() => { engineRef.current?.stop(); setSong(djagbe); }}>Return to Djagbé</button>}
          </div>
          {patternError && <p className="error" role="alert">{patternError}</p>}
          <p className="notation-hint"><code>m</code> measure · <code>B O X</code> bass, tone, slap ·
            <code>v</code> bell · <code>1</code> pulse spacing · space separates beats</p>
        </section>
      </main>
      <footer><span>Made for the rhythm.</span><span>Original notation & recordings · SlapToonToonSlap</span></footer>
    </div>
  );
}
