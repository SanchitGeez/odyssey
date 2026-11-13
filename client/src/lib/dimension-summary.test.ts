/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { summarizeDimensions } from './dimension-summary'
import { DIMENSION_KEYS } from './dimensions'

test('dimension summary counts only active tasks and active categorized quests', () => {
  const summary = summarizeDimensions(
    [
      { status: 'active', category: 'vitality' },
      { status: 'active', category: 'vitality' },
      { status: 'active', category: 'prowess' },
      { status: 'completed', category: 'vitality' },
      { status: 'archived', category: 'wealth' },
    ],
    [
      { status: 'active', category: 'vitality' },
      { status: 'active', category: 'legacy' },
      { status: 'active', category: null },
      { status: 'paused', category: 'legacy' },
      { status: 'completed', category: 'psyche' },
      { status: 'archived', category: 'alliance' },
    ],
  )
  assert.deepEqual(summary.vitality, { tasks: 2, quests: 1, total: 3 })
  assert.deepEqual(summary.prowess, { tasks: 1, quests: 0, total: 1 })
  assert.deepEqual(summary.legacy, { tasks: 0, quests: 1, total: 1 })
  for (const dimension of ['psyche', 'wealth', 'alliance'] as const) {
    assert.deepEqual(summary[dimension], { tasks: 0, quests: 0, total: 0 })
  }
})

test('an empty library reports every named dimension with actual zeros', () => {
  const summary = summarizeDimensions([], [])
  assert.deepEqual(Object.keys(summary), DIMENSION_KEYS)
  for (const key of DIMENSION_KEYS) assert.deepEqual(summary[key], { tasks: 0, quests: 0, total: 0 })
})

test('aggregation leaves inputs intact and accumulators independent', () => {
  const task = Object.freeze({ status: 'active' as const, category: 'alliance' as const })
  const first = summarizeDimensions([task], [])
  const second = summarizeDimensions([], [])
  assert.equal(first.alliance.total, 1)
  assert.equal(first.wealth.total, 0)
  assert.equal(second.alliance.total, 0)
})
