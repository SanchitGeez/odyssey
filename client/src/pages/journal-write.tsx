import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../app/auth'
import type { LifeDimension } from '../app/types'
import { DimensionLabel } from '../components/dimension-label'
import { Icon } from '../components/icons'
import { useToast } from '../components/toast'
import { DIMENSION_KEYS } from '../lib/dimensions'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function parseTags(input: string): string[] | undefined {
  const tags = input.split(',').map((tag) => tag.trim()).filter(Boolean)
  return tags.length ? tags : undefined
}

export function JournalWritePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { api } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(isEdit)
  const [journalId, setJournalId] = useState<string | null>(id ?? null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [categoryTags, setCategoryTags] = useState<LifeDimension[]>([])
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [closing, setClosing] = useState(false)
  const [hydrated, setHydrated] = useState(!isEdit)
  const lastSavedSignature = useRef('')

  useEffect(() => {
    if (!id) return
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const journal = await api.getJournal(id)
        if (!active) return
        setJournalId(journal.id)
        setTitle(journal.title || '')
        setContent(journal.content)
        setTagsInput((journal.tags || []).join(', '))
        setCategoryTags(journal.category_tags || [])
        const signature = JSON.stringify({
          title: journal.title || '',
          content: journal.content,
          tags: journal.tags || [],
          category_tags: journal.category_tags || [],
        })
        lastSavedSignature.current = signature
        setHydrated(true)
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

  const words = useMemo(() => {
    const count = content.trim().split(/\s+/).filter(Boolean).length
    return count
  }, [content])

  const toggleCategory = (cat: LifeDimension) => {
    setCategoryTags((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])
  }

  const buildDraftPayload = () => ({
    title: title.trim() || undefined,
    content: content.trim(),
    tags: parseTags(tagsInput),
    category_tags: categoryTags.length ? categoryTags : undefined,
  })

  const closeEditor = async () => {
    if (closing) return
    setClosing(true)
    const payload = buildDraftPayload()
    const signature = JSON.stringify({
      title: payload.title || '',
      content: payload.content || '',
      tags: payload.tags || [],
      category_tags: payload.category_tags || [],
    })

    let nextPath = journalId ? `/journals/${journalId}` : '/journals'
    try {
      setSaveState('saving')
      if (journalId) {
        const updatePayload = {
          title: payload.title,
          content: payload.content || undefined,
          tags: payload.tags,
          category_tags: payload.category_tags,
        }
        await api.updateJournal(journalId, updatePayload)
        lastSavedSignature.current = signature
        setSaveState('saved')
      } else if (payload.content) {
        const created = await api.createJournal({ ...payload, content: payload.content })
        setJournalId(created.id)
        nextPath = `/journals/${created.id}`
        lastSavedSignature.current = signature
        setSaveState('saved')
      }
    } catch (err) {
      setSaveState('error')
      toast(err instanceof Error ? err.message : 'Save failed while closing', 'error')
    } finally {
      navigate(nextPath)
    }
  }

  useEffect(() => {
    if (!hydrated) return
    const payload = buildDraftPayload()
    const hasDraft = Boolean(payload.content)
    if (!hasDraft) {
      setSaveState('idle')
      return
    }
    const signature = JSON.stringify({
      title: payload.title || '',
      content: payload.content,
      tags: payload.tags || [],
      category_tags: payload.category_tags || [],
    })
    if (signature === lastSavedSignature.current) return
    const timer = window.setTimeout(async () => {
      setSaveState('saving')
      try {
        if (journalId) {
          const updated = await api.updateJournal(journalId, payload)
          setJournalId(updated.id)
        } else {
          const created = await api.createJournal({ ...payload, content: payload.content })
          setJournalId(created.id)
          if (!id) {
            navigate(`/journals/${created.id}/edit`, { replace: true })
          }
        }
        lastSavedSignature.current = signature
        setSaveState('saved')
      } catch (err) {
        setSaveState('error')
        toast(err instanceof Error ? err.message : 'Auto-save failed', 'error')
      }
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [api, categoryTags, content, hydrated, id, journalId, navigate, tagsInput, title, toast])

  if (loading) {
    return (
      <div className="ody-journal-fullscreen">
        <div className="ody-card" style={{ margin: '80px auto', maxWidth: 420 }}>Loading entry...</div>
      </div>
    )
  }

  return (
    <div className="ody-journal-fullscreen">
      <header className="ody-journal-topbar">
        <div className="ody-journal-head">Journal</div>
        <div className="ody-journal-dim-picker">
          {DIMENSION_KEYS.map((dim) => (
            <button
              key={dim}
              type="button"
              className={`ody-journal-dim-chip${categoryTags.includes(dim) ? ' active' : ''}`}
              onClick={() => toggleCategory(dim)}
            >
              <DimensionLabel dim={dim} />
            </button>
          ))}
        </div>
        <button className="ody-icon-btn" aria-label="Close editor" onClick={() => void closeEditor()} disabled={closing}>
          <Icon name="x" size={18} />
        </button>
      </header>

      <main className="ody-journal-editor-wrap">
        <input
          className="ody-journal-title-input"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="ody-journal-content-input"
          placeholder="Write freely..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          className="ody-input"
          style={{ maxWidth: 680, margin: '8px auto 0' }}
          placeholder="Tags (comma separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </main>

      <footer className="ody-journal-bottombar">
        <span>{words} words</span>
        <span className="ody-journal-save-status">
          {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : saveState === 'error' ? 'Save error' : 'Idle'}
        </span>
      </footer>
    </div>
  )
}
