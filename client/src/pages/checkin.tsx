import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { DimensionLabel } from '../components/dimension-label'
import { Icon } from '../components/icons'
import type { DailyItemsResponse, DailyItem } from '../app/types'
import { shiftDays, todayIso, formatDate } from '../lib/date'

export function CheckInPage() {
  const { api } = useAuth()
  const [day, setDay] = useState(todayIso())
  const [data, setData] = useState<DailyItemsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [valueInput, setValueInput] = useState('')
  const [responding, setResponding] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.dailyItems(day)
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load daily items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [day])

  const pendingItems = data?.items.filter((item) => item.response == null) ?? []
  const activeItem: DailyItem | undefined = pendingItems[0]
  const total = data?.total ?? 0
  const answered = data?.answered ?? 0
  const progress = total > 0 ? (answered / total) * 100 : 0
  const isComplete = !loading && !error && data && pendingItems.length === 0

  const respond = async (response: 'done' | 'skipped' | 'value_logged') => {
    if (!activeItem || responding) return
    setResponding(true)
    try {
      const payload = response === 'value_logged' ? { value: valueInput } : undefined
      await api.respondDaily(activeItem.task_id, response, day, payload)
      setValueInput('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit response')
    } finally {
      setResponding(false)
    }
  }

  const isToday = day === todayIso()

  return (
    <div className="ody-checkin-focused">
      {/* Top bar */}
      <div className="ody-checkin-topbar">
        <Link to="/insights" className="ody-brand-mini" style={{ textDecoration: 'none' }}>
          Odyssey
        </Link>
        <div className="ody-date-nav">
          <button onClick={() => setDay((d) => shiftDays(d, -1))} aria-label="Previous day">
            <Icon name="arrow-left" size={16} />
          </button>
          <span className="ody-date-label">{isToday ? 'Today' : formatDate(day)}</span>
          <button onClick={() => setDay((d) => shiftDays(d, 1))} aria-label="Next day">
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
        <Link to="/tasks" style={{ textDecoration: 'none' }}>
          <button className="ody-icon-btn" aria-label="Back to tasks">
            <Icon name="x" size={18} />
          </button>
        </Link>
      </div>

      {/* Progress bar */}
      <div className="ody-progress-track">
        <div className="ody-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Center content */}
      <div className="ody-checkin-center">
        {loading ? (
          <div className="ody-checkin-card">
            <div className="ody-skeleton ody-skeleton-line" style={{ width: '40%', margin: '0 auto 16px' }} />
            <div className="ody-skeleton ody-skeleton-line" style={{ width: '70%', margin: '0 auto 12px' }} />
            <div className="ody-skeleton ody-skeleton-line" style={{ width: '50%', margin: '0 auto' }} />
          </div>
        ) : error ? (
          <div className="ody-checkin-card">
            <p className="ody-error" style={{ margin: 0 }}>{error}</p>
            <button className="ody-btn secondary" onClick={load} style={{ marginTop: 16 }}>
              <Icon name="play" size={14} /> Retry
            </button>
          </div>
        ) : isComplete ? (
          /* Completion screen */
          <div className="ody-checkin-complete">
            <div className="ody-streak-glow">
              <span className="ody-streak-num">
                <Icon name="check" size={40} />
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              margin: '0 0 8px',
            }}>
              All Done
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 8px', fontSize: '0.82rem' }}>
              {answered} of {total} cards completed for {isToday ? 'today' : formatDate(day)}
            </p>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 24px', fontSize: '0.78rem' }}>
              You showed up. That is what matters.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/insights">
                <button className="ody-btn">
                  <Icon name="eye" size={14} /> View Insights
                </button>
              </Link>
              <Link to="/journals">
                <button className="ody-btn secondary">
                  <Icon name="book" size={14} /> Write Journal
                </button>
              </Link>
            </div>
          </div>
        ) : activeItem ? (
          /* Active card */
          <>
            <div className="ody-checkin-counter">
              Card {answered + 1} of {total}
            </div>
            <div className="ody-checkin-card" key={activeItem.task_id}>
              <div className="ody-checkin-category">
                <DimensionLabel dim={activeItem.category} />
              </div>
              <h3 className="ody-checkin-task-title">{activeItem.title}</h3>
              <div className="ody-checkin-actions">
                <button
                  className="ody-checkin-btn done"
                  onClick={() => void respond('done')}
                  disabled={responding}
                >
                  <Icon name="check" size={18} />
                  Done
                </button>
                <button
                  className="ody-checkin-btn skip"
                  onClick={() => void respond('skipped')}
                  disabled={responding}
                >
                  <Icon name="x" size={18} />
                  Skip
                </button>
              </div>
              <div className="ody-checkin-value-row">
                <input
                  className="ody-input"
                  value={valueInput}
                  placeholder="Log a value (optional)"
                  onChange={(e) => setValueInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && valueInput.trim()) void respond('value_logged')
                  }}
                />
                {valueInput.trim() ? (
                  <button
                    className="ody-btn secondary"
                    onClick={() => void respond('value_logged')}
                    disabled={responding}
                  >
                    Save
                  </button>
                ) : null}
              </div>
            </div>
            {answered > 0 ? (
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: 16,
              }}>
                Progress saved — you can continue later
              </p>
            ) : null}
          </>
        ) : (
          <div className="ody-empty">
            <div className="ody-empty-icon"><Icon name="shield" size={22} /></div>
            <h4>No Cards Due</h4>
            <p>No tasks are scheduled for this day.</p>
            <Link to="/tasks">
              <button className="ody-btn" style={{ marginTop: 16 }}>
                <Icon name="plus" size={14} /> Create a Task
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
