import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { AppShell } from '../components/layout'
import { Icon } from '../components/icons'
import { setOnboardingComplete } from '../lib/storage'

const dimensions = [
  { name: 'Body & Vitality', desc: 'Physical health, sleep, nutrition, fitness', color: 'var(--cat-body)', icon: 'target' },
  { name: 'Mind & Inner World', desc: 'Mental health, learning, emotional regulation', color: 'var(--cat-mind)', icon: 'eye' },
  { name: 'Work & Mastery', desc: 'Career, skills, productivity, purpose', color: 'var(--cat-work)', icon: 'scroll' },
  { name: 'Wealth & Resources', desc: 'Money, saving, investing, financial literacy', color: 'var(--cat-wealth)', icon: 'milestone' },
  { name: 'Connection & Belonging', desc: 'Family, friendships, relationships', color: 'var(--cat-connection)', icon: 'user' },
  { name: 'Meaning & Transcendence', desc: 'Values, creativity, legacy, purpose', color: 'var(--cat-meaning)', icon: 'compass' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, api } = useAuth()
  const [title, setTitle] = useState('10-minute walk')
  const [category, setCategory] = useState(dimensions[0].name)
  const [taskType, setTaskType] = useState<'recurring' | 'one_time'>('recurring')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const finish = async (e: FormEvent) => {
    e.preventDefault()
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
      if (user?.id) setOnboardingComplete(user.id)
      navigate('/check-in')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create starter task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Welcome to Odyssey" subtitle="Let us set up your chronicle">
      {/* Dimensions overview */}
      <section className="ody-card">
        <h3 className="ody-section-title" style={{ marginBottom: 16 }}>The Six Life Dimensions</h3>
        <div className="ody-grid three ody-stagger">
          {dimensions.map((dim) => (
            <div key={dim.name} className="ody-dim-card">
              <span className="ody-cat-dot" style={{ background: dim.color, width: 8, height: 8 }} />
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.85rem', marginBottom: 2 }}>{dim.name}</div>
                <div className="ody-muted" style={{ fontSize: '0.72rem' }}>{dim.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* First task creation */}
      <section className="ody-card" style={{ marginTop: 16, maxWidth: 520 }}>
        <h3 className="ody-section-title" style={{ marginBottom: 4 }}>Create Your First Task</h3>
        <p className="ody-muted" style={{ margin: '0 0 16px', fontSize: '0.78rem' }}>
          Pick something small. You can always add more later.
        </p>
        <form className="ody-grid" onSubmit={finish}>
          <label className="ody-field">
            <span className="ody-label">Task title</span>
            <input className="ody-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <div className="ody-grid two">
            <label className="ody-field">
              <span className="ody-label">Category</span>
              <select className="ody-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {dimensions.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
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
          <button className="ody-btn" type="submit" disabled={loading}>
            <Icon name="check" size={14} />
            {loading ? 'Setting up...' : 'Begin Your Chronicle'}
          </button>
        </form>
      </section>
    </AppShell>
  )
}
