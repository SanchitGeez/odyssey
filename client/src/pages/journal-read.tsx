import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Feather, PencilSimple, SlidersHorizontal, Trash, WarningCircle } from '@phosphor-icons/react'
import { useAuth } from '../app/auth'
import type { Journal } from '../app/types'
import { DimensionLabel } from '../components/dimension-label'
import { SlideOver } from '../components/modal'
import { parseJournalContent, safeJournalLink, type JournalNode } from '../lib/journal-format'
import './journal.css'

function errorMessage(error: unknown, fallback: string) { return error && typeof error === 'object' && 'message' in error ? String(error.message) : fallback }

export function JournalReadPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { api } = useAuth()
  const [entry, setEntry] = useState<Journal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const load = useCallback(async () => {
    if (!id) return
    setLoading(true); setError('')
    try { setEntry(await api.getJournal(id)) }
    catch (nextError) { setError(errorMessage(nextError, 'Could not load this entry. Try again.')) }
    finally { setLoading(false) }
  }, [api, id])
  useEffect(() => { void load() }, [load])
  const remove = async () => {
    if (!entry || deleting) return
    setDeleting(true); setError('')
    try { await api.deleteJournal(entry.id); navigate('/journals') }
    catch (nextError) { setError(errorMessage(nextError, 'Could not delete this entry. Try again.')); setDeleting(false) }
  }
  useLayoutEffect(() => {
    const header = headerRef.current
    const workspace = workspaceRef.current
    if (!header || !workspace) return
    const measure = () => workspace.style.setProperty('--journal-header-height', `${header.getBoundingClientRect().height}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])
  const parsed = entry ? parseJournalContent(entry.content) : null
  return (
    <div ref={workspaceRef} className="journal-workspace journal-reading-workspace">
      <header ref={headerRef} className="journal-topbar">
        <div className="journal-topbar-main">
          <Link className="journal-back" to="/journals" aria-label="Back to journal"><ArrowLeft size={19} /><span>Journal</span></Link>
          <span className="journal-topbar-status journal-reader-status">Your reflections</span>
          <div className="journal-topbar-actions">{entry ? <>
            <button className="journal-command journal-details-command" onClick={() => setDetailsOpen(true)} aria-label="Entry details"><SlidersHorizontal size={19} /><span>Details</span></button>
            <Link className="ody-btn secondary" to={`/journals/${entry.id}/edit`}><PencilSimple size={17} />Edit entry</Link>
          </> : null}</div>
        </div>
        {error && entry ? <div className="journal-save-error" role="alert"><WarningCircle size={20} />{error}</div> : null}
      </header>
      {loading ? <div className="journal-loading" role="status"><Feather size={30} /><p>Opening your entry...</p></div> : !entry ? <div className="journal-loading" role="alert"><WarningCircle size={30} /><h1>Entry unavailable</h1><p>{error || 'This entry could not be found.'}</p><button className="ody-btn" onClick={() => void load()}>Try again</button></div> : <main className="journal-writing-area">
        <div className="journal-scroll-cap" aria-hidden="true" />
        <section className="journal-scroll">
          <div className="journal-scroll-heading"><time className="journal-date" dateTime={entry.created_at}>{new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(entry.created_at))}</time></div>
          <h1 className="journal-reading-title">{entry.title || 'Untitled entry'}</h1>
          {parsed?.supported ? <JournalReader document={parsed.document} /> : <div className="journal-unsupported"><p>This entry uses an unsupported format. Its original content is preserved below.</p><pre>{entry.content}</pre></div>}
        </section>
        <div className="journal-scroll-cap journal-scroll-cap-bottom" aria-hidden="true" />
      </main>}
      <SlideOver open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Entry details" subtitle="The context around your writing.">
        {entry ? <div className="journal-entry-metadata">
          <dl className="journal-entry-stats"><div><dt>Length</dt><dd>{parsed?.supported ? `${parsed.plainText.trim().split(/\s+/).filter(Boolean).length} words` : 'Original content'}</dd></div><div><dt>Last saved</dt><dd>{new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(entry.updated_at))}</dd></div></dl>
          <div><h3 className="journal-details-label">Life dimensions</h3>{entry.category_tags?.length ? <div className="journal-reading-dimensions">{entry.category_tags.map((tag) => <DimensionLabel key={tag} dim={tag} />)}</div> : <p className="journal-details-hint">No dimensions selected.</p>}</div>
          <div><h3 className="journal-details-label">Tags</h3>{entry.tags?.length ? <div className="journal-reading-tags" aria-label="Entry tags">{entry.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div> : <p className="journal-details-hint">No tags added.</p>}</div>
          <button className="ody-btn secondary" onClick={() => setDetailsOpen(false)}>Done</button>
          <button className="journal-delete-command" onClick={() => { setDetailsOpen(false); setConfirmDelete(true) }}><Trash size={17} />Delete entry</button>
        </div> : null}
      </SlideOver>
      <SlideOver open={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)} title="Delete this entry?" subtitle="This permanently removes the entry and its writing."><div className="journal-leave-actions"><button className="ody-btn danger" disabled={deleting} onClick={() => void remove()}>{deleting ? 'Deleting...' : 'Delete entry'}</button><button className="ody-btn secondary" disabled={deleting} onClick={() => setConfirmDelete(false)}>Keep entry</button>{error ? <p role="alert" className="ody-field-error">{error}</p> : null}</div></SlideOver>
    </div>
  )
}

function InlineNode({ node }: { node: JournalNode }) {
  let body: ReactNode = node.text || ''
  for (const mark of node.marks || []) {
    if (mark.type === 'bold') body = <strong>{body}</strong>
    else if (mark.type === 'italic') body = <em>{body}</em>
    else if (mark.type === 'strike') body = <s>{body}</s>
    else if (mark.type === 'underline') body = <u>{body}</u>
    else if (mark.type === 'code') body = <code>{body}</code>
    else if (mark.type === 'link') { const href = safeJournalLink(String(mark.attrs?.href || '')); if (href) body = <a href={href} target="_blank" rel="noopener noreferrer">{body}</a> }
  }
  return <>{body}</>
}

function ReadNode({ node }: { node: JournalNode }) {
  const children = node.content?.map((child, index) => <ReadNode key={index} node={child} />)
  if (node.type === 'text') return <InlineNode node={node} />
  if (node.type === 'hardBreak') return <br />
  if (node.type === 'horizontalRule') return <hr />
  if (node.type === 'paragraph') return <p>{children?.length ? children : <br />}</p>
  if (node.type === 'heading') { if (node.attrs?.level === 1) return <h2 data-journal-level="1">{children}</h2>; if (node.attrs?.level === 2) return <h3 data-journal-level="2">{children}</h3>; return <h4 data-journal-level="3">{children}</h4> }
  if (node.type === 'blockquote') return <blockquote>{children}</blockquote>
  if (node.type === 'bulletList') return <ul>{children}</ul>
  if (node.type === 'orderedList') return <ol start={typeof node.attrs?.start === 'number' ? node.attrs.start : 1}>{children}</ol>
  if (node.type === 'listItem') return <li>{children}</li>
  if (node.type === 'taskList') return <ul data-type="taskList">{children}</ul>
  if (node.type === 'taskItem') return <li data-type="taskItem" data-checked={Boolean(node.attrs?.checked)}><input type="checkbox" checked={Boolean(node.attrs?.checked)} disabled aria-label={node.attrs?.checked ? 'Completed item' : 'Incomplete item'} /><div>{children}</div></li>
  if (node.type === 'codeBlock') return <pre><code>{children}</code></pre>
  return <>{children}</>
}

function JournalReader({ document }: { document: JournalNode }) {
  return <article className="journal-prose journal-reader"><ReadNode node={document} /></article>
}
