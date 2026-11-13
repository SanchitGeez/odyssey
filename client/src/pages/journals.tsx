import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Feather, MagnifyingGlass, Plus, WarningCircle } from '@phosphor-icons/react'
import { AppShell } from '../components/layout'
import { DimensionFilter } from '../components/dimension-filter'
import { DimensionLabel } from '../components/dimension-label'
import { useAuth } from '../app/auth'
import type { Journal, LifeDimension } from '../app/types'
import { journalPreview, parseJournalContent } from '../lib/journal-format'
import './journal.css'

function dateLabel(iso: string) { return new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(iso)) }
function dayKey(iso: string) { const date = new Date(iso); return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` }

export function JournalsPage() {
  const { api } = useAuth()
  const [journals, setJournals] = useState<Journal[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dimFilter, setDimFilter] = useState<LifeDimension | 'all'>('all')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setJournals(await api.listJournals()) }
    catch (nextError) { setError(nextError && typeof nextError === 'object' && 'message' in nextError ? String(nextError.message) : 'Could not load your journal. Please try again.') }
    finally { setLoading(false) }
  }, [api])
  useEffect(() => { void load() }, [load])
  const groupedByDay = useMemo(() => {
    const query = search.toLocaleLowerCase().trim()
    const filtered = journals.filter((entry) => (dimFilter === 'all' || entry.category_tags?.includes(dimFilter)) && (!query || [entry.title || '', parseJournalContent(entry.content).plainText, ...(entry.tags || [])].join(' ').toLocaleLowerCase().includes(query)))
    const groups = new Map<string, Journal[]>()
    for (const entry of filtered) { const key = dayKey(entry.created_at); groups.set(key, [...(groups.get(key) || []), entry]) }
    return [...groups.entries()]
  }, [dimFilter, journals, search])
  return (
    <AppShell title="Journal" subtitle="Make room for reflection. Keep what matters." actions={<Link to="/journals/new" className="ody-btn"><Plus size={17} />New Entry</Link>}>
      <DimensionFilter value={dimFilter} onChange={setDimFilter} />
      <div className="journal-library-toolbar"><label className="journal-library-search"><MagnifyingGlass size={19} aria-hidden="true" /><span className="journal-sr-only">Search journal entries</span><input className="ody-input" type="search" placeholder="Search your writing, titles or tags" value={search} onChange={(event) => setSearch(event.target.value)} /></label><span className="ody-muted">{journals.length} {journals.length === 1 ? 'entry' : 'entries'}</span></div>
      {loading ? <div className="ody-grid" aria-label="Loading journal entries" role="status">{[1, 2, 3].map((item) => <div key={item} className="ody-skeleton ody-skeleton-card" style={{ height: 112 }} />)}</div> : error ? <div className="ody-card journal-library-empty" role="alert"><WarningCircle size={30} /><h2>Your journal is unavailable</h2><p>{error}</p><button className="ody-btn" onClick={() => void load()}>Try again</button></div> : !groupedByDay.length ? <div className="ody-card journal-library-empty"><Feather size={36} weight="light" /><h2>{search || dimFilter !== 'all' ? 'No matching entries' : 'Your story starts here'}</h2><p>{search || dimFilter !== 'all' ? 'Try another phrase or choose a different life dimension.' : 'A thought, a lesson, a moment worth remembering. Give it a page.'}</p>{search || dimFilter !== 'all' ? <button className="ody-btn secondary" onClick={() => { setSearch(''); setDimFilter('all') }}>Clear filters</button> : <Link to="/journals/new" className="ody-btn"><Feather size={18} />Write Entry</Link>}</div> : <div className="journal-library-list">{groupedByDay.map(([date, entries]) => <section key={date} className="journal-library-day"><h2>{dateLabel(entries[0].created_at)}</h2><div>{entries.map((entry) => <Link key={entry.id} to={`/journals/${entry.id}`} className="journal-library-entry"><div className="journal-entry-symbol" aria-hidden="true"><Feather size={22} weight="light" /></div><div className="journal-library-entry-content"><h3>{entry.title || 'Untitled entry'}</h3><p>{journalPreview(entry.content) || 'An empty page.'}</p>{entry.category_tags?.length ? <div className="journal-reading-dimensions">{entry.category_tags.map((tag) => <DimensionLabel key={tag} dim={tag} />)}</div> : null}</div><ArrowUpRight size={20} className="journal-entry-arrow" aria-hidden="true" /></Link>)}</div></section>)}</div>}
    </AppShell>
  )
}
