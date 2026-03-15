import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout'
import { DimensionFilter } from '../components/dimension-filter'
import { DimensionLabel } from '../components/dimension-label'
import { Icon } from '../components/icons'
import { useToast } from '../components/toast'
import { useAuth } from '../app/auth'
import type { Journal, LifeDimension } from '../app/types'

function dateLabel(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(iso))
}

function dayKey(iso: string) {
  return iso.slice(0, 10)
}

export function JournalsPage() {
  const { api } = useAuth()
  const { toast } = useToast()
  const [journals, setJournals] = useState<Journal[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dimFilter, setDimFilter] = useState<LifeDimension | 'all'>('all')

  const load = async (query?: string) => {
    setLoading(true)
    try {
      setJournals(await api.listJournals(query))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to load journals', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const runSearch = async (e: FormEvent) => {
    e.preventDefault()
    await load(search || undefined)
  }

  const filteredJournals = useMemo(
    () => journals.filter((entry) => dimFilter === 'all' || Boolean(entry.category_tags?.includes(dimFilter))),
    [dimFilter, journals],
  )

  const groupedByDay = useMemo(() => {
    const groups = new Map<string, Journal[]>()
    for (const journal of filteredJournals) {
      const key = dayKey(journal.created_at)
      const existing = groups.get(key) || []
      existing.push(journal)
      groups.set(key, existing)
    }
    return Array.from(groups.entries())
  }, [filteredJournals])

  return (
    <AppShell
      title="Journal"
      subtitle="A timeline of your reflections"
      actions={(
        <Link to="/journals/new">
          <button className="ody-btn">
            <Icon name="plus" size={14} /> New Entry
          </button>
        </Link>
      )}
    >
      <DimensionFilter value={dimFilter} onChange={setDimFilter} />

      <div className="ody-card" style={{ marginBottom: 16 }}>
        <form className="ody-row" onSubmit={runSearch}>
          <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center' }}>
            <Icon name="search" size={16} className="ody-muted" />
            <input
              className="ody-input"
              placeholder="Search journal entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 320 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="ody-btn secondary" type="submit">Search</button>
            <button className="ody-btn secondary" type="button" onClick={() => { setSearch(''); void load() }}>Reset</button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="ody-grid">
          {[1, 2, 3].map((i) => <div key={i} className="ody-skeleton ody-skeleton-card" style={{ height: 96 }} />)}
        </div>
      ) : groupedByDay.length === 0 ? (
        <div className="ody-card">
          <div className="ody-empty">
            <div className="ody-empty-icon"><Icon name="book" size={22} /></div>
            <h4>{search || dimFilter !== 'all' ? 'No Results' : 'No Journal Entries'}</h4>
            <p>{search || dimFilter !== 'all'
              ? 'Try different filters or search terms.'
              : 'Start writing to capture your reflections, gratitude, or random thoughts.'}
            </p>
            {!search && dimFilter === 'all' ? (
              <Link to="/journals/new">
                <button className="ody-btn" style={{ marginTop: 16 }}>
                  <Icon name="plus" size={14} /> Write Entry
                </button>
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="ody-card">
          <div className="ody-journal-timeline">
            {groupedByDay.map(([date, entries]) => (
              <section key={date}>
                <div className="ody-journal-day">{dateLabel(date)}</div>
                {entries.map((entry) => (
                  <Link key={entry.id} to={`/journals/${entry.id}`} className="ody-journal-entry-node">
                    <span className="ody-journal-dot" />
                    <div className="ody-journal-entry-content">
                      <div className="ody-row" style={{ gap: 8 }}>
                        <strong className="ody-item-title">{entry.title || 'Untitled entry'}</strong>
                      </div>
                      <p className="ody-journal-preview">
                        {entry.content}
                      </p>
                      {entry.category_tags?.length ? (
                        <div className="ody-item-meta">
                          {entry.category_tags.map((t) => (
                            <DimensionLabel key={t} dim={t} />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </section>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  )
}
