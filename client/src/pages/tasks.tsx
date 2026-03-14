import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AppShell } from '../components/layout'
import { SlideOver } from '../components/modal'
import { Icon } from '../components/icons'
import { useToast } from '../components/toast'
import { useAuth } from '../app/auth'
import type { Task, TaskStatus, TaskType } from '../app/types'
import { formatDate } from '../lib/date'

const categories = [
  'Body & Vitality',
  'Mind & Inner World',
  'Work & Mastery',
  'Wealth & Resources',
  'Connection & Belonging',
  'Meaning & Transcendence',
]

const categoryColors: Record<string, string> = {
  'Body & Vitality': 'var(--cat-body)',
  'Mind & Inner World': 'var(--cat-mind)',
  'Work & Mastery': 'var(--cat-work)',
  'Wealth & Resources': 'var(--cat-wealth)',
  'Connection & Belonging': 'var(--cat-connection)',
  'Meaning & Transcendence': 'var(--cat-meaning)',
}

type TaskForm = {
  id?: string
  title: string
  description: string
  category: string
  task_type: TaskType
  schedule_type: string
  due_window_type: string
  due_date: string
}

const initialForm: TaskForm = {
  title: '',
  description: '',
  category: categories[0],
  task_type: 'recurring',
  schedule_type: 'daily',
  due_window_type: 'none',
  due_date: '',
}

export function TasksPage() {
  const { api } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [form, setForm] = useState<TaskForm>(initialForm)
  const [panelOpen, setPanelOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | TaskType>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

  const filtered = useMemo(
    () => tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (typeFilter !== 'all' && t.task_type !== typeFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!`${t.title} ${t.description || ''}`.toLowerCase().includes(q)) return false
      }
      return true
    }),
    [search, statusFilter, tasks, typeFilter],
  )

  const openCreate = () => {
    setForm(initialForm)
    setPanelOpen(true)
  }

  const openEdit = (task: Task) => {
    setForm({
      id: task.id,
      title: task.title,
      description: task.description || '',
      category: task.category,
      task_type: task.task_type,
      schedule_type: task.schedule_type || 'daily',
      due_window_type: task.due_window_type || 'none',
      due_date: task.due_date || '',
    })
    setPanelOpen(true)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        task_type: form.task_type,
        schedule_type: form.task_type === 'recurring' ? form.schedule_type : undefined,
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
                  <span
                    className="ody-cat-dot"
                    style={{ background: categoryColors[task.category] || 'var(--accent-silver)' }}
                  />
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
                <span className="ody-muted" style={{ fontSize: '0.72rem' }}>{task.category}</span>
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
                  <button className="ody-icon-btn" onClick={() => openEdit(task)} aria-label="Edit task">
                    <Icon name="edit" size={15} />
                  </button>
                  <button className="ody-icon-btn" onClick={() => void removeTask(task.id)} aria-label="Delete task">
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
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
            <select className="ody-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="ody-field">
            <span className="ody-label">Type</span>
            <select className="ody-select" value={form.task_type} onChange={(e) => setForm((f) => ({ ...f, task_type: e.target.value as TaskType }))}>
              <option value="recurring">Recurring</option>
              <option value="one_time">One-Time</option>
            </select>
          </label>
          {form.task_type === 'recurring' ? (
            <label className="ody-field">
              <span className="ody-label">Schedule</span>
              <select className="ody-select" value={form.schedule_type} onChange={(e) => setForm((f) => ({ ...f, schedule_type: e.target.value }))}>
                <option value="daily">Daily</option>
                <option value="specific_days">Specific days</option>
                <option value="x_per_week">X per week</option>
                <option value="once_per_week">Once per week</option>
              </select>
            </label>
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
