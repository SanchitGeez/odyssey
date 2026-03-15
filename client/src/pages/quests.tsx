import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/layout'
import { SlideOver } from '../components/modal'
import { DimensionFilter } from '../components/dimension-filter'
import { DimensionLabel } from '../components/dimension-label'
import { Icon } from '../components/icons'
import { useToast } from '../components/toast'
import { useAuth } from '../app/auth'
import type { LifeDimension, Quest, QuestActivity, QuestMilestone, QuestStatus } from '../app/types'
import { formatDate, todayIso } from '../lib/date'
import { DIMENSIONS, DIMENSION_KEYS } from '../lib/dimensions'

const activityLabels: Record<string, string> = {
  milestone_completed: 'Completed',
  note_added: 'Update',
  milestone_added: 'Milestone Added',
  progress_updated: 'Progress Update',
  status_changed: 'Status Change',
}

type QuestForm = {
  id?: string
  title: string
  description: string
  category: LifeDimension | ''
  target_date: string
  success_criteria: string
  progress_percent: string
  status: QuestStatus
}

type QuestsWorkspaceProps = {
  filteredQuests: Quest[]
  selectedQuestId: string
  setSelectedQuestId: (id: string) => void
  openEdit: (quest: Quest) => void
  removeQuest: (qid: string) => Promise<void>
  selectedQuest?: Quest
  milestones: QuestMilestone[]
  completedMilestones: number
  progressPercent: number
  milestoneTitle: string
  setMilestoneTitle: (title: string) => void
  addMilestone: (e: FormEvent) => Promise<void>
  toggleMilestone: (milestone: QuestMilestone, nextCompleted: boolean) => Promise<void>
  deleteMilestone: (milestoneId: string) => Promise<void>
  updateNote: string
  setUpdateNote: (note: string) => void
  addUpdate: (e: FormEvent) => Promise<void>
  activity: QuestActivity[]
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

function calculateProgressPercent(milestones: QuestMilestone[]): number {
  if (milestones.length === 0) return 0
  const completed = milestones.filter((milestone) => milestone.is_completed).length
  return Math.round((completed / milestones.length) * 10000) / 100
}

function QuestsWorkspace({
  filteredQuests,
  selectedQuestId,
  setSelectedQuestId,
  openEdit,
  removeQuest,
  selectedQuest,
  milestones,
  completedMilestones,
  progressPercent,
  milestoneTitle,
  setMilestoneTitle,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
  updateNote,
  setUpdateNote,
  addUpdate,
  activity,
}: QuestsWorkspaceProps) {
  return (
    <div className="ody-grid two" style={{ alignItems: 'start' }}>
      <div className="ody-grid">
        <ul className="ody-list ody-stagger">
          {filteredQuests.map((quest) => (
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
                {quest.category ? <DimensionLabel dim={quest.category} /> : <span className="ody-muted" style={{ fontSize: '0.72rem' }}>No dimension</span>}
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

      <div className="ody-grid">
        {selectedQuest ? (
          <>
            <div className="ody-card">
              <h3 className="ody-section-title" style={{ marginBottom: 8 }}>{selectedQuest.title}</h3>
              <div className="ody-row" style={{ marginBottom: 10, alignItems: 'center' }}>
                {selectedQuest.category ? <DimensionLabel dim={selectedQuest.category} /> : null}
                <span className="ody-milestone-summary">
                  {completedMilestones} / {milestones.length} milestones
                </span>
              </div>
              <div className="ody-progress" style={{ marginBottom: 12 }}>
                <div className="ody-progress-bar" style={{ width: `${progressPercent}%` }} />
              </div>
              {selectedQuest.success_criteria ? (
                <p className="ody-muted" style={{ fontSize: '0.82rem', margin: '0 0 12px', lineHeight: 1.5 }}>
                  {selectedQuest.success_criteria}
                </p>
              ) : null}

              <div className="ody-milestone-list">
                {milestones.length > 0 ? (
                  milestones.map((milestone) => (
                    <div key={milestone.id} className="ody-milestone-item">
                      <label className={`ody-milestone-check${milestone.is_completed ? ' done' : ''}`}>
                        <input
                          className="ody-checkbox"
                          type="checkbox"
                          checked={milestone.is_completed}
                          onChange={(e) => {
                            void toggleMilestone(milestone, e.target.checked)
                          }}
                        />
                        <span>{milestone.title}</span>
                      </label>
                      <button className="ody-icon-btn" onClick={() => { void deleteMilestone(milestone.id) }} aria-label="Delete milestone">
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="ody-muted" style={{ fontSize: '0.82rem', margin: 0 }}>No milestones yet. Add the first checkpoint below.</p>
                )}

                <form className="ody-milestone-add" onSubmit={addMilestone}>
                  <input
                    className="ody-input"
                    placeholder="Add milestone"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button className="ody-btn" type="submit"><Icon name="plus" size={14} /> Add</button>
                </form>
              </div>
            </div>

            <div className="ody-card">
              <h4 className="ody-section-title" style={{ marginBottom: 12 }}>Log Update</h4>
              <form className="ody-grid" onSubmit={addUpdate}>
                <textarea
                  className="ody-textarea"
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  style={{ minHeight: 82 }}
                  placeholder="Write what happened..."
                />
                <button className="ody-btn" type="submit">
                  <Icon name="plus" size={14} /> Submit
                </button>
              </form>
            </div>

            {activity.length > 0 ? (
              <div className="ody-card">
                <h4 className="ody-section-title" style={{ marginBottom: 12 }}>Timeline</h4>
                <div className="ody-timeline">
                  {activity.map((entry, i) => {
                    const payload = entry.payload as Record<string, unknown> | null
                    const note = payload?.note as string | undefined
                    const milestoneTitleFromEvent = (payload?.title as string | undefined) || (payload?.milestone as string | undefined)
                    return (
                      <div
                        key={`${entry.activity_type}-${entry.event_date}-${i}`}
                        className={`ody-timeline-item${entry.activity_type === 'milestone_completed' ? ' done' : ''}`}
                      >
                        <div className="ody-timeline-date">{formatDate(entry.event_date)}</div>
                        <span className="ody-badge" style={{ marginBottom: 4 }}>
                          {activityLabels[entry.activity_type] || entry.activity_type}
                        </span>
                        {entry.activity_type === 'milestone_completed' && milestoneTitleFromEvent ? (
                          <p className="ody-muted" style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>
                            {milestoneTitleFromEvent}
                          </p>
                        ) : null}
                        {note ? (
                          <p className="ody-muted" style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>
                            {note}
                          </p>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="ody-card">
                <div className="ody-empty">
                  <div className="ody-empty-icon"><Icon name="clock" size={20} /></div>
                  <h4>No Timeline Yet</h4>
                  <p>Complete a milestone or submit an update to start your quest history.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="ody-card">
            <div className="ody-empty">
              <div className="ody-empty-icon"><Icon name="compass" size={20} /></div>
              <h4>Select a Quest</h4>
              <p>Choose a quest from the list to track milestones and updates.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function QuestsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { api } = useAuth()
  const { toast } = useToast()
  const [quests, setQuests] = useState<Quest[]>([])
  const [selectedQuestId, setSelectedQuestId] = useState('')
  const [activity, setActivity] = useState<QuestActivity[]>([])
  const [milestones, setMilestones] = useState<QuestMilestone[]>([])
  const [milestoneCountsByQuestId, setMilestoneCountsByQuestId] = useState<Record<string, number>>({})
  const [form, setForm] = useState<QuestForm>(initialForm)
  const [panelOpen, setPanelOpen] = useState(false)
  const [updateNote, setUpdateNote] = useState('')
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [dimFilter, setDimFilter] = useState<LifeDimension | 'all'>('all')

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

  const setQuestProgressLocal = (questId: string, progressPercent: number) => {
    setQuests((current) =>
      current.map((quest) => (quest.id === questId ? { ...quest, progress_percent: progressPercent } : quest)),
    )
  }

  const loadActivity = async (qid: string) => {
    try {
      const activityData = await api.listQuestActivity(qid)
      setActivity(activityData)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to load activity', 'error')
    }
  }

  const loadMilestones = async (qid: string) => {
    try {
      const milestoneData = await api.listQuestMilestones(qid)
      setMilestones(milestoneData)
      setMilestoneCountsByQuestId((current) => ({ ...current, [qid]: milestoneData.length }))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to load milestones', 'error')
    }
  }

  useEffect(() => { void loadQuests() }, [])

  useEffect(() => {
    if (selectedQuestId) {
      void Promise.all([loadActivity(selectedQuestId), loadMilestones(selectedQuestId)])
      return
    }
    setActivity([])
    setMilestones([])
  }, [selectedQuestId])

  useEffect(() => {
    if (searchParams.get('prefill') !== 'true') return
    const title = searchParams.get('title') || ''
    const categoryParam = searchParams.get('category') as LifeDimension | null
    const category = categoryParam && categoryParam in DIMENSIONS ? categoryParam : ''

    setForm({
      ...initialForm,
      title,
      category,
    })
    setPanelOpen(true)

    const next = new URLSearchParams(searchParams)
    next.delete('prefill')
    next.delete('title')
    next.delete('category')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const filteredQuests = useMemo(
    () => quests.filter((quest) => dimFilter === 'all' || quest.category === dimFilter),
    [dimFilter, quests],
  )

  const selectedQuest = filteredQuests.find((q) => q.id === selectedQuestId) ?? filteredQuests[0]

  useEffect(() => {
    if (filteredQuests.length === 0) {
      setSelectedQuestId('')
      setActivity([])
      setMilestones([])
      return
    }
    if (!filteredQuests.some((quest) => quest.id === selectedQuestId)) {
      setSelectedQuestId(filteredQuests[0].id)
    }
  }, [filteredQuests, selectedQuestId])

  const openCreate = () => {
    setForm(initialForm)
    setPanelOpen(true)
  }

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
    if (selectedQuestId === quest.id) {
      setMilestoneCountsByQuestId((current) => ({ ...current, [quest.id]: milestones.length }))
    }
    setPanelOpen(true)
    void (async () => {
      try {
        const milestoneData = await api.listQuestMilestones(quest.id)
        setMilestoneCountsByQuestId((current) => ({ ...current, [quest.id]: milestoneData.length }))
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Failed to load milestones', 'error')
      }
    })()
  }

  const editingMilestoneCount = form.id ? milestoneCountsByQuestId[form.id] : undefined
  const canEditManualProgress = form.id ? editingMilestoneCount === 0 : false

  const saveQuest = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (form.id) {
        const patch: {
          title: string
          description: string
          category?: LifeDimension
          target_date: string
          success_criteria: string
          status: QuestStatus
          progress_percent?: number
        } = {
          title: form.title,
          description: form.description,
          category: form.category || undefined,
          target_date: form.target_date,
          success_criteria: form.success_criteria,
          status: form.status,
        }
        if (canEditManualProgress) {
          patch.progress_percent = Number(form.progress_percent)
        }
        await api.updateQuest(form.id, {
          ...patch,
        })
        toast('Quest updated', 'success')
      } else {
        await api.createQuest({
          title: form.title,
          description: form.description,
          category: form.category || undefined,
          target_date: form.target_date,
          success_criteria: form.success_criteria,
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
      if (selectedQuestId === qid) {
        setSelectedQuestId('')
        setActivity([])
        setMilestones([])
      }
      toast('Quest deleted', 'success')
      await loadQuests()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error')
    }
  }

  const addUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedQuestId || !updateNote.trim()) return
    try {
      await api.addQuestActivity(selectedQuestId, 'note_added', todayIso(), { note: updateNote.trim() })
      setUpdateNote('')
      toast('Update logged', 'success')
      await loadActivity(selectedQuestId)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not add update', 'error')
    }
  }

  const addMilestone = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedQuestId || !milestoneTitle.trim()) return
    try {
      const created = await api.createQuestMilestone(selectedQuestId, milestoneTitle.trim())
      const nextMilestones = [...milestones, created].sort((a, b) => a.sort_order - b.sort_order)
      setMilestones(nextMilestones)
      setMilestoneCountsByQuestId((current) => ({ ...current, [selectedQuestId]: nextMilestones.length }))
      setQuestProgressLocal(selectedQuestId, calculateProgressPercent(nextMilestones))
      setMilestoneTitle('')
      toast('Milestone added', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not add milestone', 'error')
    }
  }

  const toggleMilestone = async (milestone: QuestMilestone, nextCompleted: boolean) => {
    if (!selectedQuestId) return
    const previousMilestones = milestones
    const previousProgress = selectedQuest?.progress_percent ?? 0
    const nextMilestones = milestones.map((item) =>
      item.id === milestone.id
        ? {
            ...item,
            is_completed: nextCompleted,
            completed_at: nextCompleted ? new Date().toISOString() : null,
          }
        : item,
    )

    setMilestones(nextMilestones)
    setQuestProgressLocal(selectedQuestId, calculateProgressPercent(nextMilestones))

    try {
      await api.updateQuestMilestone(selectedQuestId, milestone.id, { is_completed: nextCompleted })
      await loadActivity(selectedQuestId)
      await loadQuests()
    } catch (err) {
      setMilestones(previousMilestones)
      setQuestProgressLocal(selectedQuestId, Number(previousProgress))
      toast(err instanceof Error ? err.message : 'Could not update milestone', 'error')
    }
  }

  const deleteMilestone = async (milestoneId: string) => {
    if (!selectedQuestId) return
    const previousMilestones = milestones
    const previousProgress = selectedQuest?.progress_percent ?? 0
    const nextMilestones = milestones.filter((milestone) => milestone.id !== milestoneId)

    setMilestones(nextMilestones)
    setMilestoneCountsByQuestId((current) => ({ ...current, [selectedQuestId]: nextMilestones.length }))
    setQuestProgressLocal(selectedQuestId, calculateProgressPercent(nextMilestones))

    try {
      await api.deleteQuestMilestone(selectedQuestId, milestoneId)
      toast('Milestone removed', 'success')
    } catch (err) {
      setMilestones(previousMilestones)
      setMilestoneCountsByQuestId((current) => ({ ...current, [selectedQuestId]: previousMilestones.length }))
      setQuestProgressLocal(selectedQuestId, Number(previousProgress))
      toast(err instanceof Error ? err.message : 'Could not remove milestone', 'error')
    }
  }

  const completedMilestones = milestones.filter((milestone) => milestone.is_completed).length
  const progressPercent = useMemo(() => calculateProgressPercent(milestones), [milestones])

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
      <DimensionFilter value={dimFilter} onChange={setDimFilter} />

      {loading ? (
        <div className="ody-grid">
          {[1, 2].map((i) => <div key={i} className="ody-skeleton ody-skeleton-card" />)}
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="ody-card">
          <div className="ody-empty">
            <div className="ody-empty-icon"><Icon name="compass" size={22} /></div>
            <h4>{quests.length === 0 ? 'No Quests Yet' : 'No Matches'}</h4>
            <p>{quests.length === 0 ? 'Quests are multi-step goals that live outside your daily check-in.' : 'Try selecting another dimension.'}</p>
            {quests.length === 0 ? (
              <button className="ody-btn" onClick={openCreate} style={{ marginTop: 16 }}>
                <Icon name="plus" size={14} /> Create Quest
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <QuestsWorkspace
          filteredQuests={filteredQuests}
          selectedQuestId={selectedQuestId}
          setSelectedQuestId={setSelectedQuestId}
          openEdit={openEdit}
          removeQuest={removeQuest}
          selectedQuest={selectedQuest}
          milestones={milestones}
          completedMilestones={completedMilestones}
          progressPercent={progressPercent}
          milestoneTitle={milestoneTitle}
          setMilestoneTitle={setMilestoneTitle}
          addMilestone={addMilestone}
          toggleMilestone={toggleMilestone}
          deleteMilestone={deleteMilestone}
          updateNote={updateNote}
          setUpdateNote={setUpdateNote}
          addUpdate={addUpdate}
          activity={activity}
        />
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
            <select
              className="ody-select"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as LifeDimension | '' }))}
            >
              <option value="">Select category</option>
              {DIMENSION_KEYS.map((dimensionKey) => (
                <option key={dimensionKey} value={dimensionKey}>
                  {DIMENSIONS[dimensionKey].label}
                </option>
              ))}
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
              {canEditManualProgress ? (
                <label className="ody-field">
                  <span className="ody-label">Progress %</span>
                  <input className="ody-input" type="number" min={0} max={100} value={form.progress_percent} onChange={(e) => setForm((f) => ({ ...f, progress_percent: e.target.value }))} />
                </label>
              ) : null}
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
