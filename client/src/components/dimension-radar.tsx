import { useId } from 'react'
import { Link } from 'react-router-dom'
import { DIMENSIONS, DIMENSION_KEYS } from '../lib/dimensions'
import type { DimensionSummary } from '../lib/dimension-summary'
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

export function DimensionRadar({ summary }: { summary: DimensionSummary }) {
  const id = useId()
  const total = DIMENSION_KEYS.reduce((sum, key) => sum + summary[key].total, 0)
  const maximum = Math.max(1, ...DIMENSION_KEYS.map((key) => summary[key].total))
  const polygon = DIMENSION_KEYS.map((key, index) => { const p = point(index, summary[key].total / maximum * 100); return `${p.x},${p.y}` }).join(' ')

  return <div className="dimension-radar-layout">
    <figure className="dimension-radar-figure">
      <svg className="dimension-radar-chart" viewBox="0 0 360 340" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>Active commitments across six life dimensions</title>
        <desc id={`${id}-description`}>{total === 0 ? 'No active categorized tasks or quests. All six dimensions are zero.' : `The axis maximum is ${maximum} active ${maximum === 1 ? 'item' : 'items'}. ${DIMENSION_KEYS.map((key) => `${DIMENSIONS[key].label}: ${summary[key].total}`).join('. ')}.`} Counts include active tasks and categorized active quests in your current library. These are not health or balance scores.</desc>
        <g className="dimension-radar-grid" aria-hidden="true">
          {[0.25, 0.5, 0.75, 1].map((level) => <polygon key={level} points={ring(100 * level)} />)}
          {DIMENSION_KEYS.map((key, index) => { const p = point(index, 100); return <line key={key} x1={center.x} y1={center.y} x2={p.x} y2={p.y} /> })}
        </g>
        {total > 0 ? <g aria-hidden="true"><polygon className="dimension-radar-data" points={polygon} />{DIMENSION_KEYS.map((key, index) => { const p = point(index, summary[key].total / maximum * 100); return summary[key].total > 0 ? <circle className="dimension-radar-point" key={key} cx={p.x} cy={p.y} r={3.5} /> : null })}</g> : <text className="dimension-radar-zero" x={180} y={175} textAnchor="middle" aria-hidden="true">0 active</text>}
        <g className="dimension-radar-axis-labels" aria-hidden="true">{DIMENSION_KEYS.map((key, index) => { const p = point(index, 143); return <text key={key} x={p.x} y={p.y - 3} textAnchor="middle"><tspan x={p.x}>{DIMENSIONS[key].label}</tspan><tspan className="dimension-radar-axis-count" x={p.x} dy={19}>{summary[key].total}</tspan></text> })}</g>
      </svg>
      <figcaption>Axis maximum: {maximum} active {maximum === 1 ? 'item' : 'items'}{total === 0 ? ' (empty scale)' : ''}.</figcaption>
    </figure>
    <div className="dimension-radar-details">
      <dl className="dimension-radar-legend">{DIMENSION_KEYS.map((key) => <div key={key} className="dimension-radar-legend-row"><dt><DimensionLabel dim={key} /><span>{summary[key].tasks} {summary[key].tasks === 1 ? 'task' : 'tasks'}, {summary[key].quests} {summary[key].quests === 1 ? 'quest' : 'quests'}</span></dt><dd aria-label={`${summary[key].total} active items`}>{summary[key].total}</dd></div>)}</dl>
      {total === 0 ? <p className="dimension-radar-note">Your active commitments will shape this view. <Link to="/tasks">Create a task</Link> or <Link to="/quests">plan a quest</Link> to begin.</p> : <p className="dimension-radar-note">Counts show where your current commitments sit. Uncategorized quests are not included.</p>}
    </div>
  </div>
}
