import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../app/auth'
import type { Journal } from '../app/types'
import { DimensionLabel } from '../components/dimension-label'
import { Icon } from '../components/icons'
import { useToast } from '../components/toast'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).format(new Date(iso))
}

export function JournalReadPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { api } = useAuth()
  const { toast } = useToast()
  const [entry, setEntry] = useState<Journal | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/journals')
      return
    }
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const result = await api.getJournal(id)
        if (active) setEntry(result)
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Could not load journal', 'error')
        navigate('/journals')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [api, id, navigate, toast])

  const remove = async () => {
    if (!entry || deleting) return
    setDeleting(true)
    try {
      await api.deleteJournal(entry.id)
      toast('Entry deleted', 'success')
      navigate('/journals')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="ody-journal-fullscreen">
        <div className="ody-card" style={{ margin: '80px auto', maxWidth: 420 }}>Loading entry...</div>
      </div>
    )
  }

  if (!entry) {
    return null
  }

  return (
    <div className="ody-journal-fullscreen">
      <header className="ody-journal-topbar">
        <Link to="/journals">
          <button className="ody-icon-btn" aria-label="Back">
            <Icon name="arrow-left" size={18} />
          </button>
        </Link>
        <div className="ody-journal-head">Journal</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/journals/${entry.id}/edit`}>
            <button className="ody-icon-btn" aria-label="Edit entry">
              <Icon name="edit" size={16} />
            </button>
          </Link>
          <button className="ody-icon-btn" aria-label="Delete entry" onClick={() => void remove()} disabled={deleting}>
            <Icon name="trash" size={16} />
          </button>
        </div>
      </header>

      <main className="ody-journal-content">
        <p className="ody-journal-date">{formatDate(entry.created_at)}</p>
        <h1 className="ody-journal-title">{entry.title || 'Untitled entry'}</h1>
        {entry.category_tags?.length ? (
          <div className="ody-journal-tag-row">
            {entry.category_tags.map((tag) => (
              <DimensionLabel key={tag} dim={tag} />
            ))}
          </div>
        ) : null}
        <article className="ody-journal-reader-text">{entry.content}</article>
      </main>
    </div>
  )
}
