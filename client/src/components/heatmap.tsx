import { useMemo } from 'react'
import type { TaskHeatmapStatus } from '../app/types'

type HeatmapProps = {
  dates: Record<string, TaskHeatmapStatus>
}

type MonthLabel = {
  key: string
  label: string
  weekIndex: number
}

const DAY_MS = 24 * 60 * 60 * 1000

const dayLabels: Array<{ row: number; label: string }> = [
  { row: 0, label: 'M' },
  { row: 2, label: 'W' },
  { row: 4, label: 'F' },
]

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateKey(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(value: Date, amount: number): Date {
  return new Date(value.getTime() + amount * DAY_MS)
}

function weekdayMonFirst(value: Date): number {
  return (value.getDay() + 6) % 7
}

function alignToMonday(value: Date): Date {
  return addDays(value, -weekdayMonFirst(value))
}

function alignToSunday(value: Date): Date {
  return addDays(value, 6 - weekdayMonFirst(value))
}

function statusLabel(status: TaskHeatmapStatus): string {
  if (status === 'done') return 'Done'
  if (status === 'skipped') return 'Skipped'
  if (status === 'missed') return 'Missed'
  return 'Not due'
}

function formatDate(key: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(parseDateKey(key))
}

export function Heatmap({ dates }: HeatmapProps) {
  const keys = useMemo(() => Object.keys(dates).sort(), [dates])

  const model = useMemo(() => {
    if (keys.length === 0) {
      return { weeks: [] as Array<Array<TaskHeatmapStatus | null>>, monthLabels: [] as MonthLabel[] }
    }

    const first = parseDateKey(keys[0])
    const last = parseDateKey(keys[keys.length - 1])
    const start = alignToMonday(first)
    const end = alignToSunday(last)

    const totalDays = Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1
    const weekCount = Math.ceil(totalDays / 7)
    const weeks: Array<Array<TaskHeatmapStatus | null>> = Array.from({ length: weekCount }, () => Array(7).fill(null))
    const monthLabels: MonthLabel[] = []

    for (let i = 0; i < totalDays; i += 1) {
      const current = addDays(start, i)
      const key = toDateKey(current)
      const weekIndex = Math.floor(i / 7)
      const weekday = weekdayMonFirst(current)
      weeks[weekIndex][weekday] = dates[key] ?? null

      if (current.getDate() === 1) {
        monthLabels.push({
          key: `${current.getFullYear()}-${current.getMonth() + 1}`,
          label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(current),
          weekIndex,
        })
      }
    }

    if (monthLabels.length === 0 || monthLabels[0].weekIndex !== 0) {
      monthLabels.unshift({
        key: `${first.getFullYear()}-${first.getMonth() + 1}-start`,
        label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(first),
        weekIndex: 0,
      })
    }

    return { weeks, monthLabels }
  }, [dates, keys])

  if (keys.length === 0) {
    return null
  }

  return (
    <div className="ody-heatmap-wrap" role="group" aria-label="Task completion heatmap">
      <div className="ody-heatmap-months" aria-hidden>
        {model.monthLabels.map((month) => (
          <span key={month.key} style={{ gridColumn: month.weekIndex + 1 }}>
            {month.label}
          </span>
        ))}
      </div>

      <div className="ody-heatmap-grid-wrap">
        <div className="ody-heatmap-days" aria-hidden>
          {dayLabels.map((day) => (
            <span key={day.label} style={{ gridRow: day.row + 1 }}>
              {day.label}
            </span>
          ))}
        </div>

        <div className="ody-heatmap-grid" style={{ gridTemplateColumns: `repeat(${model.weeks.length}, 12px)` }}>
          {model.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="ody-heatmap-week">
              {week.map((status, dayIndex) => {
                if (!status) {
                  return <span key={dayIndex} className="ody-heatmap-cell" data-status="empty" aria-hidden />
                }

                const absoluteDay = weekIndex * 7 + dayIndex
                const day = addDays(alignToMonday(parseDateKey(keys[0])), absoluteDay)
                const dateKey = toDateKey(day)
                const tooltip = `${formatDate(dateKey)} - ${statusLabel(status)}`

                return (
                  <span
                    key={dayIndex}
                    className="ody-heatmap-cell"
                    data-status={status}
                    title={tooltip}
                    aria-label={tooltip}
                    tabIndex={0}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="ody-heatmap-legend" aria-hidden>
        <span className="ody-heatmap-legend-item"><span className="ody-heatmap-cell" data-status="done" /> Done</span>
        <span className="ody-heatmap-legend-item"><span className="ody-heatmap-cell" data-status="skipped" /> Skipped</span>
        <span className="ody-heatmap-legend-item"><span className="ody-heatmap-cell" data-status="missed" /> Missed</span>
        <span className="ody-heatmap-legend-item"><span className="ody-heatmap-cell" data-status="not_due" /> Not Due</span>
      </div>
    </div>
  )
}
