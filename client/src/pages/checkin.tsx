import { useEffect, useState } from 'react'
import { AppShell } from '../components/layout'
import { useAuth } from '../app/auth'
import type { DailyItemsResponse } from '../app/types'
import { shiftDays, todayIso } from '../lib/date'

export function CheckInPage() {
  const { api } = useAuth()
  const [day, setDay] = useState(todayIso())
  const [data, setData] = useState<DailyItemsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [valueInput, setValueInput] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.dailyItems(day)
      setData(res)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load daily items'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [day])

  const activeItem = data?.items.find((item) => item.response == null)

  const respond = async (response: 'done' | 'skipped' | 'value_logged') => {
    if (!activeItem) return
    try {
      const payload = response === 'value_logged' ? { value: valueInput } : undefined
      await api.respondDaily(activeItem.task_id, response, day, payload)
      setValueInput('')
      await load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit response'
      setError(message)
    }
  }

  return (
    <AppShell title="Daily Check-In" subtitle="Respond to every due card for the day.">
      <section className="ody-card ody-row" style={{ marginBottom: 16 }}>
        <div className="ody-row">
          <button className="ody-btn secondary" onClick={() => setDay((d) => shiftDays(d, -1))}>Previous</button>
          <span className="ody-badge">{day}</span>
          <button className="ody-btn secondary" onClick={() => setDay((d) => shiftDays(d, 1))}>Next</button>
        </div>
        <button className="ody-btn secondary" onClick={load}>Refresh</button>
      </section>

      {loading ? <section className="ody-card">Loading daily cards...</section> : null}
      {!loading && error ? <section className="ody-card ody-error">{error}</section> : null}

      {!loading && !error && data ? (
        <section className="ody-card ody-grid">
          <div className="ody-row">
            <h3 style={{ margin: 0 }}>Progress</h3>
            <span className="ody-badge">{data.answered}/{data.total} answered</span>
          </div>

          {activeItem ? (
            <div className="ody-terminal ody-grid">
              <span className="ody-badge">{activeItem.category}</span>
              <h3 style={{ margin: 0 }}>{activeItem.title}</h3>
              <div className="ody-row">
                <button className="ody-btn" onClick={() => void respond('done')}>Done</button>
                <button className="ody-btn secondary" onClick={() => void respond('skipped')}>Skip</button>
              </div>
              <div className="ody-row">
                <input
                  className="ody-input"
                  value={valueInput}
                  placeholder="Optional value input"
                  onChange={(event) => setValueInput(event.target.value)}
                />
                <button className="ody-btn secondary" onClick={() => void respond('value_logged')}>Save Value</button>
              </div>
            </div>
          ) : (
            <div className="ody-terminal">
              <h3 style={{ marginTop: 0 }}>You are done for today</h3>
              <p className="ody-muted" style={{ marginBottom: 0 }}>All cards are answered for {data.date}.</p>
            </div>
          )}
        </section>
      ) : null}
    </AppShell>
  )
}
