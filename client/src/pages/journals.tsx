import { useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '../components/layout'
import { SlideOver } from '../components/modal'
import { Icon } from '../components/icons'
import { useToast } from '../components/toast'
import { useAuth } from '../app/auth'
import type { Journal } from '../app/types'

const categories = [
  'Body & Vitality',
  'Mind & Inner World',
  'Work & Mastery',
  'Wealth & Resources',
  'Connection & Belonging',
  'Meaning & Transcendence',
]

export function JournalsPage() {
  const { api } = useAuth()
  const { toast } = useToast()
  const [journals, setJournals] = useState<Journal[]>([])
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [categoryTags, setCategoryTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)

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

  const create = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await api.createJournal({
        title: title || undefined,
        content,
        tags: tags.trim() ? tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        category_tags: categoryTags.length > 0 ? categoryTags : undefined,
      })
      setTitle('')
      setContent('')
      setTags('')
      setCategoryTags([])
      setPanelOpen(false)
      toast('Entry saved', 'success')
      await load(search || undefined)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Journal save failed', 'error')
    }
  }

  const remove = async (id: string) => {
    try {
      await api.deleteJournal(id)
      toast('Entry deleted', 'success')
      await load(search || undefined)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error')
    }
  }

  const runSearch = async (e: FormEvent) => {
    e.preventDefault()
    await load(search || undefined)
  }

  const toggleCategory = (cat: string) => {
    setCategoryTags((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])
  }

  return (
    <AppShell
      title="Journal"
      subtitle="Capture reflections and thoughts"
      actions={
        <button className="ody-btn" onClick={() => setPanelOpen(true)}>
          <Icon name="plus" size={14} /> New Entry
        </button>
      }
    >
      {/* Search */}
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

      {/* Entries */}
      {loading ? (
        <div className="ody-grid">
          {[1, 2, 3].map((i) => <div key={i} className="ody-skeleton ody-skeleton-card" style={{ height: 90 }} />)}
        </div>
      ) : journals.length === 0 ? (
        <div className="ody-card">
          <div className="ody-empty">
            <div className="ody-empty-icon"><Icon name="book" size={22} /></div>
            <h4>{search ? 'No Results' : 'No Journal Entries'}</h4>
            <p>{search
              ? 'Try different search terms.'
              : 'Start writing to capture your reflections, gratitude, or random thoughts.'}
            </p>
            {!search ? (
              <button className="ody-btn" onClick={() => setPanelOpen(true)} style={{ marginTop: 16 }}>
                <Icon name="plus" size={14} /> Write Entry
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <ul className="ody-list ody-stagger">
          {journals.map((entry) => (
            <li key={entry.id} className="ody-list-item">
              <div className="ody-row">
                <span className="ody-item-title">{entry.title || 'Untitled entry'}</span>
                <button className="ody-icon-btn" onClick={() => void remove(entry.id)} aria-label="Delete entry">
                  <Icon name="trash" size={15} />
                </button>
              </div>
              <p className="ody-muted" style={{ margin: '8px 0 0', fontSize: '0.84rem', lineHeight: 1.6 }}>
                {entry.content.length > 200 ? `${entry.content.slice(0, 200)}...` : entry.content}
              </p>
              {((entry.tags && entry.tags.length > 0) || (entry.category_tags && entry.category_tags.length > 0)) ? (
                <div className="ody-item-meta" style={{ marginTop: 10 }}>
                  {entry.category_tags?.map((t) => (
                    <span key={t} className="ody-badge gold" style={{ fontSize: '0.62rem' }}>{t}</span>
                  ))}
                  {entry.tags?.map((t) => (
                    <span key={t} className="ody-badge" style={{ fontSize: '0.62rem' }}>{t}</span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {/* Create slide-over */}
      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="New Journal Entry"
        subtitle="Write freely — no structure required"
      >
        <form className="ody-grid" onSubmit={create}>
          <label className="ody-field">
            <span className="ody-label">Title (optional)</span>
            <input className="ody-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give it a name, or leave blank" />
          </label>
          <label className="ody-field">
            <span className="ody-label">Content</span>
            <textarea
              className="ody-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ minHeight: 160 }}
              placeholder="What's on your mind?"
            />
          </label>
          <div className="ody-field">
            <span className="ody-label">Life dimensions (optional)</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`ody-badge${categoryTags.includes(cat) ? ' gold' : ''}`}
                  style={{ cursor: 'pointer', fontSize: '0.64rem' }}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <label className="ody-field">
            <span className="ody-label">Tags (comma-separated)</span>
            <input className="ody-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="gratitude, reflection, idea" />
          </label>
          <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
            <button className="ody-btn" type="submit">
              <Icon name="check" size={14} /> Save Entry
            </button>
            <button className="ody-btn secondary" type="button" onClick={() => setPanelOpen(false)}>Cancel</button>
          </div>
        </form>
      </SlideOver>
    </AppShell>
  )
}
