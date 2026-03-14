import { useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '../components/layout'
import { useAuth } from '../app/auth'
import type { Quest, QuestActivity, QuestActivityType, QuestStatus } from '../app/types'
import { formatDate, todayIso } from '../lib/date'

const activityTypes: QuestActivityType[] = [
  'progress_updated',
  'status_changed',
  'milestone_added',
  'milestone_completed',
  'note_added',
]

type QuestForm = {
  id?: string
  title: string
  description: string
  category: string
  target_date: string
  success_criteria: string
  progress_percent: string
  status: QuestStatus
}

const initialQuestForm: QuestForm = {
  title: '',
  description: '',
  category: '',
  target_date: '',
  success_criteria: '',
  progress_percent: '0',
  status: 'active',
}

export function QuestsPage() {
  const { api } = useAuth()
  const [quests, setQuests] = useState<Quest[]>([])
  const [selectedQuestId, setSelectedQuestId] = useState<string>('')
  const [activity, setActivity] = useState<QuestActivity[]>([])
  const [form, setForm] = useState<QuestForm>(initialQuestForm)
  const [activityType, setActivityType] = useState<QuestActivityType>('progress_updated')
  const [activityPayload, setActivityPayload] = useState('')
  const [activityDate, setActivityDate] = useState(todayIso())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadQuests = async () => {
    setLoading(true)
    try {
      const data = await api.listQuests()
      setQuests(data)
      if (!selectedQuestId && data.length > 0) {
        setSelectedQuestId(data[0].id)
      }
      setError('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load quests'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const loadActivity = async (questId: string) => {
    try {
      const data = await api.listQuestActivity(questId)
      setActivity(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load quest activity'
      setError(message)
    }
  }

  useEffect(() => {
    void loadQuests()
  }, [])

  useEffect(() => {
    if (!selectedQuestId) {
      setActivity([])
      return
    }
    void loadActivity(selectedQuestId)
  }, [selectedQuestId])

  const saveQuest = async (event: FormEvent) => {
    event.preventDefault()
    try {
      if (form.id) {
        await api.updateQuest(form.id, {
          title: form.title,
          description: form.description,
          category: form.category,
          target_date: form.target_date,
          success_criteria: form.success_criteria,
          status: form.status,
          progress_percent: Number(form.progress_percent),
        })
      } else {
        await api.createQuest({
          title: form.title,
          description: form.description,
          category: form.category,
          target_date: form.target_date,
          success_criteria: form.success_criteria,
        })
      }
      setForm(initialQuestForm)
      await loadQuests()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save quest'
      setError(message)
    }
  }

  const editQuest = (quest: Quest) => {
    setForm({
      id: quest.id,
      title: quest.title,
      description: quest.description || '',
      category: quest.category || '',
      target_date: quest.target_date || '',
      success_criteria: quest.success_criteria || '',
      progress_percent: `${quest.progress_percent || 0}`,
      status: quest.status,
    })
  }

  const removeQuest = async (questId: string) => {
    try {
      await api.deleteQuest(questId)
      if (selectedQuestId === questId) {
        setSelectedQuestId('')
        setActivity([])
      }
      await loadQuests()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
    }
  }

  const addActivity = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedQuestId) return
    try {
      let payload: Record<string, unknown> | undefined
      if (activityPayload.trim()) {
        payload = { note: activityPayload.trim() }
      }
      await api.addQuestActivity(selectedQuestId, activityType, activityDate, payload)
      setActivityPayload('')
      await loadActivity(selectedQuestId)
      await loadQuests()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not add activity'
      setError(message)
    }
  }

  return (
    <AppShell title="Quests" subtitle="Manage long-form goals and progress updates.">
      <section className="ody-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>{form.id ? 'Edit Quest' : 'New Quest'}</h3>
        <form className="ody-grid" onSubmit={saveQuest}>
          <label className="ody-field">
            <span className="ody-label">Title</span>
            <input className="ody-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </label>
          <label className="ody-field">
            <span className="ody-label">Description</span>
            <textarea className="ody-textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <div className="ody-grid three">
            <label className="ody-field">
              <span className="ody-label">Category</span>
              <input className="ody-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </label>
            <label className="ody-field">
              <span className="ody-label">Target Date</span>
              <input className="ody-input" type="date" value={form.target_date} onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))} />
            </label>
            <label className="ody-field">
              <span className="ody-label">Status</span>
              <select className="ody-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as QuestStatus }))}>
                <option value="active">active</option>
                <option value="paused">paused</option>
                <option value="completed">completed</option>
                <option value="archived">archived</option>
              </select>
            </label>
          </div>
          <label className="ody-field">
            <span className="ody-label">Success criteria</span>
            <textarea className="ody-textarea" value={form.success_criteria} onChange={(e) => setForm((f) => ({ ...f, success_criteria: e.target.value }))} />
          </label>
          {form.id ? (
            <label className="ody-field">
              <span className="ody-label">Progress %</span>
              <input className="ody-input" type="number" min={0} max={100} value={form.progress_percent} onChange={(e) => setForm((f) => ({ ...f, progress_percent: e.target.value }))} />
            </label>
          ) : null}
          {error ? <p className="ody-error" style={{ margin: 0 }}>{error}</p> : null}
          <button className="ody-btn" type="submit">{form.id ? 'Update Quest' : 'Create Quest'}</button>
        </form>
      </section>

      <section className="ody-card ody-grid two" style={{ alignItems: 'start' }}>
        <div className="ody-grid">
          <div className="ody-row">
            <h3 style={{ margin: 0 }}>Active Quests</h3>
            <button className="ody-btn secondary" onClick={() => setForm(initialQuestForm)}>Clear Form</button>
          </div>
          {loading ? <p className="ody-muted">Loading quests...</p> : null}
          <ul className="ody-list">
            {quests.map((quest) => (
              <li key={quest.id} className="ody-list-item ody-grid">
                <div className="ody-row">
                  <button className="ody-btn secondary" onClick={() => setSelectedQuestId(quest.id)}>{selectedQuestId === quest.id ? 'Viewing' : 'View Activity'}</button>
                  <span className="ody-badge">{quest.status}</span>
                </div>
                <strong>{quest.title}</strong>
                <span className="ody-muted">Progress: {quest.progress_percent ?? 0}% | Target: {formatDate(quest.target_date)}</span>
                <div className="ody-row">
                  <button className="ody-btn secondary" onClick={() => editQuest(quest)}>Edit</button>
                  <button className="ody-btn danger" onClick={() => void removeQuest(quest.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="ody-grid">
          <h3 style={{ margin: 0 }}>Quest Activity Timeline</h3>
          {!selectedQuestId ? <p className="ody-muted">Select a quest to view and add activity.</p> : null}
          {selectedQuestId ? (
            <form className="ody-grid" onSubmit={addActivity}>
              <div className="ody-grid two">
                <label className="ody-field">
                  <span className="ody-label">Activity type</span>
                  <select className="ody-select" value={activityType} onChange={(e) => setActivityType(e.target.value as QuestActivityType)}>
                    {activityTypes.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                  </select>
                </label>
                <label className="ody-field">
                  <span className="ody-label">Date</span>
                  <input className="ody-input" type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} required />
                </label>
              </div>
              <label className="ody-field">
                <span className="ody-label">Note / Payload</span>
                <textarea className="ody-textarea" value={activityPayload} onChange={(e) => setActivityPayload(e.target.value)} />
              </label>
              <button className="ody-btn" type="submit">Add Update</button>
            </form>
          ) : null}

          <ul className="ody-list">
            {activity.map((entry, index) => (
              <li className="ody-list-item" key={`${entry.activity_type}-${entry.event_date}-${index}`}>
                <div className="ody-row">
                  <span className="ody-badge">{entry.activity_type}</span>
                  <span className="ody-muted">{entry.event_date}</span>
                </div>
                <pre className="ody-muted" style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{JSON.stringify(entry.payload || {}, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  )
}
