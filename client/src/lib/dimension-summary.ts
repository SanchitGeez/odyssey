import type { LifeDimension, Quest, Task } from '../app/types'
import { DIMENSION_KEYS } from './dimensions'

export type DimensionSummary = Record<LifeDimension, { tasks: number; quests: number; total: number }>

/** Current active commitments, not dated activity or inferred life-balance scores. */
export function summarizeDimensions(
  tasks: Pick<Task, 'status' | 'category'>[],
  quests: Pick<Quest, 'status' | 'category'>[],
): DimensionSummary {
  const summary = Object.fromEntries(DIMENSION_KEYS.map((key) => [key, { tasks: 0, quests: 0, total: 0 }])) as DimensionSummary
  for (const task of tasks) {
    if (task.status !== 'active') continue
    summary[task.category].tasks += 1
    summary[task.category].total += 1
  }
  for (const quest of quests) {
    if (quest.status !== 'active' || !quest.category) continue
    summary[quest.category].quests += 1
    summary[quest.category].total += 1
  }
  return summary
}
