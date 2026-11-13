import { useId } from 'react'
import { Link } from 'react-router-dom'
import { DIMENSIONS, DIMENSION_KEYS } from '../lib/dimensions'
import type { DimensionScores } from '../app/types'
import { formatDate } from '../lib/date'
import { DimensionLabel } from './dimension-label'
import './dimension-radar.css'

const center = { x: 180, y: 170 }
function point(index: number, radius: number) {
  const angle = ((index * 60 - 90) * Math.PI) / 180
  return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius }
}
function ring(radius: number) {
  return DIMENSION_KEYS.map((_, index) => { const p = point(index, radius); return `${p.x},${p.y}` }).join(' ')
}

export function DimensionRadar({ scores }: { scores: DimensionScores }) {
  const id = useId()
  const summary = scores.dimensions
  const hasData = DIMENSION_KEYS.some((key) => summary[key].score !== null)
  const complete = DIMENSION_KEYS.every((key) => summary[key].score !== null)
  const points = DIMENSION_KEYS.map((key, index) => summary[key].score === null ? null : point(index, summary[key].score))
  const polygon = points.map((p) => p ? `${p.x},${p.y}` : '').join(' ')

  return <div className="dimension-radar-layout">
    <figure className="dimension-radar-figure">
      <svg className="dimension-radar-chart" viewBox="0 0 360 340" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>Follow-through across six life dimensions</title>
        <desc id={`${id}-description`}>Fixed scale from 0 to 100 percent. {DIMENSION_KEYS.map((key) => `${DIMENSIONS[key].label}: ${summary[key].score === null ? 'no data, nothing due' : `${summary[key].score} percent, ${summary[key].completed} of ${summary[key].due} actions completed`}`).join('. ')}. Missing dimensions are left unplotted. Scores measure follow-through, not life health.</desc>
        <g className="dimension-radar-grid" aria-hidden="true">
          {[0.25, 0.5, 0.75, 1].map((level) => <polygon key={level} points={ring(100 * level)} />)}
          {DIMENSION_KEYS.map((key, index) => { const p = point(index, 100); return <line key={key} x1={center.x} y1={center.y} x2={p.x} y2={p.y} /> })}
        </g>
        {hasData ? <g aria-hidden="true">
          {complete ? <polygon className="dimension-radar-data" points={polygon} /> : points.map((p, index) => {
            const next = points[(index + 1) % points.length]
            return p && next ? <line key={index} className="dimension-radar-data" x1={p.x} y1={p.y} x2={next.x} y2={next.y} /> : null
          })}
          {points.map((p, index) => p ? <circle className="dimension-radar-point" key={DIMENSION_KEYS[index]} cx={p.x} cy={p.y} r={3.5} /> : null)}
        </g> : <text className="dimension-radar-zero" x={180} y={175} textAnchor="middle" aria-hidden="true">No data yet</text>}
        <g className="dimension-radar-axis-labels" aria-hidden="true">{DIMENSION_KEYS.map((key, index) => { const p = point(index, 143); return <text key={key} x={p.x} y={p.y - 3} textAnchor="middle"><tspan x={p.x}>{DIMENSIONS[key].label}</tspan><tspan className={`dimension-radar-axis-count${summary[key].score === null ? ' dimension-radar-no-data' : ''}`} x={p.x} dy={19}>{summary[key].score === null ? 'No data' : `${summary[key].score}%`}</tspan></text> })}</g>
      </svg>
      <figcaption>Fixed scale: 0–100%.<br />{formatDate(scores.window.from_date)} – {formatDate(scores.window.to_date)}</figcaption>
    </figure>
    <div className="dimension-radar-details">
      <dl className="dimension-radar-legend">{DIMENSION_KEYS.map((key) => <div key={key} className="dimension-radar-legend-row"><dt><DimensionLabel dim={key} /><span>{summary[key].due ? `${summary[key].completed}/${summary[key].due} completed` : 'Nothing due'}</span></dt><dd aria-label={summary[key].score === null ? 'No data' : `${summary[key].score} percent`}>{summary[key].score === null ? '—' : `${summary[key].score}%`}</dd></div>)}</dl>
      <p className="dimension-radar-note">Completed ÷ due. Skips and misses count as incomplete. Weekly targets count when the week ends; one-time tasks count once at their deadline. Undated tasks and quests add no points.</p>
      {!hasData ? <p className="dimension-radar-note">No actions were due in this window. <Link to="/tasks">Plan a task</Link> and check in to build your history.</p> : null}
    </div>
  </div>
}
