import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlayerEngine } from './audio/PlayerEngine';
import type { TrackMix } from './audio/PlayerEngine';
import { compileArrangement } from './core/arrangement';
import { TICKS_PER_BEAT } from './core/model';
import type { Song } from './core/model';
import { djagbe } from './songs/djagbe';
import { songs } from './songs/catalog';
import { NotationScore } from './notation/NotationScore';
import { notationWidthReference } from './notation/wrapNotation';
import { SongComposer } from './composer/SongComposer';
import { compileDraft, createDraft, readDrafts } from './composer/draft';
import type { SongDraft } from './composer/draft';
import { ThemeToggle } from './ThemeToggle';

const formatTime = (seconds: number, precise: boolean) =>
  `${Math.floor(seconds / 60)}:${precise ? (seconds % 60).toFixed(1).padStart(4, '0') : Math.floor(seconds % 60).toString().padStart(2, '0')}`;
const draftStorageKey = 'djembe-player.custom-songs';
function loadCustomSongs(): { songs: SongDraft[]; error: string } {
  try {
    const json = localStorage.getItem(draftStorageKey);
    return { songs: json ? readDrafts(json) : [], error: '' };
  } catch {
    return { songs: [], error: 'Saved songs could not be loaded. New edits will stay in this tab.' };
  }
}

export function App() {
  const [song, setSong] = useState(djagbe);
  const [storedLibrary] = useState(loadCustomSongs);
  const [customSongs, setCustomSongs] = useState(storedLibrary.songs);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const activeDraft = customSongs.find(item => item.id === selectedDraftId);
  const [saveMessage, setSaveMessage] = useState(storedLibrary.error || 'Saved on this device');
  const [composeError, setComposeError] = useState('');
  const [bpm, setBpm] = useState(djagbe.bpm);
  const [loop, setLoop] = useState(false);
  const [metronome, setMetronome] = useState(false);
  const [, refresh] = useState(0);
  const [tick, setTick] = useState(0);
  const [mixes, setMixes] = useState<Record<string, TrackMix>>({});
  const engineRef = useRef<PlayerEngine | null>(null);
  const arrangement = useMemo(() => compileArrangement(song), [song]);
  const readTick = useCallback(() => engineRef.current?.tick ?? 0, []);

  function installEngine(nextSong: Song) {
    const engine = new PlayerEngine(nextSong, () => {
      if (engineRef.current === engine) { setTick(engine.tick); refresh(value => value + 1); }
    });
    engineRef.current = engine;
    const draft = customSongs.find(item => item.id === nextSong.id);
    const initialMixes = Object.fromEntries(nextSong.tracks.map(track =>
      [track.id, { volume: track.volume, pan: track.pan, muted: draft?.channels.find(channel => channel.id === track.id)?.muted ?? false }]));
    Object.entries(initialMixes).forEach(([id, mix]) => engine.setMix(id, mix));
    engine.setLoop(loop);
    engine.setMetronome(metronome);
    setMixes(initialMixes);
    return engine;
  }

  useEffect(() => {
    // Preview engines are prepared in the click handler so browser audio is
    // unlocked by the user gesture. Reuse that engine when React commits.
    const engine = engineRef.current?.song === song ? engineRef.current : installEngine(song);
    setTick(engine.tick);
    return () => {
      if (engineRef.current === engine) engineRef.current = null;
      engine.dispose();
    };
  }, [song]);

  useEffect(() => {
    if (customSongs === storedLibrary.songs) return;
    if (storedLibrary.error) { setSaveMessage(storedLibrary.error); return; }
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(customSongs));
      setSaveMessage('Saved on this device');
    } catch { setSaveMessage('Could not save on this device. Keep this tab open to retain your edits.'); }
  }, [customSongs, storedLibrary]);

  useEffect(() => {
    let frame = 0;
    let lastUpdate = 0;
    let lastSection = -1;
    const update = (time: number) => {
      const position = readTick();
      const sectionIndex = arrangement.sections.findIndex(item => position >= item.startTick && position < item.endTick);
      if (time - lastUpdate > 75 || sectionIndex !== lastSection) {
        setTick(position); lastUpdate = time; lastSection = sectionIndex;
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [arrangement, readTick]);

  useEffect(() => { engineRef.current?.setBpm(bpm); }, [bpm, song]);
  useEffect(() => { engineRef.current?.setLoop(loop); }, [loop, song]);
  useEffect(() => { engineRef.current?.setMetronome(metronome); }, [metronome, song]);

  const engine = engineRef.current;
  const previewAvailable = !activeDraft || song.id === activeDraft.id;
  const state = previewAvailable ? engine?.state ?? 'stopped' : 'stopped';
  const current = arrangement.sections.find(item => tick >= item.startTick && tick < item.endTick)
    ?? (state === 'finished' ? arrangement.sections.at(-1) : undefined);
  const section = state === 'finished' ? song.sections.at(-1)!
    : song.sections.find(item => item.id === current?.sectionId) ?? song.sections[0]!;
  const totalBeats = previewAvailable ? arrangement.durationTicks / TICKS_PER_BEAT : 0;
  const beat = Math.floor(tick / TICKS_PER_BEAT) % song.beatsPerMeasure;
  const progress = previewAvailable ? Math.min(1, tick / arrangement.durationTicks) : 0;
  const status = state === 'playing' ? 'Playing' : state === 'loading' ? 'Loading samples…'
    : state === 'finished' ? 'Song complete' : state === 'error' ? 'Playback unavailable' : '';

  function updateMix(id: string, change: Partial<TrackMix>) {
    setMixes(previous => ({ ...previous, [id]: { ...previous[id]!, ...change } }));
    engineRef.current?.setMix(id, change);
    if (activeDraft) updateDraft({ ...activeDraft,
      channels: activeDraft.channels.map(channel => channel.id === id ? { ...channel, ...change } : channel) });
  }

  function updateDraft(draft: SongDraft) {
    setCustomSongs(previous => previous.some(item => item.id === draft.id)
      ? previous.map(item => item.id === draft.id ? draft : item) : [...previous, draft]);
    setComposeError('');
  }

  function setTempo(value: number) {
    setBpm(value);
    if (activeDraft) updateDraft({ ...activeDraft, bpm: value });
  }

  function selectSong(id: string) {
    engineRef.current?.stop();
    setComposeError('');
    if (id === 'new') {
      const draft = createDraft();
      updateDraft(draft);
      setSelectedDraftId(draft.id);
      setSong(compileDraft(draft));
      setBpm(draft.bpm);
      return;
    }
    const draft = customSongs.find(item => item.id === id);
    if (draft) {
      setSelectedDraftId(draft.id);
      setBpm(draft.bpm);
      try { setSong(compileDraft(draft)); }
      catch (error) { setComposeError(error instanceof Error ? error.message : 'Check your notation.'); }
      return;
    }
    const selected = songs.find(item => item.id === id);
    if (!selected) return;
    setSelectedDraftId(null);
    setSong(selected);
    setBpm(selected.bpm);
    setTick(0);
  }

  function playDraft(sectionId?: string) {
    if (!activeDraft) return;
    engineRef.current?.stop();
    try {
      const next = compileDraft(activeDraft, { sectionId, requireSound: true });
      const nextEngine = installEngine(next);
      setSong(next);
      setTick(0);
      setComposeError('');
      void nextEngine.play();
    } catch (error) { setComposeError(error instanceof Error ? error.message : 'Check your notation.'); }
  }

  const draftMeasures = useMemo(() => {
    if (!activeDraft) return null;
    try { return compileArrangement(compileDraft(activeDraft)).durationTicks / TICKS_PER_BEAT / activeDraft.beatsPerMeasure; }
    catch { return '—'; }
  }, [activeDraft]);
  const channelCount = activeDraft?.channels.length ?? song.tracks.length;
  const shownMeasures = draftMeasures ?? totalBeats / song.beatsPerMeasure;
  const preciseTime = Boolean(activeDraft) && totalBeats * 60 / bpm < 10;

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="jedeyafola home">
          <img className="brand-logo-light" src={`${import.meta.env.BASE_URL}branding/jedeyafola.svg`} alt="jedeyafola" width="1140" height="282" />
          <img className="brand-logo-dark" src={`${import.meta.env.BASE_URL}branding/jedeyafola-dark.svg`} alt="jedeyafola" width="1140" height="282" />
        </a>
        <div className="header-actions">
          <span className="header-note">A little practice. A deeper groove.</span>
          <ThemeToggle />
        </div>
      </header>

      <main>
        <div className="song-library">
          <p className="eyebrow">THE PRACTICE ROOM</p>
          <label className="song-selector" htmlFor="song-selector">Song
            <select id="song-selector" value={activeDraft?.id ?? song.id} onChange={event => selectSong(event.target.value)}>
              <optgroup label="Song library">{songs.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>
              {customSongs.length > 0 && <optgroup label="Your songs">{customSongs.map(item =>
                <option key={item.id} value={item.id}>{item.name.trim() || 'Untitled song'}</option>)}</optgroup>}
              <option value="new">+ New song</option>
            </select>
          </label>
        </div>
        <div className="song-heading">
          <div>
            <h1>{activeDraft ? activeDraft.name.trim() || 'Untitled song' : song.name}<span className="title-dot">.</span></h1>
            <p className="description">{activeDraft ? 'Your arrangement. Build a fragment or bring the whole band together.' : song.description}</p>
          </div>
          <div className="song-facts">
            <span><strong>{channelCount}</strong> {channelCount === 1 ? 'channel' : 'channels'}</span>
            <span><strong>{shownMeasures}</strong> {shownMeasures === 1 ? 'measure' : 'measures'}</span>
            <span><strong>{activeDraft?.subdivisions ?? song.sections[0]!.parts[0]!.notation.subdivisions}</strong> pulses / beat</span>
          </div>
        </div>

        <section className="transport panel" aria-label="Playback controls">
          <div className="transport-top">
            <div className="playback-buttons">
              <button className="play-button" onClick={() => activeDraft ? playDraft() : void engineRef.current?.play()}
                disabled={state === 'loading' || state === 'playing'}>
                <span aria-hidden="true">▶</span>
                {state === 'loading' ? 'Loading…' : state === 'playing' ? 'Playing'
                  : state === 'finished' ? 'Play again' : 'Play'}
              </button>
              <button className="stop-button" aria-label="Stop playback"
                onClick={() => engineRef.current?.stop()}
                disabled={!['playing', 'loading', 'finished'].includes(state) && tick === 0}>
                <span aria-hidden="true">■</span>
              </button>
            </div>
            <div className="tempo">
              <label htmlFor="bpm">TEMPO</label>
              <button aria-label="Decrease tempo" onClick={() => setTempo(Math.max(30, bpm - 5))}>−</button>
              <input id="bpm" type="number" min="30" max="240" value={bpm}
                onChange={event => {
                  const value = event.currentTarget.valueAsNumber;
                  if (Number.isFinite(value)) setTempo(Math.max(30, Math.min(240, value)));
                }} />
              <button aria-label="Increase tempo" onClick={() => setTempo(Math.min(240, bpm + 5))}>+</button>
              <span>BPM</span>
            </div>
            <div className="transport-options">
              <label><input type="checkbox" checked={metronome}
                onChange={event => setMetronome(event.target.checked)} /> Metronome</label>
              <label><input type="checkbox" checked={loop}
                onChange={event => setLoop(event.target.checked)} /> {activeDraft ? 'Loop playback' : 'Loop song'}</label>
            </div>
          </div>
          {previewAvailable && <div className="section-navigation">
            <label htmlFor="section-selector">{activeDraft ? 'Jump within preview' : 'Jump to section'}</label>
            <select id="section-selector" value={section.id}
              onChange={event => void engineRef.current?.jumpToSection(event.target.value)}>
              {song.sections.map((item, index) => <option key={item.id} value={item.id}>
                {`${String(index + 1).padStart(2, '0')} · ${item.name}${item.times > 1 ? ` (${item.times}x)` : ''}`}
              </option>)}
            </select>
          </div>}
          <div className="transport-bottom">
            <div className="beat-indicators" aria-label={`Beat ${beat + 1} of ${song.beatsPerMeasure}`}>
              <span className="beat-label">Beat</span>
              {Array.from({ length: song.beatsPerMeasure }, (_, index) =>
                <span key={index} className={state === 'playing' && beat === index ? 'beat active' : 'beat'}>{index + 1}</span>)}
            </div>
            {status && <span className="status" role="status">{status}</span>}
            <span className="time">{formatTime((previewAvailable ? tick : 0) / TICKS_PER_BEAT * 60 / bpm, preciseTime)}
              <span> / {formatTime(totalBeats * 60 / bpm, preciseTime)}</span>
            </span>
          </div>
          <div className="progress" role="progressbar" aria-label="Song progress"
            aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress * 100}%` }} />
          </div>
          {engine?.error && <p className="error" role="alert">{engine.error} Try Play again.</p>}
          {activeDraft && composeError && <p className="error" role="alert">{composeError}</p>}
        </section>

        {activeDraft && <SongComposer key={activeDraft.id} draft={activeDraft} onChange={updateDraft}
          onPlay={playDraft} onStop={() => engineRef.current?.stop()} playing={state === 'playing' || state === 'loading'}
          saveMessage={saveMessage} playError={composeError} />}

        {previewAvailable && <div className="workspace-grid">
          <section className="panel notation-panel" aria-labelledby="notation-heading">
            <pre className="notation notation-width-reference" aria-hidden="true">
              {notationWidthReference(section.parts[0]!.notation)}
            </pre>
            <div className="panel-heading">
              <div><p className="eyebrow">{activeDraft ? 'PLAYBACK PREVIEW' : 'THE NOTATION'}</p><h2 id="notation-heading">{section.name}</h2></div>
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
                    {part ? <NotationScore notation={part.notation} label={`${track.name}: ${part.notation.name}`}
                      readTick={readTick} sectionStart={current?.startTick ?? 0}
                      sectionEnd={current?.endTick ?? part.notation.durationTicks} playing={state === 'playing'} />
                      : <div className="rest">Listening for the next entrance</div>}
                  </div>
                );
              })}
            </div>
            <details className="arrangement">
              <summary>Explore the full arrangement <span>{song.sections.length} {song.sections.length === 1 ? 'section' : 'sections'}</span></summary>
              <p className="arrangement-hint">Choose a section to start there. Jump during playback to keep playing.</p>
              <ol>{song.sections.map((item, index) =>
                <li key={item.id} className={current?.sectionId === item.id ? 'current-section' : ''}>
                  <button className="section-button" aria-label={`Jump to section ${index + 1}: ${item.name}`}
                    aria-current={current?.sectionId === item.id ? 'location' : undefined}
                    onClick={() => void engineRef.current?.jumpToSection(item.id)}>
                    <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
                    <span>{item.name}</span>{item.times > 1 && <span className="section-repeats">({item.times}x)</span>}
                  </button>
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
        </div>}
      </main>
      <footer><span>jedeyafola · Made for the rhythm.</span><span>Original notation & recordings · SlapToonToonSlap</span></footer>
    </div>
  );
}
