import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { AppShell } from '../components/layout'
import { Icon } from '../components/icons'
import { DimensionSelect } from '../components/dimension-select'
import { SelectField } from '../components/select-field'
import { DimensionMark } from '../components/dimension-mark'
import { setOnboardingComplete } from '../lib/storage'
import type { LifeDimension } from '../app/types'
import { DIMENSIONS, DIMENSION_KEYS } from '../lib/dimensions'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, api } = useAuth()
  const [title, setTitle] = useState('10-minute walk')
  const [category, setCategory] = useState<LifeDimension>(DIMENSION_KEYS[0])
  const [taskType, setTaskType] = useState<'recurring' | 'one_time'>('recurring')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const finish = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
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
    <AppShell title="Welcome to Odyssey" subtitle="Start with one commitment. Build from there.">
      {/* Dimensions overview */}
      <section className="ody-card">
          <h2 className="ody-section-title" style={{ marginBottom: 16 }}>The Six Life Dimensions</h2>
          <div className="ody-grid three ody-stagger">
          {DIMENSION_KEYS.map((dimensionKey) => (
            <div key={dimensionKey} className="ody-dim-card">
              <DimensionMark dimension={dimensionKey} size={36} />
              <div>
                <div style={{ fontWeight: 500, fontSize: '1rem', marginBottom: 2 }}>

                  {DIMENSIONS[dimensionKey].label}
                </div>
                <div className="ody-muted" style={{ fontSize: '0.875rem' }}>{DIMENSIONS[dimensionKey].description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* First task creation */}
      <section className="ody-card" style={{ marginTop: 16, maxWidth: 520 }}>
        <h2 className="ody-section-title" style={{ marginBottom: 4 }}>Create Your First Task</h2>
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
              <DimensionSelect value={category} onChange={(value) => { if (value) setCategory(value) }} />
            </label>
            <label className="ody-field">
              <span className="ody-label">Type</span>
              <SelectField label="Type" value={taskType} onValueChange={(value) => setTaskType(value as 'recurring' | 'one_time')} options={[
                { value: 'recurring', label: 'Recurring', icon: 'repeat' },
                { value: 'one_time', label: 'One-time', icon: 'target' },
              ]} />
            </label>
          </div>
          {error ? <p role="alert" className="ody-error" style={{ margin: 0 }}>{error}</p> : null}
          <button className="ody-btn" type="submit" disabled={loading}>
            <Icon name="check" size={14} />
            {loading ? 'Setting up...' : 'Begin Your Odyssey'}
          </button>
        </form>
      </section>
    </AppShell>
  )
}
