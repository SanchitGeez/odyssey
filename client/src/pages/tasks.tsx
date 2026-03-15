import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/layout'
import { SlideOver } from '../components/modal'
import { DimensionFilter } from '../components/dimension-filter'
import { DimensionLabel } from '../components/dimension-label'
import { Heatmap } from '../components/heatmap'
import { Icon } from '../components/icons'
import { useToast } from '../components/toast'
import { useAuth } from '../app/auth'
import type { LifeDimension, Task, TaskHeatmapResponse, TaskStatus, TaskType } from '../app/types'
import { formatDate } from '../lib/date'
import { DIMENSIONS, DIMENSION_KEYS } from '../lib/dimensions'

const dayOptions = [
  { label: 'Mon', value: 0 },
  { label: 'Tue', value: 1 },
  { label: 'Wed', value: 2 },
  { label: 'Thu', value: 3 },
  { label: 'Fri', value: 4 },
  { label: 'Sat', value: 5 },
  { label: 'Sun', value: 6 },
]

type TaskForm = {
  id?: string
  title: string
  description: string
  category: LifeDimension
  task_type: TaskType
  schedule_type: string
  days_of_week: number[]
  target_count: number
  due_window_type: string
  due_date: string
}

const initialForm: TaskForm = {
  title: '',
  description: '',
  category: DIMENSION_KEYS[0],
  task_type: 'recurring',
  schedule_type: 'daily',
  days_of_week: [],
  target_count: 3,
  due_window_type: 'none',
  due_date: '',
}

function getScheduleConfig(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function normalizeTargetCount(value: unknown): number {
  const raw = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(raw)) return 3
  return Math.max(1, Math.min(7, Math.round(raw)))
}

function parseDaysOfWeek(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value
    .map((day) => Number(day))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
}

type RangeMode = 'month' | 'custom'

function toIsoDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function threeMonthBounds(offset: number): { fromDate: string; toDate: string } {
  const now = new Date()
  const endMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const startMonth = new Date(endMonth.getFullYear(), endMonth.getMonth() - 2, 1)
  const start = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1)
  const end = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0)
  return { fromDate: toIsoDate(start), toDate: toIsoDate(end) }
}

function threeMonthLabel(offset: number): string {
  const now = new Date()
  const endMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const startMonth = new Date(endMonth.getFullYear(), endMonth.getMonth() - 2, 1)
  const startLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(startMonth)
  const endLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(endMonth)
  return `${startLabel} - ${endLabel}`
}

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { api } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [form, setForm] = useState<TaskForm>(initialForm)
  const [scheduleError, setScheduleError] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | TaskType>('all')
  const [dimFilter, setDimFilter] = useState<LifeDimension | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [rangeMode, setRangeMode] = useState<RangeMode>('month')
  const [monthOffset, setMonthOffset] = useState(0)
  const [customFromDate, setCustomFromDate] = useState('')
  const [customToDate, setCustomToDate] = useState('')
  const [appliedCustomFromDate, setAppliedCustomFromDate] = useState('')
  const [appliedCustomToDate, setAppliedCustomToDate] = useState('')
  const [heatmapCache, setHeatmapCache] = useState<Record<string, TaskHeatmapResponse>>({})
  const [heatmapLoadingKey, setHeatmapLoadingKey] = useState<string | null>(null)
  const [heatmapError, setHeatmapError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setTasks(await api.listTasks())
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to load tasks', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  useEffect(() => {
    if (searchParams.get('prefill') !== 'true') return
    const title = searchParams.get('title') || ''
    const categoryParam = searchParams.get('category') as LifeDimension | null
    const typeParam = searchParams.get('type')
    const category = categoryParam && categoryParam in DIMENSIONS ? categoryParam : DIMENSION_KEYS[0]
    const taskType: TaskType = typeParam === 'one_time' ? 'one_time' : 'recurring'

    setForm({
      ...initialForm,
      title,
      category,
      task_type: taskType,
      schedule_type: taskType === 'recurring' ? 'daily' : initialForm.schedule_type,
      due_window_type: taskType === 'one_time' ? 'none' : initialForm.due_window_type,
    })
    setScheduleError('')
    setPanelOpen(true)

    const next = new URLSearchParams(searchParams)
    next.delete('prefill')
    next.delete('title')
    next.delete('category')
    next.delete('type')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const filtered = useMemo(
    () => tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (typeFilter !== 'all' && t.task_type !== typeFilter) return false
      if (dimFilter !== 'all' && t.category !== dimFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!`${t.title} ${t.description || ''}`.toLowerCase().includes(q)) return false
      }
      return true
    }),
    [dimFilter, search, statusFilter, tasks, typeFilter],
  )

  const openCreate = () => {
    setForm(initialForm)
    setScheduleError('')
    setPanelOpen(true)
  }

  const openEdit = (task: Task) => {
    const scheduleConfig = getScheduleConfig(task.schedule_config)
    const isLegacyOncePerWeek = task.schedule_type === 'once_per_week'
    setForm({
      id: task.id,
      title: task.title,
      description: task.description || '',
      category: task.category,
      task_type: task.task_type,
      schedule_type: isLegacyOncePerWeek ? 'x_per_week' : (task.schedule_type || 'daily'),
      days_of_week: parseDaysOfWeek(scheduleConfig.days_of_week),
      target_count: scheduleConfig.target_count === undefined
        ? (isLegacyOncePerWeek ? 1 : 3)
        : normalizeTargetCount(scheduleConfig.target_count),
      due_window_type: task.due_window_type || 'none',
      due_date: task.due_date || '',
    })
    setScheduleError('')
    setPanelOpen(true)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setScheduleError('')

    if (form.task_type === 'recurring' && form.schedule_type === 'specific_days' && form.days_of_week.length === 0) {
      setScheduleError('Select at least one day for specific-days schedule.')
      return
    }

    setSaving(true)
    try {
      let schedule_config: Record<string, unknown> | undefined
      if (form.task_type === 'recurring') {
        if (form.schedule_type === 'specific_days') {
          schedule_config = { days_of_week: [...form.days_of_week].sort((a, b) => a - b) }
        } else if (form.schedule_type === 'x_per_week') {
          schedule_config = { target_count: normalizeTargetCount(form.target_count) }
        }
      }

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        task_type: form.task_type,
        schedule_type: form.task_type === 'recurring' ? form.schedule_type : undefined,
        schedule_config,
        due_window_type: form.task_type === 'one_time' ? form.due_window_type : undefined,
        due_date: form.task_type === 'one_time' && form.due_window_type === 'date' ? form.due_date : undefined,
      }
      if (form.id) {
        await api.updateTask(form.id, payload)
        toast('Task updated', 'success')
      } else {
        await api.createTask(payload)
        toast('Task created', 'success')
      }
      setPanelOpen(false)
      setForm(initialForm)
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Task save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const removeTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId)
      toast('Task deleted', 'success')
      await load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error')
    }
  }

  const currentRange = useMemo(() => {
    if (rangeMode === 'custom' && appliedCustomFromDate && appliedCustomToDate) {
      return { fromDate: appliedCustomFromDate, toDate: appliedCustomToDate }
    }
    return threeMonthBounds(monthOffset)
  }, [appliedCustomFromDate, appliedCustomToDate, monthOffset, rangeMode])

  const heatmapKeyFor = useCallback(
    (taskId: string) => `${taskId}:${currentRange.fromDate}:${currentRange.toDate}`,
    [currentRange.fromDate, currentRange.toDate],
  )

  const loadHeatmap = useCallback(async (taskId: string) => {
    const cacheKey = heatmapKeyFor(taskId)
    if (heatmapCache[cacheKey]) return
    setHeatmapLoadingKey(cacheKey)
    setHeatmapError('')
    try {
      const data = await api.getTaskHeatmap(taskId, currentRange.fromDate, currentRange.toDate)
      setHeatmapCache((prev) => ({ ...prev, [cacheKey]: data }))
    } catch (err) {
      setHeatmapError(err instanceof Error ? err.message : 'Failed to load heatmap')
    } finally {
      setHeatmapLoadingKey((prev) => (prev === cacheKey ? null : prev))
    }
  }, [api, currentRange.fromDate, currentRange.toDate, heatmapCache, heatmapKeyFor])

  const toggleHeatmap = (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null)
      return
    }
    setExpandedTaskId(taskId)
    void loadHeatmap(taskId)
  }

  useEffect(() => {
    if (!expandedTaskId) return
    void loadHeatmap(expandedTaskId)
  }, [expandedTaskId, loadHeatmap])

  return (
    <AppShell
      title="Tasks"
      subtitle="Manage recurring and one-time tasks"
      actions={
        <button className="ody-btn" onClick={openCreate}>
          <Icon name="plus" size={14} /> New Task
        </button>
      }
    >
      <DimensionFilter value={dimFilter} onChange={setDimFilter} />

      {/* Filters */}
      <div className="ody-card" style={{ marginBottom: 16 }}>
        <div className="ody-row">
          <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center' }}>
            <Icon name="search" size={16} className="ody-muted" />
            <input
              className="ody-input"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 260 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="ody-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | TaskType)} style={{ width: 130 }}>
              <option value="all">All types</option>
              <option value="recurring">Recurring</option>
              <option value="one_time">One-time</option>
            </select>
            <select className="ody-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | TaskStatus)} style={{ width: 130 }}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="ody-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ody-skeleton ody-skeleton-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ody-card">
          <div className="ody-empty">
            <div className="ody-empty-icon"><Icon name="scroll" size={22} /></div>
            <h4>{tasks.length === 0 ? 'No Tasks Yet' : 'No Matches'}</h4>
            <p>{tasks.length === 0
              ? 'Create your first task to begin tracking your life dimensions.'
              : 'Try adjusting your search or filters.'}
            </p>
            {tasks.length === 0 ? (
              <button className="ody-btn" onClick={openCreate} style={{ marginTop: 16 }}>
                <Icon name="plus" size={14} /> Create Task
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <ul className="ody-list ody-stagger">
          {filtered.map((task) => (
            <li key={task.id} className="ody-list-item">
              <div className="ody-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="ody-item-title">{task.title}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="ody-badge">{task.task_type === 'recurring' ? 'Recurring' : 'One-time'}</span>
                  <span className={`ody-badge${task.status === 'active' ? ' success' : task.status === 'archived' ? '' : ' gold'}`}>
                    {task.status}
                  </span>
                </div>
              </div>
              {task.description ? (
                <p className="ody-muted" style={{ margin: '8px 0 0', fontSize: '0.82rem' }}>
                  {task.description.length > 120 ? `${task.description.slice(0, 120)}...` : task.description}
                </p>
              ) : null}
              <div className="ody-item-meta" style={{ marginTop: 10 }}>
                <DimensionLabel dim={task.category} />
                {task.schedule_type ? (
                  <span className="ody-muted" style={{ fontSize: '0.72rem' }}>
                    {task.schedule_type.replace(/_/g, ' ')}
                  </span>
                ) : null}
                {task.due_date ? (
                  <span className="ody-muted" style={{ fontSize: '0.72rem' }}>
                    Due: {formatDate(task.due_date)}
                  </span>
                ) : null}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                  {task.task_type === 'recurring' ? (
                    <button className="ody-icon-btn" onClick={() => toggleHeatmap(task.id)} aria-label="Toggle heatmap">
                      <Icon name="calendar" size={15} />
                    </button>
                  ) : null}
                  <button className="ody-icon-btn" onClick={() => openEdit(task)} aria-label="Edit task">
                    <Icon name="edit" size={15} />
                  </button>
                  <button className="ody-icon-btn" onClick={() => void removeTask(task.id)} aria-label="Delete task">
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
              {task.task_type === 'recurring' && expandedTaskId === task.id ? (
                <div className="ody-heatmap-panel">
                  <div className="ody-heatmap-toolbar">
                    <div className="ody-heatmap-range-switch">
                      <button
                        type="button"
                        className={`ody-heatmap-toggle${rangeMode === 'month' ? ' active' : ''}`}
                        onClick={() => setRangeMode('month')}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        className={`ody-heatmap-toggle${rangeMode === 'custom' ? ' active' : ''}`}
                        onClick={() => setRangeMode('custom')}
                      >
                        Range
                      </button>
                    </div>

                    {rangeMode === 'month' ? (
                      <div className="ody-heatmap-month-nav">
                        <button
                          type="button"
                          className="ody-heatmap-link"
                          onClick={() => setMonthOffset((prev) => prev - 3)}
                          aria-label="Previous 3 months"
                        >
                          <Icon name="arrow-left" size={13} /> Previous
                        </button>
                        <span className="ody-heatmap-month-label">{threeMonthLabel(monthOffset)}</span>
                        <button
                          type="button"
                          className="ody-heatmap-link"
                          onClick={() => setMonthOffset((prev) => Math.min(prev + 3, 0))}
                          aria-label="Next 3 months"
                          disabled={monthOffset >= 0}
                        >
                          Next <Icon name="arrow-right" size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="ody-heatmap-custom-range">
                        <input
                          className="ody-input"
                          type="date"
                          value={customFromDate}
                          onChange={(e) => setCustomFromDate(e.target.value)}
                        />
                        <input
                          className="ody-input"
                          type="date"
                          value={customToDate}
                          onChange={(e) => setCustomToDate(e.target.value)}
                        />
                        <button
                          type="button"
                          className="ody-btn secondary"
                          onClick={() => {
                            if (!customFromDate || !customToDate) {
                              toast('Select both start and end dates', 'error')
                              return
                            }
                            if (customFromDate > customToDate) {
                              toast('Start date must be before end date', 'error')
                              return
                            }
                            setAppliedCustomFromDate(customFromDate)
                            setAppliedCustomToDate(customToDate)
                            void loadHeatmap(task.id)
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {(() => {
                    const cacheKey = heatmapKeyFor(task.id)
                    const data = heatmapCache[cacheKey]
                    if (heatmapLoadingKey === cacheKey && !data) {
                      return <p className="ody-heatmap-status">Loading heatmap...</p>
                    }
                    if (heatmapError && !data) {
                      return <p className="ody-heatmap-status danger">{heatmapError}</p>
                    }
                    if (!data) {
                      return <p className="ody-heatmap-status">No heatmap data for this range.</p>
                    }
                    return (
                      <>
                        <Heatmap dates={data.dates} />
                        <div className="ody-heatmap-summary">
                          <span className="ody-badge success">Done: {data.summary.done}</span>
                          <span className="ody-badge">Skipped: {data.summary.skipped}</span>
                          <span className="ody-badge danger">Missed: {data.summary.missed}</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {/* Slide-over form */}
      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={form.id ? 'Edit Task' : 'New Task'}
        subtitle="Define a recurring or one-time task"
      >
        <form className="ody-grid" onSubmit={submit}>
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
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as LifeDimension }))}
            >
              {DIMENSION_KEYS.map((dimensionKey) => (
                <option key={dimensionKey} value={dimensionKey}>
                  {DIMENSIONS[dimensionKey].label}
                </option>
              ))}
            </select>
          </label>
          <label className="ody-field">
            <span className="ody-label">Type</span>
            <select
              className="ody-select"
              value={form.task_type}
              onChange={(e) => {
                setScheduleError('')
                setForm((f) => ({ ...f, task_type: e.target.value as TaskType }))
              }}
            >
              <option value="recurring">Recurring</option>
              <option value="one_time">One-Time</option>
            </select>
          </label>
          {form.task_type === 'recurring' ? (
            <>
              <label className="ody-field">
                <span className="ody-label">Schedule</span>
                <select
                  className="ody-select"
                  value={form.schedule_type}
                  onChange={(e) => {
                    const scheduleType = e.target.value
                    setScheduleError('')
                    setForm((f) => {
                      if (scheduleType === 'specific_days') {
                        return { ...f, schedule_type: scheduleType, target_count: 3 }
                      }
                      if (scheduleType === 'x_per_week') {
                        return { ...f, schedule_type: scheduleType, days_of_week: [] }
                      }
                      return { ...f, schedule_type: scheduleType, days_of_week: [], target_count: 3 }
                    })
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="specific_days">Specific days</option>
                  <option value="x_per_week">X per week</option>
                </select>
              </label>
              {form.schedule_type === 'specific_days' ? (
                <div className="ody-field">
                  <span className="ody-label">Days</span>
                  <div className="ody-day-picker">
                    {dayOptions.map((day) => {
                      const active = form.days_of_week.includes(day.value)
                      return (
                        <button
                          key={day.value}
                          type="button"
                          className={`ody-day-toggle${active ? ' active' : ''}`}
                          aria-pressed={active}
                          onClick={() => {
                            setScheduleError('')
                            setForm((f) => ({
                              ...f,
                              days_of_week: f.days_of_week.includes(day.value)
                                ? f.days_of_week.filter((d) => d !== day.value)
                                : [...f.days_of_week, day.value],
                            }))
                          }}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
              {form.schedule_type === 'x_per_week' ? (
                <label className="ody-field">
                  <span className="ody-label">Times per week</span>
                  <input
                    className="ody-input"
                    type="number"
                    min={1}
                    max={7}
                    step={1}
                    value={form.target_count}
                    onChange={(e) => {
                      setScheduleError('')
                      setForm((f) => ({ ...f, target_count: normalizeTargetCount(e.target.value) }))
                    }}
                  />
                </label>
              ) : null}
              {scheduleError ? <p className="ody-field-error">{scheduleError}</p> : null}
            </>
          ) : (
            <>
              <label className="ody-field">
                <span className="ody-label">Due window</span>
                <select className="ody-select" value={form.due_window_type} onChange={(e) => setForm((f) => ({ ...f, due_window_type: e.target.value }))}>
                  <option value="none">No deadline</option>
                  <option value="date">Specific date</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>
              </label>
              {form.due_window_type === 'date' ? (
                <label className="ody-field">
                  <span className="ody-label">Due date</span>
                  <input className="ody-input" type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
                </label>
              ) : null}
            </>
          )}
          <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
            <button className="ody-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : form.id ? 'Update Task' : 'Create Task'}
            </button>
            <button className="ody-btn secondary" type="button" onClick={() => setPanelOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </SlideOver>
    </AppShell>
  )
}
