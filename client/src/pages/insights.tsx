import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout'
import { DimensionFilter } from '../components/dimension-filter'
import { Icon } from '../components/icons'
import { useAuth } from '../app/auth'
import type { InsightsOverview, LifeDimension } from '../app/types'
import { defaultInsightsWindow, formatDate } from '../lib/date'
import { DIMENSIONS, DIMENSION_KEYS } from '../lib/dimensions'

const dimensions = DIMENSION_KEYS.map((dimensionKey) => ({
  key: dimensionKey,
  short: DIMENSIONS[dimensionKey].label,
  color: `var(${DIMENSIONS[dimensionKey].cssVar})`,
}))

function HexagonChart() {
  const cx = 150, cy = 140, r = 100
  const angles = dimensions.map((_, i) => (Math.PI * 2 * i) / 6 - Math.PI / 2)

  const gridPoints = (radius: number) =>
    angles.map((a) => `${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`).join(' ')

  const labelPos = (i: number, offset = 22) => ({
    x: cx + (r + offset) * Math.cos(angles[i]),
    y: cy + (r + offset) * Math.sin(angles[i]),
  })

  return (
    <div className="ody-hex-container">
      <svg width="300" height="290" viewBox="0 0 300 290">
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={gridPoints(r * scale)}
            fill="none"
            stroke="rgba(158, 163, 170, 0.12)"
            strokeWidth="0.5"
          />
        ))}
        {/* Axis lines */}
        {angles.map((a, i) => (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(a)}
            y2={cy + r * Math.sin(a)}
            stroke="rgba(158, 163, 170, 0.08)"
            strokeWidth="0.5"
          />
        ))}
        {/* Placeholder data shape (50-80% per axis) */}
        <polygon
          points={angles.map((a, i) => {
            const val = [0.7, 0.5, 0.65, 0.4, 0.55, 0.6][i]
            return `${cx + r * val * Math.cos(a)},${cy + r * val * Math.sin(a)}`
          }).join(' ')}
          fill="rgba(201, 164, 76, 0.08)"
          stroke="rgba(201, 164, 76, 0.5)"
          strokeWidth="1.5"
        />
        {/* Dots on vertices */}
        {angles.map((a, i) => {
          const val = [0.7, 0.5, 0.65, 0.4, 0.55, 0.6][i]
          return (
            <circle
              key={i}
              cx={cx + r * val * Math.cos(a)}
              cy={cy + r * val * Math.sin(a)}
              r="3"
              fill={dimensions[i].color}
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="1"
            />
          )
        })}
        {/* Labels */}
        {dimensions.map((dim, i) => {
          const pos = labelPos(i)
          return (
            <text
              key={dim.key}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={dim.color}
              style={{ fontSize: '8px' }}
            >
              {dim.short}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

export function InsightsPage() {
  const { api } = useAuth()
  const [overview, setOverview] = useState<InsightsOverview | null>(null)
  const [window, setWindow] = useState(defaultInsightsWindow())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dimFilter, setDimFilter] = useState<LifeDimension | 'all'>('all')

  const load = async (from: string, to: string) => {
    setLoading(true)
    setError('')
    try {
      setOverview(await api.getInsightsOverview(from, to))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load(window.fromDate, window.toDate) }, [])

  const submitWindow = async (e: FormEvent) => {
    e.preventDefault()
    await load(window.fromDate, window.toDate)
  }

  return (
    <AppShell
      title="Insights"
      subtitle="Your life dimensions at a glance"
      actions={
        <Link to="/check-in">
          <button className="ody-btn">
            <Icon name="shield" size={14} /> Check In
          </button>
        </Link>
      }
    >
      <DimensionFilter value={dimFilter} onChange={setDimFilter} />

      {loading ? (
        <div className="ody-grid three">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ody-skeleton ody-skeleton-card" style={{ height: 140 }} />
          ))}
        </div>
      ) : error ? (
        <div className="ody-card">
          <p className="ody-error" style={{ margin: 0 }}>{error}</p>
        </div>
      ) : overview ? (
        <div className="ody-grid">
          {/* Stat cards */}
          <div className="ody-grid three ody-insights-stats">
            <article className="ody-card ody-stat-card">
              <div style={{ color: 'var(--accent-gold)', marginBottom: 8 }}>
                <Icon name="flame" size={24} />
              </div>
              <div className="ody-stat-value">{overview.current_streak}</div>
              <div className="ody-stat-label">Day Streak</div>
              <div className="ody-stat-sub">Consistency over intensity</div>
            </article>

            <article className="ody-card ody-stat-card">
              <div style={{ color: 'var(--state-success)', marginBottom: 8 }}>
                <Icon name="check" size={24} />
              </div>
              <div className="ody-stat-value">{overview.tasks.done}</div>
              <div className="ody-stat-label">Tasks Done</div>
              <div className="ody-stat-sub">
                {overview.tasks.skipped} skipped &middot; {overview.tasks.active} active
              </div>
            </article>

            <article className="ody-card ody-stat-card">
              <div style={{ color: 'var(--cat-meaning)', marginBottom: 8 }}>
                <Icon name="compass" size={24} />
              </div>
              <div className="ody-stat-value">{overview.quests.active}</div>
              <div className="ody-stat-label">Active Quests</div>
              <div className="ody-stat-sub">
                {overview.quests.updates} updates &middot; {overview.journals.entries} journal entries
              </div>
            </article>
          </div>

          {/* Hexagon chart */}
          <article className="ody-card">
            <div className="ody-section-header">
              <h3 className="ody-section-title">Life Balance</h3>
              <span className="ody-badge gold">
                {formatDate(overview.window.from_date)} — {formatDate(overview.window.to_date)}
              </span>
            </div>
            <HexagonChart />
            <p className="ody-muted" style={{ textAlign: 'center', fontSize: '0.72rem', margin: 0 }}>
              {dimFilter === 'all'
                ? 'Category health scores will become data-driven as you track more activity.'
                : `${DIMENSIONS[dimFilter].label} is selected for activity filtering. The balance hexagon always shows all dimensions.`}
            </p>
          </article>

          {/* Date window selector */}
          <article className="ody-card">
            <form className="ody-row" onSubmit={submitWindow}>
              <label className="ody-field" style={{ minWidth: 150 }}>
                <span className="ody-label">From</span>
                <input className="ody-input" type="date" value={window.fromDate} onChange={(e) => setWindow((w) => ({ ...w, fromDate: e.target.value }))} />
              </label>
              <label className="ody-field" style={{ minWidth: 150 }}>
                <span className="ody-label">To</span>
                <input className="ody-input" type="date" value={window.toDate} onChange={(e) => setWindow((w) => ({ ...w, toDate: e.target.value }))} />
              </label>
              <button className="ody-btn secondary" type="submit" style={{ alignSelf: 'flex-end' }}>
                <Icon name="eye" size={14} /> Update
              </button>
            </form>
          </article>

          {/* Quick actions */}
          <div className="ody-grid two">
            <Link to="/check-in" style={{ textDecoration: 'none' }}>
              <div className="ody-card" style={{ textAlign: 'center', cursor: 'pointer', padding: '20px' }}>
                <Icon name="shield" size={20} className="ody-muted" />
                <p style={{ margin: '8px 0 0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Start Check-In
                </p>
              </div>
            </Link>
            <Link to="/tasks" style={{ textDecoration: 'none' }}>
              <div className="ody-card" style={{ textAlign: 'center', cursor: 'pointer', padding: '20px' }}>
                <Icon name="plus" size={20} className="ody-muted" />
                <p style={{ margin: '8px 0 0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Add New Task
                </p>
              </div>
            </Link>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}
