import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { AppShell } from '../components/layout'
import { setOnboardingComplete } from '../lib/storage'

const categories = [
  'Body & Vitality',
  'Mind & Inner World',
  'Work & Mastery',
  'Wealth & Resources',
  'Connection & Belonging',
  'Meaning & Transcendence',
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, api } = useAuth()
  const [title, setTitle] = useState('10-minute walk')
  const [category, setCategory] = useState(categories[0])
  const [taskType, setTaskType] = useState<'recurring' | 'one_time'>('recurring')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const finish = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.createTask({
        title,
        category,
        task_type: taskType,
        schedule_type: taskType === 'recurring' ? 'daily' : undefined,
        due_window_type: taskType === 'one_time' ? 'none' : undefined,
      })
      if (user?.id) {
        setOnboardingComplete(user.id)
      }
      navigate('/check-in')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create starter task'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Onboarding" subtitle="Quick setup to start Phase 1 tracking.">
      <section className="ody-card ody-grid">
        <h3 style={{ margin: 0 }}>The six dimensions</h3>
        <div className="ody-grid three">
          {categories.map((entry) => (
            <div key={entry} className="ody-list-item">
              {entry}
            </div>
          ))}
        </div>
        <p className="ody-muted" style={{ margin: 0 }}>
          Recurring tasks build consistency. One-time tasks track specific actions until completed.
        </p>
      </section>

      <section className="ody-card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Create your first task</h3>
        <form className="ody-grid" onSubmit={finish}>
          <label className="ody-field">
            <span className="ody-label">Task title</span>
            <input className="ody-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <div className="ody-grid two">
            <label className="ody-field">
              <span className="ody-label">Category</span>
              <select className="ody-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((entry) => (
                  <option key={entry} value={entry}>{entry}</option>
                ))}
              </select>
            </label>
            <label className="ody-field">
              <span className="ody-label">Type</span>
              <select className="ody-select" value={taskType} onChange={(e) => setTaskType(e.target.value as 'recurring' | 'one_time')}>
                <option value="recurring">Recurring</option>
                <option value="one_time">One-Time</option>
              </select>
            </label>
          </div>
          {error ? <p className="ody-error" style={{ margin: 0 }}>{error}</p> : null}
          <button className="ody-btn" type="submit" disabled={loading}>{loading ? 'Finishing...' : 'Complete Onboarding'}</button>
        </form>
      </section>
    </AppShell>
  )
}
