import { useMemo, useState } from 'react';
import { parseNotation } from '../core/parser';
import { NotationScore } from '../notation/NotationScore';
import { djembeSoundSets } from '../audio/samples';
import { addChannel, changeTiming, duplicateSection, editableInstruments, emptyStep, instrumentName,
  moveSection, newSection, readSteps, removeChannel, restNotation, stepNotation, writeSteps } from './draft';
import type { DraftChannel, DraftPart, SongDraft, Step, Timing } from './draft';

const zeroTick = () => 0;
const message = (error: unknown) => error instanceof Error ? error.message : 'Check your notation.';
const bounded = (value: number, max: number) => Math.max(1, Math.min(max, Math.round(value)));

function strokeName(step: Step, instrument: string): string {
  const names = instrument === 'djembe' ? { B: 'Bass', O: 'Tone', X: 'Slap', '.': 'Rest' }
    : instrument === 'krin' ? { B: 'Low', O: 'High', X: 'Side', '.': 'Rest' }
      : { B: 'Bass', O: 'Open', X: 'Closed', '.': 'Rest' };
  return `${step.flam ? 'Flam ' : ''}${step.bell ? step.stroke === '.' ? 'Bell' : `${names[step.stroke]} + bell` : names[step.stroke]}`;
}

function ChannelEditor({ channel, part, timing, index, canRemove, onChannel, onPart, onRemove }: {
  channel: DraftChannel; part: DraftPart; timing: Timing; index: number; canRemove: boolean;
  onChannel: (change: Partial<DraftChannel>) => void; onPart: (change: Partial<DraftPart>) => void; onRemove: () => void;
}) {
  const percussion = ['kenkeni', 'sangban', 'dununba'].includes(channel.instrument);
  const choices: Step[] = percussion
    ? [{ stroke: 'O', bell: false, flam: false }, { stroke: 'X', bell: false, flam: false },
      { stroke: '.', bell: true, flam: false }, { stroke: 'O', bell: true, flam: false },
      { stroke: 'X', bell: true, flam: false }, emptyStep()]
    : ['B', 'O', 'X', '.'].map(stroke => ({ stroke: stroke as Step['stroke'], bell: false, flam: false }));
  const [brush, setBrush] = useState(0);
  const [flam, setFlam] = useState(false);
  const [sourceText, setSourceText] = useState(false);
  const [modeError, setModeError] = useState('');
  const parsed = useMemo(() => {
    try { return { notation: parseNotation(part.raw, { ...timing, instrument: channel.instrument, name: channel.name }), error: '' }; }
    catch (error) { return { notation: null, error: message(error) }; }
  }, [part.raw, timing.subdivisions, timing.beatsPerMeasure, channel.instrument, channel.name]);
  const grid = useMemo(() => {
    try { return { steps: readSteps(part.raw, channel.instrument, timing), error: '' }; }
    catch (error) { return { steps: [], error: message(error) }; }
  }, [part.raw, channel.instrument, timing.subdivisions, timing.beatsPerMeasure]);
  const perMeasure = timing.beatsPerMeasure * timing.subdivisions;

  function mode(value: DraftPart['mode']) {
    if (value === 'builder' && grid.error) { setModeError(grid.error); return; }
    setModeError('');
    onPart({ mode: value });
  }
  function paint(index: number) {
    const selected = { ...choices[brush]!, flam: channel.instrument === 'djembe' && flam && choices[brush]!.stroke !== '.' };
    const previous = grid.steps[index]!;
    const same = previous.stroke === selected.stroke && previous.bell === selected.bell && previous.flam === selected.flam;
    const steps = grid.steps.map((step, position) => position === index ? same ? emptyStep() : selected : step);
    onPart({ raw: writeSteps(steps, timing) });
  }

  return <fieldset className="channel-editor">
    <legend>{String(index + 1).padStart(2, '0')} · {channel.name || 'Channel'}</legend>
    <div className="channel-settings">
      <label>Channel name<input aria-label={`Channel ${index + 1} name`} value={channel.name}
        onChange={event => onChannel({ name: event.target.value })} /></label>
      <label>Instrument<select aria-label={`Channel ${index + 1} instrument`} value={channel.instrument}
        onChange={event => onChannel({ instrument: event.target.value as DraftChannel['instrument'] })}>
        {editableInstruments.map(instrument => <option key={instrument} value={instrument}>{instrumentName(instrument)}</option>)}
      </select></label>
      {channel.instrument === 'djembe' && <label>Sound<select aria-label={`Channel ${index + 1} djembe sound`}
        value={channel.sampleSet} onChange={event => onChannel({ sampleSet: event.target.value as DraftChannel['sampleSet'] })}>
        {djembeSoundSets.map(soundSet => <option key={soundSet.id} value={soundSet.id}>{soundSet.name}</option>)}
      </select></label>}
      <button className="text-button remove-button" disabled={!canRemove} aria-label={`Remove channel ${index + 1}`}
        onClick={onRemove}>Remove channel</button>
    </div>
    <div className="editor-mode" role="group" aria-label={`Channel ${index + 1} notation mode`}>
      <button aria-pressed={part.mode === 'builder'} onClick={() => mode('builder')}>Notation buttons</button>
      <button aria-pressed={part.mode === 'manual'} onClick={() => mode('manual')}>Custom notation</button>
    </div>
    {modeError && <p className="error" role="alert">{modeError}</p>}
    {part.mode === 'manual' ? <>
      <label className="plain-toggle"><input type="checkbox" checked={sourceText}
        onChange={event => setSourceText(event.target.checked)} /> Show source text</label>
      <label className="sr-only" htmlFor={`notation-${channel.id}`}>{channel.name} notation</label>
      <textarea id={`notation-${channel.id}`} className={sourceText ? 'source-input' : 'notation-input'}
        aria-label={`Channel ${index + 1} custom notation`} value={part.raw} spellCheck={false}
        autoCapitalize="off" autoCorrect="off" onChange={event => { setModeError(''); onPart({ raw: event.target.value }); }} />
      <p className="notation-hint"><code>m</code> measure · <code>B O X</code> bass, tone, slap · <code>v</code> bell ·
        <code>1</code> pulse spacing · space separates beats</p>
    </> : grid.error ? <p className="error" role="alert">{grid.error} Switch to custom notation to edit this pattern.</p> : <>
      <div className="stroke-palette" role="group" aria-label={`Channel ${index + 1} stroke palette`}>
        {choices.map((choice, choiceIndex) => <button key={choiceIndex} aria-pressed={brush === choiceIndex}
          onClick={() => setBrush(choiceIndex)}>{strokeName(choice, channel.instrument)}</button>)}
        {channel.instrument === 'djembe' && <label><input type="checkbox" checked={flam}
          onChange={event => setFlam(event.target.checked)} /> Flam</label>}
      </div>
      <p className="builder-help">Choose a stroke, then click a pulse. Click the same stroke again to clear it.</p>
      <div className="step-measures">
        {Array.from({ length: grid.steps.length / perMeasure }, (_, measureIndex) =>
          <fieldset className="step-measure" key={measureIndex}><legend>Measure {measureIndex + 1}</legend>
            <div className="step-beats">{Array.from({ length: timing.beatsPerMeasure }, (_, beatIndex) =>
              <div className="step-beat" key={beatIndex}><span>Beat {beatIndex + 1}</span>
                <div className="step-pulses">{Array.from({ length: timing.subdivisions }, (_, pulseIndex) => {
                  const position = measureIndex * perMeasure + beatIndex * timing.subdivisions + pulseIndex;
                  const step = grid.steps[position]!;
                  return <button key={pulseIndex} className="step-button" aria-pressed={step.stroke !== '.' || step.bell}
                    aria-label={`Measure ${measureIndex + 1}, beat ${beatIndex + 1}, pulse ${pulseIndex + 1}: ${strokeName(step, channel.instrument)}`}
                    onClick={() => paint(position)}><span className="step-glyph" aria-hidden="true">{stepNotation(step)}</span></button>;
                })}</div>
              </div>)}</div>
          </fieldset>)}
      </div>
      <div className="measure-actions">
        <button className="secondary-button" disabled={grid.steps.length / perMeasure >= 16}
          onClick={() => onPart({ raw: writeSteps([...grid.steps, ...Array.from({ length: perMeasure }, emptyStep)], timing) })}>+ Add measure</button>
        <button className="text-button" disabled={grid.steps.length <= perMeasure}
          onClick={() => onPart({ raw: writeSteps(grid.steps.slice(0, -perMeasure), timing) })}>Remove last measure</button>
      </div>
    </>}
    <button className="text-button clear-pattern" onClick={() => { setModeError(''); onPart({ raw: restNotation(timing) }); }}>Clear pattern</button>
    {parsed.error && part.mode === 'manual' && <p className="error" role="alert">{parsed.error}</p>}
    {parsed.notation && <div className="channel-preview"><span className="builder-help">Notation preview · {parsed.notation.measureCount} {parsed.notation.measureCount === 1 ? 'measure' : 'measures'}</span>
      <NotationScore notation={parsed.notation} label={`${channel.name} editor preview`} readTick={zeroTick}
        sectionStart={0} sectionEnd={parsed.notation.durationTicks} playing={false} /></div>}
  </fieldset>;
}

export function SongComposer({ draft, onChange, onPlay, onStop, playing, saveMessage, playError }: {
  draft: SongDraft; onChange: (draft: SongDraft) => void; onPlay: (sectionId?: string) => void;
  onStop: () => void; playing: boolean; saveMessage: string; playError: string;
}) {
  const [selectedId, setSelectedId] = useState(draft.sections[0]!.id);
  const [timingError, setTimingError] = useState('');
  const section = draft.sections.find(item => item.id === selectedId) ?? draft.sections[0]!;
  function updateSection(change: Partial<typeof section>) {
    onChange({ ...draft, sections: draft.sections.map(item => item.id === section.id ? { ...item, ...change } : item) });
  }
  function timing(change: Partial<Timing>) {
    try { onChange(changeTiming(draft, { ...draft, ...change })); setTimingError(''); }
    catch (error) { setTimingError(message(error)); }
  }
  function addSection() {
    const next = newSection(draft, `Section ${draft.sections.length + 1}`);
    onChange({ ...draft, sections: [...draft.sections, next] });
    setSelectedId(next.id);
  }
  function duplicate() {
    const next = duplicateSection(draft, section.id);
    const index = next.sections.findIndex(item => item.id === section.id);
    onChange(next);
    setSelectedId(next.sections[index + 1]!.id);
  }

  return <section className="panel song-composer" aria-labelledby="composer-heading">
    <div className="panel-heading"><div><p className="eyebrow">MAKE IT YOUR OWN</p><h2 id="composer-heading">Song builder</h2></div>
      <span className="save-message" role="status">{saveMessage}</span></div>
    <p className="panel-description">One section makes a fragment. Add sections to build your arrangement.</p>
    <div className="composer-settings">
      <label>Song name<input value={draft.name} onChange={event => onChange({ ...draft, name: event.target.value })} /></label>
      <label>Beats per measure<select value={draft.beatsPerMeasure}
        onChange={event => timing({ beatsPerMeasure: Number(event.target.value) })}>
        {Array.from({ length: 12 }, (_, index) => index + 1).map(value => <option key={value} value={value}>{value}</option>)}
      </select></label>
      <label>Pulses per beat<select value={draft.subdivisions}
        onChange={event => timing({ subdivisions: Number(event.target.value) as 3 | 4 })}>
        <option value="4">4 · straight</option><option value="3">3 · ternary</option>
      </select></label>
    </div>
    {timingError && <p className="error" role="alert">{timingError}</p>}
    <div className="composer-arrangement">
      <div className="composer-section-heading"><h3>Your arrangement</h3><button className="secondary-button" onClick={addSection}>+ Add section</button></div>
      <ol className="composer-section-list">{draft.sections.map((item, index) => <li key={item.id} className={item.id === section.id ? 'is-selected' : ''}>
        <button className="choose-section" aria-current={item.id === section.id ? 'true' : undefined}
          onClick={() => setSelectedId(item.id)}>{String(index + 1).padStart(2, '0')} · {item.name || 'Untitled section'}{item.times > 1 ? ` (${item.times}x)` : ''}</button>
        <button className="section-order" aria-label={`Move section ${index + 1} up`} disabled={index === 0}
          onClick={() => onChange(moveSection(draft, item.id, -1))}>↑</button>
        <button className="section-order" aria-label={`Move section ${index + 1} down`} disabled={index === draft.sections.length - 1}
          onClick={() => onChange(moveSection(draft, item.id, 1))}>↓</button>
      </li>)}</ol>
    </div>
    <div className="section-settings">
      <label>Section name<input value={section.name} onChange={event => updateSection({ name: event.target.value })} /></label>
      <label>Repeat<input type="number" min="1" max="64" value={section.times}
        onChange={event => { if (Number.isFinite(event.target.valueAsNumber)) updateSection({ times: bounded(event.target.valueAsNumber, 64) }); }} /></label>
      <button className="text-button" onClick={duplicate}>Duplicate section</button>
      <button className="text-button remove-button" disabled={draft.sections.length === 1}
        onClick={() => { onChange({ ...draft, sections: draft.sections.filter(item => item.id !== section.id) }); setSelectedId(draft.sections.find(item => item.id !== section.id)!.id); }}>Remove section</button>
    </div>
    <p className="builder-help">Editing {section.name || 'this section'}. Shorter channel patterns repeat to match its longest pattern. Changes apply when you press Play.</p>
    <div className="composer-channels">{draft.channels.map((channel, index) => <ChannelEditor
      key={`${section.id}:${channel.id}:${channel.instrument}`} channel={channel} part={section.parts[channel.id]!} timing={draft}
      index={index} canRemove={draft.channels.length > 1}
      onChannel={change => onChange({ ...draft, channels: draft.channels.map(item => item.id === channel.id ? { ...item, ...change } : item) })}
      onPart={change => updateSection({ parts: { ...section.parts, [channel.id]: { ...section.parts[channel.id]!, ...change } } })}
      onRemove={() => onChange(removeChannel(draft, channel.id))} />)}</div>
    <div className="composer-actions">
      <button className="secondary-button" onClick={() => onChange(addChannel(draft))}>+ Add channel</button>
      <div className="composer-play-actions"><button className="secondary-button" onClick={onStop} disabled={!playing}>■ Stop preview</button>
        <button className="secondary-button" onClick={() => onPlay(section.id)}>▶ Play section</button>
        <button className="play-button" onClick={() => onPlay()}>▶ Play song</button></div>
    </div>
    {playError && <p className="error">{playError}</p>}
  </section>;
}
