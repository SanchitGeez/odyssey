import { useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '../components/layout'
import { useAuth } from '../app/auth'
import type { InsightsOverview } from '../app/types'
import { defaultInsightsWindow } from '../lib/date'

export function InsightsPage() {
  const { api } = useAuth()
  const [overview, setOverview] = useState<InsightsOverview | null>(null)
  const [window, setWindow] = useState(defaultInsightsWindow())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async (fromDate: string, toDate: string) => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getInsightsOverview(fromDate, toDate)
      setOverview(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load insights'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(window.fromDate, window.toDate)
  }, [])

  const submitWindow = async (event: FormEvent) => {
    event.preventDefault()
    await load(window.fromDate, window.toDate)
  }

  return (
    <AppShell title="Insights Overview" subtitle="Streak + activity metrics for selected date window.">
      <section className="ody-card" style={{ marginBottom: 16 }}>
        <form className="ody-row" onSubmit={submitWindow}>
          <label className="ody-field" style={{ minWidth: 170 }}>
            <span className="ody-label">From</span>
            <input
              className="ody-input"
              type="date"
              value={window.fromDate}
              onChange={(e) => setWindow((w) => ({ ...w, fromDate: e.target.value }))}
            />
          </label>
          <label className="ody-field" style={{ minWidth: 170 }}>
            <span className="ody-label">To</span>
            <input
              className="ody-input"
              type="date"
              value={window.toDate}
              onChange={(e) => setWindow((w) => ({ ...w, toDate: e.target.value }))}
            />
          </label>
          <button className="ody-btn" type="submit">Refresh</button>
        </form>
      </section>

      {loading ? <section className="ody-card">Loading insights...</section> : null}
      {!loading && error ? <section className="ody-card ody-error">{error}</section> : null}

      {!loading && !error && overview ? (
        <section className="ody-grid">
          <div className="ody-grid three">
            <article className="ody-card">
              <h3 style={{ marginTop: 0 }}>Current Streak</h3>
              <p style={{ marginBottom: 0, fontSize: '2rem', fontFamily: 'var(--font-mono)' }}>{overview.current_streak} days</p>
            </article>
            <article className="ody-card">
              <h3 style={{ marginTop: 0 }}>Task Snapshot</h3>
              <p className="ody-muted" style={{ margin: 0 }}>Active: {overview.tasks.active}</p>
              <p className="ody-muted" style={{ margin: 0 }}>Done: {overview.tasks.done}</p>
              <p className="ody-muted" style={{ margin: 0 }}>Skipped: {overview.tasks.skipped}</p>
            </article>
            <article className="ody-card">
              <h3 style={{ marginTop: 0 }}>Quest + Journal</h3>
              <p className="ody-muted" style={{ margin: 0 }}>Active quests: {overview.quests.active}</p>
              <p className="ody-muted" style={{ margin: 0 }}>Quest updates: {overview.quests.updates}</p>
              <p className="ody-muted" style={{ margin: 0 }}>Journal entries: {overview.journals.entries}</p>
            </article>
          </div>

          <article className="ody-terminal">
            <p style={{ margin: 0 }}>
              Window: {overview.window.from_date} to {overview.window.to_date}
            </p>
            <p style={{ marginBottom: 0 }}>
              Quick actions: &gt; Start Check-In  &gt; Add Task
            </p>
          </article>
        </section>
      ) : null}
    </AppShell>
  )
}
