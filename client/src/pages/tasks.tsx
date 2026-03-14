import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AppShell } from '../components/layout'
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
  const [tasks, setTasks] = useState<Task[]>([])
  const [form, setForm] = useState<TaskForm>(initialForm)
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | TaskType>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.listTasks()
      setTasks(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(
    () => tasks.filter((task) => {
      const statusMatch = statusFilter === 'all' ? true : task.status === statusFilter
      const typeMatch = typeFilter === 'all' ? true : task.task_type === typeFilter
      const searchMatch = search.trim().length === 0
        ? true
        : `${task.title} ${task.description || ''}`.toLowerCase().includes(search.toLowerCase())
      return statusMatch && typeMatch && searchMatch
    }),
    [search, statusFilter, tasks, typeFilter],
  )

  const resetForm = () => setForm(initialForm)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
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
      } else {
        await api.createTask(payload)
      }
      resetForm()
      await load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Task save failed'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const editTask = (task: Task) => {
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
  }

  const removeTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId)
      await load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
    }
  }

  return (
    <AppShell title="Tasks" subtitle="Create, edit, and manage recurring + one-time tasks.">
      <section className="ody-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>{form.id ? 'Edit Task' : 'New Task'}</h3>
        <form className="ody-grid" onSubmit={submit}>
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
              <select className="ody-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
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
                <label className="ody-field">
                  <span className="ody-label">Due date</span>
                  <input className="ody-input" type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
                </label>
              </>
            )}
          </div>
          {error ? <p className="ody-error" style={{ margin: 0 }}>{error}</p> : null}
          <div className="ody-row">
            <button className="ody-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : (form.id ? 'Update Task' : 'Create Task')}</button>
            {form.id ? <button className="ody-btn secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="ody-card ody-grid">
        <div className="ody-row">
          <h3 style={{ margin: 0 }}>Task List</h3>
          <div className="ody-row">
            <input className="ody-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="ody-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | TaskType)}>
              <option value="all">All types</option>
              <option value="recurring">Recurring</option>
              <option value="one_time">One-time</option>
            </select>
            <select className="ody-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | TaskStatus)}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {loading ? <p className="ody-muted">Loading tasks...</p> : null}
        {!loading && filtered.length === 0 ? <p className="ody-muted">No tasks match current filters.</p> : null}

        <ul className="ody-list">
          {filtered.map((task) => (
            <li key={task.id} className="ody-list-item ody-grid">
              <div className="ody-row">
                <strong>{task.title}</strong>
                <div className="ody-row">
                  <span className="ody-badge">{task.task_type}</span>
                  <span className="ody-badge">{task.status}</span>
                </div>
              </div>
              <p className="ody-muted" style={{ margin: 0 }}>{task.description || 'No description'}</p>
              <div className="ody-row">
                <span className="ody-muted">{task.category} | Due: {formatDate(task.due_date)}</span>
                <div className="ody-row">
                  <button className="ody-btn secondary" onClick={() => editTask(task)}>Edit</button>
                  <button className="ody-btn danger" onClick={() => void removeTask(task.id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  )
}
