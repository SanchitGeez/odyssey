import { useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '../components/layout'
import { useAuth } from '../app/auth'
import type { Journal } from '../app/types'

export function JournalsPage() {
  const { api } = useAuth()
  const [journals, setJournals] = useState<Journal[]>([])
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [categoryTags, setCategoryTags] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async (query?: string) => {
    setLoading(true)
    setError('')
    try {
      const data = await api.listJournals(query)
      setJournals(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load journals'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const create = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await api.createJournal({
        title: title || undefined,
        content,
        tags: tags.trim() ? tags.split(',').map((entry) => entry.trim()).filter(Boolean) : undefined,
        category_tags: categoryTags.trim() ? categoryTags.split(',').map((entry) => entry.trim()).filter(Boolean) : undefined,
      })
      setTitle('')
      setContent('')
      setTags('')
      setCategoryTags('')
      await load(search || undefined)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Journal save failed'
      setError(message)
    }
  }

  const remove = async (journalId: string) => {
    try {
      await api.deleteJournal(journalId)
      await load(search || undefined)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
    }
  }

  const runSearch = async (event: FormEvent) => {
    event.preventDefault()
    await load(search || undefined)
  }

  return (
    <AppShell title="Journals" subtitle="Capture reflections and search across entries.">
      <section className="ody-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>New Entry</h3>
        <form className="ody-grid" onSubmit={create}>
          <label className="ody-field">
            <span className="ody-label">Title (optional)</span>
            <input className="ody-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="ody-field">
            <span className="ody-label">Content</span>
            <textarea className="ody-textarea" value={content} onChange={(e) => setContent(e.target.value)} required />
          </label>
          <div className="ody-grid two">
            <label className="ody-field">
              <span className="ody-label">Tags (comma-separated)</span>
              <input className="ody-input" value={tags} onChange={(e) => setTags(e.target.value)} />
            </label>
            <label className="ody-field">
              <span className="ody-label">Category tags (comma-separated)</span>
              <input className="ody-input" value={categoryTags} onChange={(e) => setCategoryTags(e.target.value)} />
            </label>
          </div>
          {error ? <p className="ody-error" style={{ margin: 0 }}>{error}</p> : null}
          <button className="ody-btn" type="submit">Save Entry</button>
        </form>
      </section>

      <section className="ody-card ody-grid">
        <form className="ody-row" onSubmit={runSearch}>
          <input
            className="ody-input"
            placeholder="Search journals"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="ody-btn secondary" type="submit">Search</button>
          <button className="ody-btn secondary" type="button" onClick={() => { setSearch(''); void load() }}>Reset</button>
        </form>

        {loading ? <p className="ody-muted">Loading journals...</p> : null}
        {!loading && journals.length === 0 ? <p className="ody-muted">No entries found.</p> : null}

        <ul className="ody-list">
          {journals.map((entry) => (
            <li key={entry.id} className="ody-list-item ody-grid">
              <div className="ody-row">
                <strong>{entry.title || 'Untitled entry'}</strong>
                <button className="ody-btn danger" onClick={() => void remove(entry.id)}>Delete</button>
              </div>
              <p className="ody-muted" style={{ margin: 0 }}>{entry.content.slice(0, 260)}{entry.content.length > 260 ? '...' : ''}</p>
              <div className="ody-row">
                <span className="ody-badge">tags: {(entry.tags || []).join(', ') || '-'}</span>
                <span className="ody-badge">category: {(entry.category_tags || []).join(', ') || '-'}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  )
}
