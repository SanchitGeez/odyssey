import { useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '../components/layout'
import { SlideOver } from '../components/modal'
import { Icon } from '../components/icons'
import { useToast } from '../components/toast'
import { useAuth } from '../app/auth'
import type { Quest, QuestActivity, QuestActivityType, QuestStatus } from '../app/types'
import { formatDate, todayIso } from '../lib/date'

const categories = [
  'Body & Vitality',
  'Mind & Inner World',
  'Work & Mastery',
  'Wealth & Resources',
  'Connection & Belonging',
  'Meaning & Transcendence',
]

const activityTypes: QuestActivityType[] = [
  'progress_updated',
  'status_changed',
  'milestone_added',
  'milestone_completed',
  'note_added',
]

const activityLabels: Record<string, string> = {
  progress_updated: 'Progress Update',
  status_changed: 'Status Change',
  milestone_added: 'Milestone Added',
  milestone_completed: 'Milestone Complete',
  note_added: 'Note',
}

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

const initialForm: QuestForm = {
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
  const { toast } = useToast()
  const [quests, setQuests] = useState<Quest[]>([])
  const [selectedQuestId, setSelectedQuestId] = useState('')
  const [activity, setActivity] = useState<QuestActivity[]>([])
  const [form, setForm] = useState<QuestForm>(initialForm)
  const [panelOpen, setPanelOpen] = useState(false)
  const [activityType, setActivityType] = useState<QuestActivityType>('progress_updated')
  const [activityPayload, setActivityPayload] = useState('')
  const [activityDate, setActivityDate] = useState(todayIso())
  const [loading, setLoading] = useState(true)

  const loadQuests = async () => {
    setLoading(true)
    try {
      const data = await api.listQuests()
      setQuests(data)
      if (!selectedQuestId && data.length > 0) setSelectedQuestId(data[0].id)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to load quests', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadActivity = async (qid: string) => {
    try {
      setActivity(await api.listQuestActivity(qid))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to load activity', 'error')
    }
  }

  useEffect(() => { void loadQuests() }, [])
  useEffect(() => {
    if (selectedQuestId) void loadActivity(selectedQuestId)
    else setActivity([])
  }, [selectedQuestId])

  const selectedQuest = quests.find((q) => q.id === selectedQuestId)

  const openCreate = () => { setForm(initialForm); setPanelOpen(true) }
  const openEdit = (quest: Quest) => {
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
    setPanelOpen(true)
  }

  const saveQuest = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (form.id) {
        await api.updateQuest(form.id, {
          title: form.title, description: form.description, category: form.category,
          target_date: form.target_date, success_criteria: form.success_criteria,
          status: form.status, progress_percent: Number(form.progress_percent),
        })
        toast('Quest updated', 'success')
      } else {
        await api.createQuest({
          title: form.title, description: form.description, category: form.category,
          target_date: form.target_date, success_criteria: form.success_criteria,
        })
        toast('Quest created', 'success')
      }
      setPanelOpen(false)
      setForm(initialForm)
      await loadQuests()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save quest', 'error')
    }
  }

  const removeQuest = async (qid: string) => {
    try {
      await api.deleteQuest(qid)
      if (selectedQuestId === qid) { setSelectedQuestId(''); setActivity([]) }
      toast('Quest deleted', 'success')
      await loadQuests()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error')
    }
  }

  const addActivity = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedQuestId) return
    try {
      const payload = activityPayload.trim() ? { note: activityPayload.trim() } : undefined
      await api.addQuestActivity(selectedQuestId, activityType, activityDate, payload)
      setActivityPayload('')
      toast('Activity logged', 'success')
      await loadActivity(selectedQuestId)
      await loadQuests()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not add activity', 'error')
    }
  }

  return (
    <AppShell
      title="Quests"
      subtitle="Multi-step goals and progress tracking"
      actions={
        <button className="ody-btn" onClick={openCreate}>
          <Icon name="plus" size={14} /> New Quest
        </button>
      }
    >
      {loading ? (
        <div className="ody-grid">
          {[1, 2].map((i) => <div key={i} className="ody-skeleton ody-skeleton-card" />)}
        </div>
      ) : quests.length === 0 ? (
        <div className="ody-card">
          <div className="ody-empty">
            <div className="ody-empty-icon"><Icon name="compass" size={22} /></div>
            <h4>No Quests Yet</h4>
            <p>Quests are multi-step goals that live outside your daily check-in.</p>
            <button className="ody-btn" onClick={openCreate} style={{ marginTop: 16 }}>
              <Icon name="plus" size={14} /> Create Quest
            </button>
          </div>
        </div>
      ) : (
        <div className="ody-grid two" style={{ alignItems: 'start' }}>
          {/* Quest list */}
          <div className="ody-grid">
            <ul className="ody-list ody-stagger">
              {quests.map((quest) => (
                <li
                  key={quest.id}
                  className={`ody-list-item${selectedQuestId === quest.id ? ' selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedQuestId(quest.id)}
                >
                  <div className="ody-row">
                    <span className="ody-item-title">{quest.title}</span>
                    <span className={`ody-badge${quest.status === 'active' ? ' success' : quest.status === 'completed' ? ' gold' : ''}`}>
                      {quest.status}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginTop: 10 }}>
                    <div className="ody-progress">
                      <div className="ody-progress-bar" style={{ width: `${quest.progress_percent ?? 0}%` }} />
                    </div>
                    <div className="ody-row" style={{ marginTop: 6 }}>
                      <span className="ody-muted" style={{ fontSize: '0.7rem' }}>{quest.progress_percent ?? 0}%</span>
                      <span className="ody-muted" style={{ fontSize: '0.7rem' }}>
                        {quest.target_date ? `Target: ${formatDate(quest.target_date)}` : 'No deadline'}
                      </span>
                    </div>
                  </div>
                  <div className="ody-item-meta" style={{ marginTop: 8 }}>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                      <button className="ody-icon-btn" onClick={(e) => { e.stopPropagation(); openEdit(quest) }} aria-label="Edit quest">
                        <Icon name="edit" size={15} />
                      </button>
                      <button className="ody-icon-btn" onClick={(e) => { e.stopPropagation(); void removeQuest(quest.id) }} aria-label="Delete quest">
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity timeline */}
          <div className="ody-grid">
            {selectedQuest ? (
              <>
                <div className="ody-card">
                  <h3 className="ody-section-title" style={{ marginBottom: 8 }}>{selectedQuest.title}</h3>
                  {selectedQuest.success_criteria ? (
                    <p className="ody-muted" style={{ fontSize: '0.82rem', margin: '0 0 12px', lineHeight: 1.5 }}>
                      {selectedQuest.success_criteria}
                    </p>
                  ) : null}
                  <form className="ody-grid" onSubmit={addActivity}>
                    <div className="ody-grid two">
                      <label className="ody-field">
                        <span className="ody-label">Activity type</span>
                        <select className="ody-select" value={activityType} onChange={(e) => setActivityType(e.target.value as QuestActivityType)}>
                          {activityTypes.map((t) => <option key={t} value={t}>{activityLabels[t]}</option>)}
                        </select>
                      </label>
                      <label className="ody-field">
                        <span className="ody-label">Date</span>
                        <input className="ody-input" type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} required />
                      </label>
                    </div>
                    <label className="ody-field">
                      <span className="ody-label">Note</span>
                      <textarea className="ody-textarea" value={activityPayload} onChange={(e) => setActivityPayload(e.target.value)} style={{ minHeight: 70 }} />
                    </label>
                    <button className="ody-btn" type="submit">
                      <Icon name="plus" size={14} /> Add Update
                    </button>
                  </form>
                </div>

                {activity.length > 0 ? (
                  <div className="ody-card">
                    <h4 className="ody-section-title" style={{ marginBottom: 12 }}>Timeline</h4>
                    <div className="ody-timeline">
                      {activity.map((entry, i) => (
                        <div
                          key={`${entry.activity_type}-${entry.event_date}-${i}`}
                          className={`ody-timeline-item${entry.activity_type === 'milestone_completed' ? ' done' : ''}`}
                        >
                          <div className="ody-timeline-date">{formatDate(entry.event_date)}</div>
                          <span className="ody-badge" style={{ marginBottom: 4 }}>
                            {activityLabels[entry.activity_type] || entry.activity_type}
                          </span>
                          {entry.payload && (entry.payload as Record<string, unknown>).note ? (
                            <p className="ody-muted" style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>
                              {(entry.payload as Record<string, unknown>).note as string}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ody-card">
                    <div className="ody-empty">
                      <div className="ody-empty-icon"><Icon name="clock" size={20} /></div>
                      <h4>No Activity Yet</h4>
                      <p>Log your first progress update above.</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="ody-card">
                <div className="ody-empty">
                  <div className="ody-empty-icon"><Icon name="compass" size={20} /></div>
                  <h4>Select a Quest</h4>
                  <p>Choose a quest from the list to view and log activity.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={form.id ? 'Edit Quest' : 'New Quest'}
        subtitle="Define a multi-step goal"
      >
        <form className="ody-grid" onSubmit={saveQuest}>
          <label className="ody-field">
            <span className="ody-label">Title</span>
            <input className="ody-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </label>
          <label className="ody-field">
            <span className="ody-label">Description</span>
            <textarea className="ody-textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <label className="ody-field">
            <span className="ody-label">Category</span>
            <select className="ody-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="ody-field">
            <span className="ody-label">Target date</span>
            <input className="ody-input" type="date" value={form.target_date} onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))} />
          </label>
          <label className="ody-field">
            <span className="ody-label">Success criteria</span>
            <textarea className="ody-textarea" value={form.success_criteria} onChange={(e) => setForm((f) => ({ ...f, success_criteria: e.target.value }))} />
          </label>
          {form.id ? (
            <>
              <label className="ody-field">
                <span className="ody-label">Status</span>
                <select className="ody-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as QuestStatus }))}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="ody-field">
                <span className="ody-label">Progress %</span>
                <input className="ody-input" type="number" min={0} max={100} value={form.progress_percent} onChange={(e) => setForm((f) => ({ ...f, progress_percent: e.target.value }))} />
              </label>
            </>
          ) : null}
          <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
            <button className="ody-btn" type="submit">{form.id ? 'Update Quest' : 'Create Quest'}</button>
            <button className="ody-btn secondary" type="button" onClick={() => setPanelOpen(false)}>Cancel</button>
          </div>
        </form>
      </SlideOver>
    </AppShell>
  )
}
