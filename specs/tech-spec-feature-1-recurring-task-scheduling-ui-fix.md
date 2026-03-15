# Tech Spec: Feature 1 - Recurring Task Scheduling UI Fix

**Date:** March 15, 2026  
**Status:** Draft  
**Owner:** Frontend

## 1) Context

From [PRD](/home/sanchit/projects/odyssey/specs/PRD.md), recurring tasks must support:
- `daily`
- `specific_days` (selected weekdays)
- `x_per_week` (target count)
- `once_per_week`

Current frontend behavior in [tasks.tsx](/home/sanchit/projects/odyssey/client/src/pages/tasks.tsx):
- Schedule type dropdown exists.
- No UI to capture `days_of_week` or `target_count`.
- `schedule_config` is not sent in create/update payloads.
- Edit form does not restore `schedule_config`.

Backend already supports `schedule_config` in task create/update schemas and stores it in DB (`tasks.schedule_config` JSON).

## 2) Problem Statement

Users can select recurring schedule variants, but the form silently drops required schedule details, causing:
- Incorrect due logic downstream (especially `specific_days`, `x_per_week`).
- Mismatch between selected UI option and persisted data.
- Inconsistent edit experience.

## 3) Goals

1. Capture and persist recurring schedule details (`days_of_week`, `target_count`) from the tasks form.
2. Restore schedule details correctly when editing existing recurring tasks.
3. Validate user input before submission for schedule-specific constraints.
4. Keep backward-compatible behavior for existing tasks without `schedule_config`.

## 4) Non-Goals

- No backend schema or endpoint changes.
- No check-in algorithm changes (handled in Feature 2).
- No category model migration changes.

## 5) Scope

### In Scope
- `client/src/pages/tasks.tsx`
- `client/src/index.css` (new day-picker styles)

### Out of Scope
- `checkin.tsx` behavior changes
- onboarding recurring schedule enhancements

## 6) Data Contract

### Existing API Contract (No Change)

`TaskPayload` in [auth.tsx](/home/sanchit/projects/odyssey/client/src/app/auth.tsx) already allows:
- `schedule_type?: string`
- `schedule_config?: Record<string, unknown>`

### Payload Rules (Frontend Responsibility)

For `task_type = recurring`:
- `daily` -> omit `schedule_config`
- `specific_days` -> `schedule_config = { days_of_week: number[] }`
- `x_per_week` -> `schedule_config = { target_count: number }`
- `once_per_week` -> `schedule_config = { target_count: 1 }`

Weekday mapping must remain:
- `0=Mon, 1=Tue, ..., 6=Sun`
(matches Python `date.weekday()` used by backend scheduling service)

## 7) UI/UX Specification

### 7.1 Form State Additions
Extend `TaskForm` with:
- `days_of_week: number[]`
- `target_count: number`

Defaults:
- `days_of_week: []`
- `target_count: 3`

### 7.2 Conditional Inputs

Under recurring `Schedule` selector:
- If `schedule_type === specific_days`:
  - Show weekday toggle row (`Mon Tue Wed Thu Fri Sat Sun`).
  - Multi-select allowed.
  - Minimum one day required.
- If `schedule_type === x_per_week`:
  - Show numeric input `Times per week`.
  - Min `1`, max `7`.
- If `schedule_type === once_per_week`:
  - No additional input rendered.

### 7.3 Edit Mode Hydration
When opening edit for existing task:
- `days_of_week = task.schedule_config?.days_of_week ?? []`
- `target_count = task.schedule_config?.target_count ?? 3`

### 7.4 Type Change Reset Rules
On changing `schedule_type`:
- To `specific_days`:
  - keep existing `days_of_week` if present; else `[]`
  - reset `target_count` to default `3`
- To `x_per_week`:
  - keep existing `target_count` if present; else `3`
  - reset `days_of_week` to `[]`
- To `once_per_week` or `daily`:
  - reset `days_of_week` to `[]`
  - reset `target_count` to `3` (internal default; submit layer enforces `1` for once/week)

## 8) Validation Rules

Pre-submit client validation:
- `specific_days`: reject submit if `days_of_week.length === 0`.
- `x_per_week`: clamp/validate `target_count` to integer in `[1,7]`.
- `once_per_week`: always submit `target_count = 1`.

Validation errors should be inline near the relevant control and prevent API call.

## 9) Styling Spec

Add styles in [index.css](/home/sanchit/projects/odyssey/client/src/index.css):
- `.ody-day-picker` container (horizontal row with spacing/wrap support).
- `.ody-day-toggle` button base.
- `.ody-day-toggle.active` state using accent gold tokens.

Style must follow existing Odyssey tokens:
- `--border-soft`
- `--accent-gold`
- `--accent-gold-dim`
- `--text-muted`

## 10) Implementation Plan

1. Update `TaskForm` type and `initialForm`.
2. Add helper functions in `tasks.tsx`:
   - toggle weekday in `days_of_week`.
   - sanitize `target_count`.
   - build `schedule_config` for submit payload.
3. Add conditional recurring sub-controls for day picker and count input.
4. Add inline validation state for schedule-specific errors.
5. Hydrate `schedule_config` values in `openEdit`.
6. Reset related fields in `schedule_type` change handler.
7. Add day-toggle CSS classes in `index.css`.

## 11) Edge Cases

- Legacy recurring tasks with missing `schedule_config`:
  - Edit screen should still load.
  - Safe defaults shown (`[]`, `3`).
- Invalid historic config shape (wrong types):
  - Coerce defensively:
    - `days_of_week`: keep only integers `0..6`
    - `target_count`: fallback `3` if invalid
- User switches between schedule types before save:
  - Payload must only include config relevant to selected `schedule_type`.

## 12) Testing Strategy

### Manual QA

1. Create recurring `specific_days` with Mon+Thu.
   - Verify request payload includes `schedule_config.days_of_week: [0,3]`.
   - Re-open edit, verify chips remain selected.
2. Create recurring `x_per_week` with `4`.
   - Verify payload includes `schedule_config.target_count: 4`.
   - Re-open edit and verify value restored.
3. Create recurring `once_per_week`.
   - Verify payload includes `schedule_config.target_count: 1` (or omitted then normalized if implementation chooses).
4. Try submitting `specific_days` with no selected day.
   - Verify inline error and no network request.
5. Switch `specific_days -> x_per_week -> daily` before submit.
   - Verify stale `days_of_week` is not submitted.

### Suggested Unit Tests (Frontend)

Add tests around pure helpers (if extracted):
- `buildScheduleConfig(schedule_type, form)` behavior.
- `normalizeTargetCount(input)` clamps to `[1,7]`.
- weekday toggle add/remove behavior.

## 13) Risks and Mitigations

- Risk: hidden stale config values sent when schedule changes.
  - Mitigation: construct `schedule_config` only from current `schedule_type`.
- Risk: backend rejects malformed config values.
  - Mitigation: strict client-side validation and coercion.

## 14) Acceptance Criteria

1. Recurring form renders schedule-specific inputs for `specific_days` and `x_per_week`.
2. Create/update requests include correct `schedule_config` for recurring schedule types.
3. Edit form restores existing `schedule_config` values.
4. Validation blocks invalid `specific_days` and invalid `x_per_week` counts.
5. No regression to one-time task creation/edit flows.
