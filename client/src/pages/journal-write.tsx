import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowsIn, ArrowsOut, CheckCircle, CloudArrowUp, Feather, SlidersHorizontal, TextAa, WarningCircle } from '@phosphor-icons/react'
import { useAuth } from '../app/auth'
import type { LifeDimension } from '../app/types'
import { DimensionLabel } from '../components/dimension-label'
import { JournalEditor } from '../components/journal-editor'
import { SlideOver } from '../components/modal'
import { DIMENSION_KEYS } from '../lib/dimensions'
import { documentText, encodeJournalContent, parseJournalContent, textDocument, type JournalNode } from '../lib/journal-format'
import './journal.css'

type SaveState = 'unsaved' | 'saving' | 'saved' | 'error'
type Draft = { title: string; document: JournalNode; tagsInput: string; categoryTags: LifeDimension[] }
function parseTags(value: string) { return [...new Set(value.split(',').map((tag) => tag.trim()).filter(Boolean))] }
function signature(draft: Draft) { return JSON.stringify({ title: draft.title.trim(), document: draft.document, tags: parseTags(draft.tagsInput), category_tags: draft.categoryTags }) }
function errorMessage(error: unknown, fallback: string) { return error && typeof error === 'object' && 'message' in error ? String(error.message) : fallback }
const blankDraft = (): Draft => ({ title: '', document: textDocument(''), tagsInput: '', categoryTags: [] })

export function JournalWritePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { api } = useAuth()
  const [draft, setDraft] = useState<Draft>(blankDraft)
  const draftRef = useRef(draft)
  const [initialDocument, setInitialDocument] = useState<JournalNode>(draft.document)
  const journalIdRef = useRef(id || null)
  const lastSaved = useRef(signature(draft))
  const [savedSignature, setSavedSignature] = useState(lastSaved.current)
  const [loading, setLoading] = useState(Boolean(id))
  const [ready, setReady] = useState(!id)
  const [loadError, setLoadError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [unsupportedContent, setUnsupportedContent] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [saveError, setSaveError] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [focusMode, setFocusMode] = useState(false)
  const [formattingOpen, setFormattingOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [toolbarHost, setToolbarHost] = useState<HTMLDivElement | null>(null)
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString())
  const workspaceRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const queue = useRef<Promise<boolean>>(Promise.resolve(true))
  const words = documentText(draft.document).trim().split(/\s+/).filter(Boolean).length
  const dirty = signature(draft) !== savedSignature
  const canSave = ready && unsupportedContent === null
  const blocker = useBlocker(() => ready && unsupportedContent === null && signature(draftRef.current) !== lastSaved.current)
  const leaveDialogOpen = leaveOpen || blocker.state === 'blocked'
  const stay = () => { setLeaveOpen(false); if (blocker.state === 'blocked') blocker.reset() }

  useEffect(() => {
    if (!id) return
    let active = true
    const load = async () => {
      setLoading(true); setLoadError(''); setReady(false)
      try {
        const entry = await api.getJournal(id)
        if (!active) return
        const parsed = parseJournalContent(entry.content)
        const nextDraft: Draft = { title: entry.title || '', document: parsed.document, tagsInput: (entry.tags || []).join(', '), categoryTags: entry.category_tags || [] }
        draftRef.current = nextDraft
        setDraft(nextDraft); setInitialDocument(parsed.document)
        journalIdRef.current = entry.id
        lastSaved.current = signature(nextDraft); setSavedSignature(lastSaved.current)
        setUnsupportedContent(parsed.supported ? null : entry.content)
        setSavedAt(entry.updated_at); setEntryDate(entry.created_at); setReady(true); setSaveState('saved')
      } catch (error) { if (active) setLoadError(errorMessage(error, 'Could not load this entry. Try again.')) }
      finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [api, id, loadAttempt])

  const change = (patch: Partial<Draft>) => {
    const next = { ...draftRef.current, ...patch }
    draftRef.current = next; setDraft(next); setSaveState('unsaved'); setSaveError('')
  }

  const saveDraft = useCallback(() => {
    const persist = async (): Promise<boolean> => {
      const snapshot = draftRef.current
      const snapshotSignature = signature(snapshot)
      if (snapshotSignature === lastSaved.current) return true
      if (!journalIdRef.current && !documentText(snapshot.document).trim()) {
        setSaveError('Write something before saving your entry.'); setSaveState('error'); return false
      }
      setSaveState('saving'); setSaveError('')
      try {
        const payload = { title: snapshot.title.trim() || null, content: encodeJournalContent(snapshot.document), tags: parseTags(snapshot.tagsInput), category_tags: snapshot.categoryTags }
        const saved = journalIdRef.current ? await api.updateJournal(journalIdRef.current, payload) : await api.createJournal(payload)
        journalIdRef.current = saved.id
        lastSaved.current = snapshotSignature; setSavedSignature(snapshotSignature); setSavedAt(saved.updated_at); setEntryDate(saved.created_at)
        setSaveState(signature(draftRef.current) === snapshotSignature ? 'saved' : 'unsaved')
        return true
      } catch (error) {
        setSaveState('error'); setSaveError(`Your writing is still here. ${errorMessage(error, 'The connection is unavailable.')} Retry when you are ready.`); return false
      }
    }
    queue.current = queue.current.then(persist, persist)
    return queue.current
  }, [api])

  useEffect(() => {
    if (!canSave || closing || leaveDialogOpen || !dirty || (!journalIdRef.current && !documentText(draft.document).trim())) return
    const timer = window.setTimeout(() => { void saveDraft() }, 1400)
    return () => window.clearTimeout(timer)
  }, [canSave, closing, leaveDialogOpen, dirty, draft, saveDraft])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (signature(draftRef.current) !== lastSaved.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  useLayoutEffect(() => {
    const header = headerRef.current
    const workspace = workspaceRef.current
    if (!header || !workspace) return
    const measure = () => workspace.style.setProperty('--journal-header-height', `${header.getBoundingClientRect().height}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    return () => observer.disconnect()
  }, [loading, loadError])

  useLayoutEffect(() => {
    const field = titleRef.current
    if (!field) return
    let active = true
    let previousWidth = -1
    const measure = () => { field.style.height = 'auto'; field.style.height = `${field.scrollHeight}px` }
    const observer = new ResizeObserver(() => { if (field.clientWidth !== previousWidth) { previousWidth = field.clientWidth; measure() } })
    measure()
    observer.observe(field)
    void document.fonts.ready.then(() => { if (active) measure() })
    return () => { active = false; observer.disconnect() }
  }, [draft.title, loading])

  const destination = () => journalIdRef.current ? `/journals/${journalIdRef.current}` : '/journals'
  const leave = () => { if (dirty) setLeaveOpen(true); else navigate(destination()) }
  const saveAndLeave = async () => {
    if (closing || !canSave) return
    setClosing(true)
    const saved = await saveDraft()
    // A queued request may have started before the final keystroke. Flush the latest snapshot.
    const flushed = saved && signature(draftRef.current) !== lastSaved.current ? await saveDraft() : saved
    if (flushed) { if (blocker.state === 'blocked') blocker.proceed(); else navigate(destination()) }
    else { setClosing(false); setLeaveOpen(false); if (blocker.state === 'blocked') blocker.reset() }
  }

  if (loading) return <div className="journal-workspace"><div className="journal-loading" role="status"><Feather size={30} /><p>Unrolling your entry...</p></div></div>
  if (loadError) return <div className="journal-workspace"><div className="journal-loading" role="alert"><WarningCircle size={32} /><h1>Entry unavailable</h1><p>{loadError}</p><button className="ody-btn" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Try again</button><button className="ody-btn secondary" onClick={() => navigate('/journals')}>Back to journal</button></div></div>

  return (
    <div ref={workspaceRef} className={`journal-workspace${focusMode ? ' journal-focus' : ''}`}>
      <header ref={headerRef} className="journal-topbar">
        <h1 className="journal-sr-only">Write a journal entry</h1>
        <div className="journal-topbar-main">
          <button type="button" className="journal-back" onClick={leave} disabled={closing} aria-label="Back to journal"><ArrowLeft size={19} /><span>Journal</span></button>
          <div className="journal-topbar-status" role="status" aria-live="polite" title={savedAt ? `Last saved ${new Date(savedAt).toLocaleTimeString()}` : 'Your entry autosaves as you write'}>{saveState === 'saving' ? <CloudArrowUp size={16} /> : saveState === 'error' ? <WarningCircle size={16} /> : <CheckCircle size={16} />}<span>{saveState === 'saving' ? 'Saving...' : saveState === 'error' ? 'Could not save' : dirty ? 'Unsaved changes' : savedAt ? 'All changes saved' : 'A new page'}</span></div>
          <div className="journal-topbar-actions">
            <button type="button" className={`journal-command${formattingOpen ? ' is-active' : ''}`} disabled={!canSave || closing} onClick={() => setFormattingOpen((open) => !open)} aria-label="Formatting tools" aria-expanded={formattingOpen} aria-controls="journal-format-host"><TextAa size={19} /><span>Format</span></button>
            <button type="button" className="journal-command journal-details-command" onClick={() => setDetailsOpen(true)} aria-label="Entry details" title="Entry details" disabled={closing}><SlidersHorizontal size={19} /><span>Details</span></button>
            <button type="button" className="journal-tool journal-focus-command" onClick={() => { setFocusMode((focus) => !focus); setFormattingOpen(false) }} aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'} aria-pressed={focusMode} title={focusMode ? 'Exit focus mode' : 'Focus mode'}>{focusMode ? <ArrowsIn /> : <ArrowsOut />}</button>
            <button type="button" className="ody-btn journal-save-command" disabled={closing || !canSave} onClick={() => void saveAndLeave()}>{closing ? 'Saving...' : 'Save & close'}</button>
          </div>
        </div>
        <div id="journal-format-host" className="journal-format-host" ref={setToolbarHost} />
        {saveError ? <div className="journal-save-error" role="alert"><WarningCircle size={20} /><span>{saveError}</span><button className="ody-btn secondary" onClick={() => void saveDraft()} disabled={closing}>Retry save</button></div> : null}
      </header>
      <main className="journal-writing-area">
        <div className="journal-scroll-cap" aria-hidden="true" />
        <section className="journal-scroll" aria-label="Journal scroll">
          <div className="journal-scroll-heading"><time className="journal-date" dateTime={entryDate}>{new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(entryDate))}</time></div>
          {unsupportedContent !== null ? <div role="status" className="journal-unsupported"><h2>{draft.title || 'Journal entry'}</h2><p>This entry uses a format this editor cannot safely change. The original content is shown below and will be preserved.</p><pre>{unsupportedContent}</pre></div> : <>
            <label className="journal-title-label"><span className="journal-sr-only">Entry title (optional)</span><textarea ref={titleRef} rows={1} className="journal-title-field" aria-label="Entry title (optional)" placeholder="Give this moment a title" maxLength={255} value={draft.title} onChange={(event) => change({ title: event.target.value })} disabled={closing} /></label>
            <JournalEditor initialContent={initialDocument} onChange={(document) => change({ document })} disabled={closing} toolbarHost={toolbarHost} formattingOpen={formattingOpen} />
          </>}
        </section>
        <div className="journal-scroll-cap journal-scroll-cap-bottom" aria-hidden="true" />
      </main>
      <SlideOver open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Entry details" subtitle="A little context for this moment.">
        <div className="journal-entry-metadata">
          <dl className="journal-entry-stats"><div><dt>Length</dt><dd>{words} {words === 1 ? 'word' : 'words'}</dd></div><div><dt>Last saved</dt><dd>{savedAt ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(savedAt)) : 'Not saved yet'}</dd></div></dl>
          {canSave ? <>
            <fieldset className="journal-dimension-field"><legend>Life dimensions</legend><div className="journal-dimensions">{DIMENSION_KEYS.map((dimension) => <button key={dimension} type="button" className={`journal-dimension${draft.categoryTags.includes(dimension) ? ' is-active' : ''}`} aria-pressed={draft.categoryTags.includes(dimension)} disabled={closing} onClick={() => change({ categoryTags: draft.categoryTags.includes(dimension) ? draft.categoryTags.filter((tag) => tag !== dimension) : [...draft.categoryTags, dimension] })}><DimensionLabel dim={dimension} /></button>)}</div></fieldset>
            <label className="journal-tags-label"><span>Tags</span><input className="ody-input" aria-label="Entry tags, separated by commas" placeholder="Add tags, separated by commas" value={draft.tagsInput} onChange={(event) => change({ tagsInput: event.target.value })} disabled={closing} /></label>
          </> : <p>This entry’s format is read-only.</p>}
          <p className="journal-details-hint">Changes autosave with your writing.</p>
          <button type="button" className="ody-btn secondary" onClick={() => setDetailsOpen(false)}>Done</button>
        </div>
      </SlideOver>
      <SlideOver open={leaveDialogOpen} onClose={() => !closing && stay()} title="Keep your writing?" subtitle="You have changes that have not been saved yet.">
        <div className="journal-leave-actions"><button className="ody-btn" disabled={closing} onClick={() => void saveAndLeave()}>{closing ? 'Saving...' : 'Save & close'}</button><button className="ody-btn secondary" disabled={closing} onClick={stay}>Keep writing</button><button className="ody-btn danger" disabled={closing} onClick={async () => { setClosing(true); await queue.current; lastSaved.current = signature(draftRef.current); if (blocker.state === 'blocked') blocker.proceed(); else navigate(destination()) }}>Discard unsaved changes</button></div>
      </SlideOver>
    </div>
  )
}
