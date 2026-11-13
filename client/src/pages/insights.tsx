import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout'
import { Icon } from '../components/icons'
import { DimensionRadar } from '../components/dimension-radar'
import { useAuth } from '../app/auth'
import type { InsightsOverview } from '../app/types'
import { defaultInsightsWindow, formatDate, todayIso } from '../lib/date'
import { summarizeDimensions, type DimensionSummary } from '../lib/dimension-summary'

export function InsightsPage() {
  const { api } = useAuth()
  const [overview, setOverview] = useState<InsightsOverview | null>(null)
  const [dateWindow, setDateWindow] = useState(defaultInsightsWindow)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rangeError, setRangeError] = useState('')
  const [dimensions, setDimensions] = useState<DimensionSummary | null>(null)
  const [dimensionsLoading, setDimensionsLoading] = useState(true)
  const [dimensionsError, setDimensionsError] = useState('')

  const loadDimensions = useCallback(async () => {
    setDimensionsLoading(true)
    setDimensionsError('')
    try {
      const [tasks, quests] = await Promise.all([api.listTasks(), api.listQuests()])
      setDimensions(summarizeDimensions(tasks, quests))
    } catch (err) {
      setDimensionsError(err instanceof Error ? err.message : 'Could not load your life dimensions. Try again.')
    } finally {
      setDimensionsLoading(false)
    }
  }, [api])

  const load = useCallback(async (from: string, to: string) => {
    setLoading(true)
    setError('')
    try {
      setOverview(await api.getInsightsOverview(from, to))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your activity. Try again.')
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    const initial = defaultInsightsWindow()
    void load(initial.fromDate, initial.toDate)
    void loadDimensions()
  }, [load, loadDimensions])

  const submitWindow = async (event: FormEvent) => {
    event.preventDefault()
    if (!dateWindow.fromDate || !dateWindow.toDate || dateWindow.fromDate > dateWindow.toDate) {
      setRangeError('Choose a start date on or before the end date.')
      return
    }
    setRangeError('')
    await load(dateWindow.fromDate, dateWindow.toDate)
  }

  return (
    <AppShell
      title="Insights"
      subtitle="A clear view of the work you have put in."
      actions={<Link className="ody-btn" to="/check-in"><Icon name="shield" size={18} /> Check In</Link>}
    >
      <form className="ody-insights-window" onSubmit={submitWindow}>
        <label className="ody-field">
          <span className="ody-label">From</span>
          <input className="ody-input" type="date" required max={dateWindow.toDate || todayIso()} value={dateWindow.fromDate} onChange={(e) => setDateWindow((current) => ({ ...current, fromDate: e.target.value }))} />
        </label>
        <label className="ody-field">
          <span className="ody-label">To</span>
          <input className="ody-input" type="date" required min={dateWindow.fromDate} value={dateWindow.toDate} onChange={(e) => setDateWindow((current) => ({ ...current, toDate: e.target.value }))} />
        </label>
        <button className="ody-btn secondary" type="submit" disabled={loading}>
          <Icon name="calendar" size={18} /> {loading ? 'Loading...' : 'Apply dates'}
        </button>
      </form>
      {rangeError ? <p className="ody-field-error" role="alert">{rangeError}</p> : null}

      <section className="ody-card dimension-radar-section" aria-labelledby="life-dimensions-heading">
        <h2 id="life-dimensions-heading" className="ody-section-title">Life dimensions</h2>
        <p className="dimension-radar-intro">Active tasks and quests by dimension. Current library snapshot.</p>
        {dimensionsLoading ? <div className="dimension-radar-loading" role="status" aria-label="Loading life dimensions" aria-busy="true"><div className="ody-skeleton" /><div className="ody-skeleton" /></div>
        : dimensionsError ? <div className="dimension-radar-error" role="alert"><p>{dimensionsError}</p><button className="ody-btn secondary" onClick={() => void loadDimensions()}>Retry dimensions</button></div>
        : dimensions ? <DimensionRadar summary={dimensions} /> : null}
      </section>

      {loading ? (
        <div className="ody-grid three" aria-label="Loading activity" aria-busy="true">
          {[1, 2, 3].map((item) => <div key={item} className="ody-skeleton ody-skeleton-card" />)}
        </div>
      ) : error ? (
        <div className="ody-card ody-inline-error" role="alert">
          <p>{error}</p>
          <button className="ody-btn secondary" onClick={() => void load(dateWindow.fromDate, dateWindow.toDate)}>Retry</button>
        </div>
      ) : overview ? (
        <div className="ody-grid">
          <p className="ody-muted">Recorded activity from {formatDate(overview.window.from_date)} to {formatDate(overview.window.to_date)}.</p>
          <div className="ody-grid three ody-insights-stats">
            <article className="ody-card ody-stat-card">
              <Icon name="flame" size={24} />
              <div className="ody-stat-value">{overview.current_streak}</div>
              <h2 className="ody-stat-label">Check-in day streak</h2>
              <p className="ody-stat-sub">Consecutive completed check-ins ending on the selected end date.</p>
            </article>
            <article className="ody-card ody-stat-card">
              <Icon name="check" size={24} />
              <div className="ody-stat-value">{overview.tasks.done}</div>
              <h2 className="ody-stat-label">Task completions</h2>
              <p className="ody-stat-sub">Done responses recorded in this date range.</p>
            </article>
            <article className="ody-card ody-stat-card">
              <Icon name="book" size={24} />
              <div className="ody-stat-value">{overview.journals.entries}</div>
              <h2 className="ody-stat-label">Journal entries</h2>
              <p className="ody-stat-sub">Reflections written in this date range.</p>
            </article>
          </div>
          <section className="ody-card ody-activity-overview">
            <h2 className="ody-section-title">Your activity</h2>
            <dl>
              <div><dt>Tasks in your library</dt><dd>{overview.tasks.active}</dd></div>
              <div><dt>Skipped responses in this range</dt><dd>{overview.tasks.skipped}</dd></div>
              <div><dt>Quests in your library</dt><dd>{overview.quests.active}</dd></div>
              <div><dt>Quest updates in this range</dt><dd>{overview.quests.updates}</dd></div>
            </dl>
            {overview.tasks.done === 0 && overview.journals.entries === 0 && overview.quests.updates === 0 ? (
              <p className="ody-muted">No activity recorded in this range yet. Your next check-in or reflection will appear here.</p>
            ) : null}
          </section>
          <div className="ody-row">
            <Link className="ody-btn secondary" to="/tasks"><Icon name="scroll" size={18} /> View tasks</Link>
            <Link className="ody-btn secondary" to="/journals"><Icon name="book" size={18} /> Open journal</Link>
          </div>
        </div>
      ) : null}

    </AppShell>
  )
}
