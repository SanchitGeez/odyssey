/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { shiftDays, todayIso } from './date'

test('civil-day shifts preserve calendar dates across time zones and DST', () => {
  const previous = process.env.TZ
  try {
    for (const zone of ['Asia/Kolkata', 'America/New_York', 'Europe/London']) {
      process.env.TZ = zone
      assert.equal(shiftDays('2026-11-01', 1), '2026-11-02', zone)
      assert.equal(shiftDays('2026-03-08', -1), '2026-03-07', zone)
      assert.equal(shiftDays('2026-12-31', 1), '2027-01-01', zone)
      assert.equal(shiftDays('2024-02-28', 1), '2024-02-29', zone)
    }
  } finally { process.env.TZ = previous }
})

test('today is the browser local date rather than a UTC date', context => {
  const previous = process.env.TZ
  try {
    process.env.TZ = 'Asia/Kolkata'
    context.mock.timers.enable({ apis: ['Date'], now: Date.UTC(2026, 10, 12, 22, 0) })
    assert.equal(todayIso(), '2026-11-13')
  } finally { context.mock.timers.reset(); process.env.TZ = previous }
})
