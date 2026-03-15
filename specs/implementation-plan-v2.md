# Odyssey Implementation Plan — Phase 2

**Date:** March 15, 2026
**Scope:** 11 features from temp2.md requests + selected good-to-haves

---

## Feature Index

| # | Feature | Type | Priority |
|---|---------|------|----------|
| 1 | Recurring task scheduling UI fix | Bug Fix | P0 |
| 2 | Habit day-wise bug fix | Bug Fix | P0 |
| 3 | DB-level dimension enums | Backend | P0 |
| 4 | Styled category labels (style guide compliant) | UI | P1 |
| 5 | Dimension-specific filters on all pages | UI | P1 |
| 6 | Journal UX overhaul + full-screen writing | UI | P1 |
| 7 | Per-habit heatmap | Feature | P2 |
| 8 | Archived habit search + revive | Feature | P2 |
| 9 | Help section with dimension guide + example todos | Feature | P2 |
| 11 | Today's Win (PRD 9.5) | Feature | P2 |
| 14 | Quick Catch-Up Flow (PRD 9.12) | Feature | P2 |

---

## Feature 1: Recurring Task Scheduling UI Fix

### Problem
The backend fully supports `schedule_config` with `days_of_week` (for `specific_days`) and `target_count` (for `x_per_week` / `once_per_week`), but the frontend task form:
- Shows the `schedule_type` dropdown but never renders day picker or count input
- Never sends `schedule_config` in the create/update payload
- Never restores `schedule_config` values when editing an existing task

### Files to Change

**`client/src/pages/tasks.tsx`**

1. **Expand form state** (around line 28-47):
   ```typescript
   // Add to TaskForm type:
   days_of_week: number[]     // 0=Mon, 1=Tue, ..., 6=Sun
   target_count: number       // for x_per_week
   ```

2. **Day picker UI** — render after `schedule_type === 'specific_days'` (insert after line ~300):
   - Row of 7 toggle buttons: `Mon Tue Wed Thu Fri Sat Sun`
   - Each button toggles its index in `days_of_week[]`
   - Styled as small pill toggles with gold active state (matches style guide button pattern)
   - Minimum 1 day required — show validation error if empty

3. **Count input** — render after `schedule_type === 'x_per_week'` (same area):
   - Numeric input with label "Times per week"
   - Range: 1–7, default 3
   - Stepper buttons (- / +) or plain input

4. **Build `schedule_config` in submit handler** (around line ~245):
   ```typescript
   // Before API call, construct schedule_config:
   let schedule_config: Record<string, unknown> | undefined;
   if (form.schedule_type === 'specific_days') {
     schedule_config = { days_of_week: form.days_of_week };
   } else if (form.schedule_type === 'x_per_week') {
     schedule_config = { target_count: form.target_count };
   } else if (form.schedule_type === 'once_per_week') {
     schedule_config = { target_count: 1 };
   }
   // Include schedule_config in the payload sent to API
   ```

5. **Restore on edit** — when opening edit mode (around line ~195):
   ```typescript
   // When populating form from existing task:
   days_of_week: task.schedule_config?.days_of_week ?? [],
   target_count: task.schedule_config?.target_count ?? 3,
   ```

6. **Clear on type change** — when `schedule_type` changes, reset the related fields

**`client/src/index.css`**

Add styles for day picker toggles:
```css
.ody-day-picker { display: flex; gap: 6px; }
.ody-day-toggle {
  width: 36px; height: 36px;
  border: 1px solid var(--border-soft);
  background: transparent;
  color: var(--text-muted);
  font: 400 0.72rem/1 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 240ms ease;
}
.ody-day-toggle.active {
  border-color: var(--accent-gold);
  color: var(--accent-gold);
  background: var(--accent-gold-dim);
}
```

### No Backend Changes Required
The backend already handles `schedule_config` correctly in `TaskCreateIn`, `TaskUpdateIn`, and the scheduling service.

---

## Feature 2: Habit Day-wise Bug Fix

### Problem
Tasks with `schedule_type = 'specific_days'` or `x_per_week` may not appear correctly in daily check-in because:
- The frontend sends `schedule_config: undefined/null` (fixed by Feature 1)
- The backend `task_due_on()` service needs verification for edge cases

### Files to Verify/Fix

**`server/app/modules/tasks/domain/services.py`**

1. **Verify `task_due_on()` logic** for `specific_days`:
   - Reads `task.schedule_config["days_of_week"]` — must handle `None` gracefully
   - Python `weekday()` returns 0=Monday, 6=Sunday — confirm this matches frontend convention
   - Add guard: if `schedule_config` is None for `specific_days`, treat as daily (fallback)

2. **Verify `x_per_week` logic**:
   - Counts completions (done) in current Mon–Sun window
   - If completions >= `target_count`, task is suppressed for rest of week
   - Edge case: what if `target_count` is missing from config? Default to 1

3. **Add defensive defaults**:
   ```python
   # In task_due_on():
   if task.schedule_type == "specific_days":
       days = (task.schedule_config or {}).get("days_of_week", [])
       if not days:
           return True  # fallback: show daily if misconfigured
       return target_date.weekday() in days

   if task.schedule_type in ("x_per_week", "once_per_week"):
       target = (task.schedule_config or {}).get("target_count", 1)
       # ... count completions this week ...
   ```

**`client/src/pages/checkin.tsx`**

4. **Verify daily items response handling** — ensure `DailyItem` response correctly filters already-met weekly targets (this is backend-driven, but verify the UI doesn't re-show hidden items)

### Testing
- Create task with `specific_days: [0, 3]` (Mon, Thu) — should only appear on those days
- Create task with `x_per_week: 3` — should disappear after 3 completions Mon–Sun
- Create task with `once_per_week` — should disappear after 1 completion

---

## Feature 3: DB-Level Dimension Enums

### Problem
`category` on `tasks`, `quests`, and `category_tags` on `journal_entries` are free-text strings. No DB constraint prevents typos or inconsistent values.

### Files to Change

**`server/app/shared/db/models.py`**

1. **Add LifeDimension enum** (add near other enum definitions):
   ```python
   class LifeDimension(str, enum.Enum):
       vitality = "vitality"
       psyche = "psyche"
       prowess = "prowess"
       wealth = "wealth"
       alliance = "alliance"
       legacy = "legacy"
   ```

2. **Update Task model**: Change `category = Column(String(64))` to `category = Column(Enum(LifeDimension))`

3. **Update Quest model**: Change `category = Column(String(64), nullable=True)` to `category = Column(Enum(LifeDimension), nullable=True)`

4. **JournalEntry `category_tags`**: Keep as JSON list but validate values in Pydantic schemas

**`server/app/modules/tasks/application/schemas.py`** (or wherever Pydantic schemas live)

5. **Update `TaskCreateIn`**: Change `category: str` to `category: LifeDimension`
6. **Update `TaskOut`**: Change `category: str` to `category: LifeDimension`
7. **Update `QuestCreateIn`/`QuestOut`**: Same treatment
8. **Add validator for journal `category_tags`**:
   ```python
   @field_validator("category_tags")
   def validate_category_tags(cls, v):
       valid = {d.value for d in LifeDimension}
       if v:
           for tag in v:
               if tag not in valid:
                   raise ValueError(f"Invalid category: {tag}")
       return v
   ```

**`server/alembic/versions/0002_dimension_enums.py`** (new migration)

9. **Create Alembic migration**:
   ```python
   # 1. Create the PostgreSQL enum type
   life_dimension = postgresql.ENUM(
       'vitality', 'psyche', 'prowess', 'wealth', 'alliance', 'legacy',
       name='lifedimension', create_type=True
   )

   # 2. Migrate existing data — map old string values to new enum values
   # Old values like "Body & Vitality" -> "vitality", "Mind & Inner World" -> "psyche", etc.
   op.execute("""
       UPDATE tasks SET category = CASE category
           WHEN 'Body & Vitality' THEN 'vitality'
           WHEN 'Mind & Inner World' THEN 'psyche'
           WHEN 'Work & Mastery' THEN 'prowess'
           WHEN 'Wealth & Resources' THEN 'wealth'
           WHEN 'Connection & Belonging' THEN 'alliance'
           WHEN 'Meaning & Transcendence' THEN 'legacy'
           ELSE lower(split_part(category, ' ', 1))
       END
   """)
   # Same for quests table

   # 3. ALTER COLUMN to use the new enum type
   # (cast via USING category::lifedimension)
   ```

**`client/src/app/types.ts`**

10. **Add dimension type**:
    ```typescript
    type LifeDimension = 'vitality' | 'psyche' | 'prowess' | 'wealth' | 'alliance' | 'legacy'
    ```

11. **Update `Task`, `Quest`, `Journal` types** to use `LifeDimension`

**All frontend pages using category arrays**

12. **Update category constants** in `tasks.tsx`, `journals.tsx`, `checkin.tsx`, `insights.tsx`, `quests.tsx`, `onboarding.tsx` — replace the old display-name arrays with a shared constant map:

    ```typescript
    // client/src/lib/dimensions.ts (new shared file)
    export const DIMENSIONS: Record<LifeDimension, { label: string; description: string; cssVar: string }> = {
      vitality:  { label: 'Vitality',  description: 'Physical health, sleep, nutrition, fitness', cssVar: '--cat-body' },
      psyche:    { label: 'Psyche',    description: 'Mental health, self-awareness, learning',    cssVar: '--cat-mind' },
      prowess:   { label: 'Prowess',   description: 'Career, skills, productivity, purpose',      cssVar: '--cat-work' },
      wealth:    { label: 'Wealth',    description: 'Money, saving, investing, financial literacy', cssVar: '--cat-wealth' },
      alliance:  { label: 'Alliance',  description: 'Family, friendships, relationships',          cssVar: '--cat-connection' },
      legacy:    { label: 'Legacy',    description: 'Values, purpose, creativity, legacy',          cssVar: '--cat-meaning' },
    }
    ```

---

## Feature 4: Styled Category Labels (Style Guide Compliant)

### Goal
Replace plain text category names with properly styled labels that follow the Odyssey styling guide — no emoji, using the heraldic minimalism aesthetic.

### Design Spec
Each category label is a small inline element with:
- A 6px circle dot in the dimension color (per `--cat-*` CSS vars)
- Label text in uppercase monospace serif (`--font-mono`) at `0.68rem`
- Letter-spacing `0.06em`
- No background fill, no border — just dot + text
- Used everywhere a category is displayed: task lists, quest lists, journal tags, check-in cards, insights

### Files to Change

**`client/src/lib/dimensions.ts`** (created in Feature 3)

Already contains the mapping. Add a React component:

```typescript
export function DimensionLabel({ dim }: { dim: LifeDimension }) {
  const d = DIMENSIONS[dim];
  return (
    <span className="ody-dim-label">
      <span className="ody-dim-dot" style={{ background: `var(${d.cssVar})` }} />
      {d.label}
    </span>
  );
}
```

**`client/src/index.css`**

```css
.ody-dim-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: 400 0.68rem/1 var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
}
.ody-dim-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
```

**All pages rendering categories**

Replace inline category text/badges with `<DimensionLabel dim={item.category} />`:
- `client/src/pages/tasks.tsx` — task list items
- `client/src/pages/quests.tsx` — quest list items
- `client/src/pages/journals.tsx` — category tag badges
- `client/src/pages/checkin.tsx` — check-in card category display
- `client/src/pages/insights.tsx` — hexagon labels, activity items

---

## Feature 5: Dimension-Specific Filters on All Pages

### Design
A horizontal filter bar below the page title with 7 options: `ALL` + one per dimension. Styled as the AC Odyssey tab selection pattern — text-only, gold underline on active.

### Files to Change

**`client/src/components/dimension-filter.tsx`** (new component)

```typescript
interface DimensionFilterProps {
  value: LifeDimension | 'all';
  onChange: (dim: LifeDimension | 'all') => void;
}

export function DimensionFilter({ value, onChange }: DimensionFilterProps) {
  // Renders: ALL | Vitality | Psyche | Prowess | Wealth | Alliance | Legacy
  // Each item uses ody-filter-tab class
  // Active tab gets gold text + underline (same pattern as nav)
}
```

**`client/src/index.css`**

```css
.ody-filter-bar {
  display: flex;
  gap: 16px;
  padding: 8px 0 16px;
  border-bottom: 1px solid var(--border-soft);
  margin-bottom: 24px;
  overflow-x: auto;
}
.ody-filter-tab {
  font: 400 0.72rem/1 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  position: relative;
  white-space: nowrap;
  transition: color 240ms ease;
}
.ody-filter-tab:hover { color: var(--text-primary); }
.ody-filter-tab.active {
  color: var(--accent-gold);
}
.ody-filter-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--accent-gold), transparent);
}
```

**Pages to add the filter:**

1. **`client/src/pages/tasks.tsx`**:
   - Add `const [dimFilter, setDimFilter] = useState<LifeDimension | 'all'>('all')`
   - Render `<DimensionFilter value={dimFilter} onChange={setDimFilter} />` below page title
   - Filter `tasks` list: `tasks.filter(t => dimFilter === 'all' || t.category === dimFilter)`

2. **`client/src/pages/quests.tsx`**:
   - Same pattern — filter quest list by category

3. **`client/src/pages/journals.tsx`**:
   - Filter by `category_tags` — show entry if `category_tags` includes selected dimension (or `all`)

4. **`client/src/pages/insights.tsx`**:
   - Filter activity timeline items by category
   - Hexagon always shows all 6 (filter doesn't affect it)

---

## Feature 6: Journal UX Overhaul + Full-Screen Writing

### Current State
- Flat list of journal entries with 200-char content preview
- Create via slide-over modal with a small textarea
- No edit capability
- No timeline visual treatment

### Target State

#### 6A: Timeline List View
The journal list becomes a vertical timeline (matches style guide 7.7):

- Left vertical line with dot markers at each entry
- Each entry shows: date label (mono serif), title, content preview (3 lines), dimension tags
- Entries sorted newest-first
- Clicking an entry opens full-screen reader

#### 6B: Full-Screen Writer
A dedicated writing mode that takes over the entire viewport:

- No sidebar, no nav — just the writing surface (like check-in's full-screen layout)
- Top bar: "JOURNAL" title left, dimension tag selector center, close (X) right
- Writing area:
  - Optional title field (serif display font, large)
  - Content area: full-width, full-height textarea
  - Font: serif body font (`Cormorant Garamond` or `Spectral`) at `1.1rem` — distinct from app body font
  - Line height `1.8` for readability
  - Subtle ruled-line background (optional, via `repeating-linear-gradient`)
- Bottom bar: word count, auto-save indicator ("Saved" / "Saving...")
- Auto-save: debounced 2-second save after last keystroke

#### 6C: Full-Screen Reader
For viewing existing entries:

- Same full-screen layout as writer
- Content rendered as formatted text (not editable by default)
- "Edit" button in top bar switches to writer mode
- Scroll-style reading experience with serif font

### Files to Change

**`server/app/api/v1/journals_routes.py`**

1. **Add update endpoint**:
   ```python
   @router.patch("/journals/{journal_id}", response_model=JournalOut)
   async def update_journal(journal_id: str, body: JournalUpdateIn, ...):
       # Update title, content, tags, category_tags
   ```

2. **Add get-by-id endpoint** (if not already present):
   ```python
   @router.get("/journals/{journal_id}", response_model=JournalOut)
   async def get_journal(journal_id: str, ...):
   ```

**`server/app/modules/journals/application/schemas.py`**

3. **Add `JournalUpdateIn`** schema:
   ```python
   class JournalUpdateIn(BaseModel):
       title: str | None = None
       content: str | None = None
       tags: list[str] | None = None
       category_tags: list[str] | None = None
   ```

**`server/app/modules/journals/infra/repository.py`**

4. **Add `update()` method** to JournalRepository

**`client/src/app/auth.tsx`**

5. **Add API methods**:
   ```typescript
   updateJournal: (id: string, data: Partial<JournalCreatePayload>) => authedFetch(...)
   getJournal: (id: string) => authedFetch(...)
   ```

**`client/src/pages/journals.tsx`** — Major rewrite

6. **Timeline list view**:
   - Replace flat list with timeline component
   - Group entries by date
   - Each entry is a clickable timeline node
   - "New Entry" button opens full-screen writer

**`client/src/pages/journal-write.tsx`** (new page)

7. **Full-screen writer component**:
   - Route: `/journals/new` and `/journals/:id/edit`
   - Full-viewport layout, no AppShell
   - Title input (optional, serif display)
   - Content textarea (serif body, large)
   - Dimension tag toggles
   - Free-text tags input
   - Auto-save with debounce (2s)
   - Word count display
   - Save status indicator

**`client/src/pages/journal-read.tsx`** (new page)

8. **Full-screen reader component**:
   - Route: `/journals/:id`
   - Full-viewport layout, no AppShell
   - Renders content with serif font
   - Top bar: back, title, edit button, delete button
   - Dimension tags display

**`client/src/app/router.tsx`**

9. **Add routes**:
   ```typescript
   { path: '/journals/new', element: <JournalWrite /> }
   { path: '/journals/:id', element: <JournalRead /> }
   { path: '/journals/:id/edit', element: <JournalWrite /> }
   ```

**`client/src/index.css`**

10. **Journal-specific styles**:
    ```css
    .ody-journal-timeline { /* vertical line + dots */ }
    .ody-journal-entry-node { /* timeline node styling */ }
    .ody-journal-fullscreen {
      position: fixed; inset: 0;
      background: var(--bg-base);
      z-index: 100;
      display: flex; flex-direction: column;
    }
    .ody-journal-content {
      font: 400 1.1rem/1.8 'Cormorant Garamond', 'Georgia', serif;
      color: var(--text-primary);
      max-width: 680px;
      margin: 0 auto;
      padding: 32px 24px;
    }
    .ody-journal-title-input {
      font: 500 clamp(1.2rem, 2vw, 1.6rem)/1.3 var(--font-display);
      letter-spacing: 0.08em;
      /* transparent bg, no border, gold focus underline */
    }
    .ody-journal-save-status {
      font: 400 0.68rem/1 var(--font-mono);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    ```

---

## Feature 7: Per-Habit Heatmap

### Goal
Show a GitHub-style contribution heatmap for each individual recurring task, showing done/skip/miss per day.

### Backend Changes

**`server/app/api/v1/tasks_routes.py`**

1. **Add heatmap endpoint**:
   ```python
   @router.get("/api/v1/tasks/by-id/{task_id}/heatmap")
   async def task_heatmap(task_id: str, from_date: date, to_date: date, ...):
       """
       Returns a dict of date -> status for the task.
       status: 'done' | 'skipped' | 'not_due' | 'missed'
       """
       # 1. Get all TaskActivity records for task in date range
       # 2. For each date in range, determine:
       #    - Was task due? (call task_due_on)
       #    - If due: was there a 'done' or 'skipped' activity? -> done/skipped
       #    - If due but no activity and date is past: -> missed
       #    - If not due: -> not_due
       return {"dates": {"2026-03-01": "done", "2026-03-02": "missed", ...}}
   ```

**`server/app/modules/tasks/infra/repository.py`**

2. **Add `get_activities_in_range(task_id, from_date, to_date)` method**

**`client/src/app/auth.tsx`**

3. **Add API method**:
   ```typescript
   getTaskHeatmap: (taskId: string, from: string, to: string) =>
     authedFetch<{ dates: Record<string, string> }>(`/api/v1/tasks/by-id/${taskId}/heatmap?from_date=${from}&to_date=${to}`)
   ```

**`client/src/components/heatmap.tsx`** (new component)

4. **Heatmap component**:
   ```typescript
   interface HeatmapProps {
     dates: Record<string, 'done' | 'skipped' | 'missed' | 'not_due'>;
     months?: number; // default 3
   }
   ```
   - Grid of small squares (11x7 grid per month, like GitHub)
   - Color coding:
     - Done: `var(--state-success)` with opacity based on streak
     - Skipped: `var(--state-warning)` at 0.4 opacity
     - Missed: `var(--state-danger)` at 0.3 opacity
     - Not due: `var(--border-soft)` at 0.1 opacity
   - Month labels along top
   - Day labels (M, W, F) along left
   - Tooltip on hover showing date + status

**`client/src/pages/tasks.tsx`**

5. **Show heatmap in task detail/expanded view**:
   - When a task row is clicked/expanded, show the heatmap below it
   - Or in a slide-over detail panel
   - Only for recurring tasks (hide for one-time)

**`client/src/index.css`**

6. **Heatmap styles**:
   ```css
   .ody-heatmap { display: flex; gap: 2px; }
   .ody-heatmap-week { display: flex; flex-direction: column; gap: 2px; }
   .ody-heatmap-cell {
     width: 12px; height: 12px;
     border-radius: 2px;
   }
   .ody-heatmap-cell[data-status="done"] { background: var(--state-success); }
   .ody-heatmap-cell[data-status="skipped"] { background: var(--state-warning); opacity: 0.5; }
   .ody-heatmap-cell[data-status="missed"] { background: var(--state-danger); opacity: 0.4; }
   .ody-heatmap-cell[data-status="not_due"] { background: var(--border-soft); }
   ```

---

## Feature 8: Archived Habit Search + Revive

### Goal
Users can search through archived tasks and revive (re-activate) them instead of creating duplicates.

### Backend Changes

**`server/app/api/v1/tasks_routes.py`**

1. **Add query params to list endpoint**:
   ```python
   @router.get("/api/v1/tasks")
   async def list_tasks(
       status: TaskStatus | None = None,  # filter by status
       search: str | None = None,          # search title/description
       category: LifeDimension | None = None,  # filter by dimension
       ...
   ):
   ```

2. **Add revive endpoint**:
   ```python
   @router.post("/api/v1/tasks/by-id/{task_id}/revive")
   async def revive_task(task_id: str, ...):
       """Set archived/completed task back to active status."""
       task.status = TaskStatus.active
       # Optionally reset schedule_config dates
   ```

**`server/app/modules/tasks/infra/repository.py`**

3. **Update `list_tasks()` to accept filters**: status, search (ILIKE on title), category

**`client/src/app/auth.tsx`**

4. **Update API methods**:
   ```typescript
   listTasks: (params?: { status?: string; search?: string; category?: string }) => ...
   reviveTask: (taskId: string) => authedFetch(`/api/v1/tasks/by-id/${taskId}/revive`, { method: 'POST' })
   ```

**`client/src/pages/tasks.tsx`**

5. **Add "Archived" tab/section**:
   - Toggle between "Active" and "Archived" views
   - Archived view shows search bar
   - Each archived task shows: title, category, original schedule
   - "Revive" button on each archived task — calls revive API, moves to active list
   - Styled as a secondary tab using the filter bar pattern

---

## Feature 9: Help Section — Dimensions Guide + Example Todos

### Goal
A dedicated help/guide section accessible from Settings sidebar nav, explaining each life dimension with example tasks users can adopt.

### Data Structure

**`client/src/lib/dimensions.ts`** — extend the existing DIMENSIONS constant:

```typescript
export const DIMENSIONS = {
  vitality: {
    label: 'Vitality',
    description: 'Physical health, sleep, nutrition, fitness, environment',
    cssVar: '--cat-body',
    philosophy: 'Your body is the vessel. Without vitality, nothing else can flourish.',
    exampleRecurring: [
      'Morning workout (30 min)',
      'Sleep by 11pm',
      'Drink 3L water',
      'Walk 8000 steps',
      'No screens after 10pm',
      'Meal prep Sunday',
      'Stretch/yoga 15 min',
    ],
    exampleOneTime: [
      'Get blood work done',
      'Buy a standing desk',
      'Schedule dentist appointment',
      'Set up sleep tracking',
    ],
    exampleQuests: [
      'Run a 5K under 30 minutes',
      'Lose 5kg in 3 months',
      'Complete a 30-day yoga challenge',
    ],
  },
  // ... same structure for psyche, prowess, wealth, alliance, legacy
}
```

### Files to Change

**`client/src/pages/help.tsx`** (new page)

1. **Help page layout**:
   - Page title: "LIFE DIMENSIONS"
   - For each dimension, an expandable/accordion section:
     - Header: dimension dot + label + short description
     - Expanded content:
       - Philosophy quote (italic, serif)
       - "Example Habits" list — clickable items that pre-fill task creation
       - "Example Goals" list — clickable items that pre-fill quest creation
   - At the bottom: link to settings, link to support

2. **"Use this" action** on each example:
   - Clicking an example task opens the task creation slide-over with pre-filled title + category
   - Navigate to `/tasks?prefill=true&title=...&category=...&type=recurring`
   - Or use a shared state/context to pass prefill data

**`client/src/app/router.tsx`**

3. **Add route**: `{ path: '/help', element: <Help /> }`

**`client/src/components/layout.tsx`**

4. **Add nav item**: Add "Guide" or "Help" to the sidebar nav between Insights and Settings
   - Icon: use a new help/book-open icon or repurpose the existing scroll icon

**`client/src/index.css`**

5. **Accordion/expandable styles**:
   ```css
   .ody-accordion-header {
     display: flex; align-items: center; gap: 12px;
     padding: 12px 0;
     cursor: pointer;
     border-bottom: 1px solid var(--border-soft);
   }
   .ody-accordion-body {
     padding: 16px 0 24px 18px;
     /* collapse/expand with max-height transition */
   }
   .ody-example-item {
     padding: 6px 0;
     color: var(--text-secondary);
     cursor: pointer;
     transition: color 240ms;
   }
   .ody-example-item:hover {
     color: var(--accent-gold);
   }
   ```

---

## Feature 11: Today's Win (PRD 9.5)

### Goal
After completing all check-in cards, show an optional "Today's Win" text field. Wins are saved and visible in the activity timeline and journal.

### Backend Changes

**`server/app/shared/db/models.py`**

1. **Add `DailyWin` model**:
   ```python
   class DailyWin(Base):
       __tablename__ = "daily_wins"
       id = Column(String(36), primary_key=True, default=uuid4_str)
       user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
       for_date = Column(Date, nullable=False, index=True)
       content = Column(Text, nullable=False)
       created_at = Column(DateTime(timezone=True), server_default=func.now())
       __table_args__ = (UniqueConstraint("user_id", "for_date"),)
   ```

**`server/alembic/versions/0003_daily_wins.py`** (new migration)

2. **Create `daily_wins` table**

**`server/app/api/v1/tasks_routes.py`** (or new `wins_routes.py`)

3. **Add endpoints**:
   ```python
   @router.post("/api/v1/wins")
   async def save_win(body: WinIn, ...):
       # Upsert daily win for the date

   @router.get("/api/v1/wins")
   async def list_wins(from_date: date, to_date: date, ...):
       # Return wins in date range
   ```

**`client/src/pages/checkin.tsx`**

4. **Add "Today's Win" to completion screen**:
   - After the "All Done" message, show:
     ```
     What's one win from today? (even tiny)
     [textarea, 2 rows]
     [Save Win]
     ```
   - Textarea is optional — user can dismiss/close without saving
   - On save: POST to `/api/v1/wins`
   - After save: show saved confirmation, then normal completion actions

5. **Styling**: textarea with serif font (matches journal aesthetic), gold border on focus, minimal chrome

**`client/src/app/auth.tsx`**

6. **Add API methods**:
   ```typescript
   saveWin: (date: string, content: string) => authedFetch('/api/v1/wins', { method: 'POST', body: { for_date: date, content } })
   listWins: (from: string, to: string) => authedFetch(`/api/v1/wins?from_date=${from}&to_date=${to}`)
   ```

**`client/src/pages/insights.tsx`**

7. **Show recent wins** in the insights page — a small "Recent Wins" section showing last 7 wins

---

## Feature 14: Quick Catch-Up Flow (PRD 9.12)

### Goal
When a user returns after missing 2+ days, show a compact catch-up screen before the normal check-in.

### Backend Changes

**`server/app/api/v1/tasks_routes.py`**

1. **Add missed-days endpoint**:
   ```python
   @router.get("/api/v1/tasks/missed-days")
   async def get_missed_days(user = Depends(current_user), db = Depends(get_db)):
       """
       Returns a list of recent dates (up to 7) where the user had due tasks
       but no completed check-in (checkin_days.completed = False or no row).
       """
       # 1. Find the last completed checkin_day
       # 2. For each day between that and yesterday:
       #    - Were there due tasks? (call list_due_tasks)
       #    - Was there a checkin_day with completed=True?
       #    - If due tasks existed but no completed checkin: it's a missed day
       # 3. Return list of { date, tasks: [{ task_id, title, category }] }
       # Cap at 7 most recent missed days
   ```

**`client/src/app/auth.tsx`**

2. **Add API method**:
   ```typescript
   getMissedDays: () => authedFetch<MissedDay[]>('/api/v1/tasks/missed-days')
   ```

**`client/src/app/types.ts`**

3. **Add types**:
   ```typescript
   interface MissedDay {
     date: string;
     tasks: { task_id: string; title: string; category: LifeDimension }[];
   }
   ```

**`client/src/pages/checkin.tsx`**

4. **Add catch-up detection**:
   - On page load, before showing normal check-in cards, call `getMissedDays()`
   - If 2+ missed days returned, show catch-up screen instead of normal flow

5. **Catch-up screen UI**:
   ```
   WELCOME BACK
   ═══════════════════
   You missed 3 days. Want to quickly log them?

   ┌─ March 12 ──────────────────────────┐
   │  ☐ Workout          ☐ Read 30 min   │
   │  ☐ Meditate         ☐ Budget review  │
   │           [Mark All Done] [Skip All] │
   └─────────────────────────────────────┘

   ┌─ March 13 ──────────────────────────┐
   │  ☐ Workout          ☐ Read 30 min   │
   │           [Mark All Done] [Skip All] │
   └─────────────────────────────────────┘

   [Start Fresh Today]  ← skips catch-up entirely
   ```

6. **Catch-up actions**:
   - Per-task checkboxes (done) — unchecked = skipped
   - "Mark All Done" per day — marks all tasks as done
   - "Skip All" per day — marks all tasks as skipped
   - "Start Fresh Today" — dismisses catch-up, goes to normal check-in
   - Each action calls `respondDaily(taskId, response, missedDate)` for the missed date
   - After all missed days handled, `refreshCheckinDay` for each date, then proceed to today's check-in

7. **Non-shaming copy**:
   - "Welcome back" not "You missed X days"
   - "Life happens. Let's catch up." subtitle
   - No red indicators or guilt language

**`client/src/index.css`**

8. **Catch-up styles**:
   ```css
   .ody-catchup-day {
     border: 1px solid var(--border-soft);
     padding: 16px;
     margin-bottom: 16px;
   }
   .ody-catchup-date {
     font: 500 0.82rem/1 var(--font-display);
     letter-spacing: 0.12em;
     text-transform: uppercase;
     color: var(--text-secondary);
     margin-bottom: 12px;
   }
   .ody-catchup-tasks {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
     gap: 8px;
   }
   .ody-catchup-task {
     display: flex; align-items: center; gap: 8px;
     padding: 6px 0;
     color: var(--text-secondary);
   }
   ```

---

## Implementation Order

### Phase A: Foundation (do first — other features depend on these)

1. **Feature 3** — DB dimension enums + shared `dimensions.ts` constants
2. **Feature 4** — Styled category labels using the new constants
3. **Feature 1 + 2** — Recurring task scheduling UI + day-wise bug fix

### Phase B: Core UX (can be parallelized)

4. **Feature 5** — Dimension filters on all pages
5. **Feature 6** — Journal overhaul (biggest single feature)
6. **Feature 8** — Archived habit search + revive

### Phase C: Enhancements (independent features)

7. **Feature 7** — Per-habit heatmap
8. **Feature 9** — Help section
9. **Feature 11** — Today's Win
10. **Feature 14** — Quick Catch-Up Flow

### Estimated New/Modified Files

| File | Action | Features |
|------|--------|----------|
| `server/app/shared/db/models.py` | Modify | 3, 11 |
| `server/alembic/versions/0002_*.py` | New | 3 |
| `server/alembic/versions/0003_*.py` | New | 11 |
| `server/app/modules/tasks/domain/services.py` | Modify | 2 |
| `server/app/modules/tasks/application/schemas.py` | Modify | 3, 8 |
| `server/app/api/v1/tasks_routes.py` | Modify | 7, 8, 14 |
| `server/app/api/v1/journals_routes.py` | Modify | 6 |
| `server/app/api/v1/wins_routes.py` | New | 11 |
| `server/app/modules/tasks/infra/repository.py` | Modify | 7, 8 |
| `server/app/modules/journals/infra/repository.py` | Modify | 6 |
| `client/src/lib/dimensions.ts` | New | 3, 4, 5, 9 |
| `client/src/components/dimension-filter.tsx` | New | 5 |
| `client/src/components/heatmap.tsx` | New | 7 |
| `client/src/pages/tasks.tsx` | Modify | 1, 3, 4, 5, 7, 8 |
| `client/src/pages/journals.tsx` | Modify | 3, 4, 5, 6 |
| `client/src/pages/journal-write.tsx` | New | 6 |
| `client/src/pages/journal-read.tsx` | New | 6 |
| `client/src/pages/checkin.tsx` | Modify | 4, 11, 14 |
| `client/src/pages/insights.tsx` | Modify | 4, 5, 11 |
| `client/src/pages/quests.tsx` | Modify | 3, 4, 5 |
| `client/src/pages/help.tsx` | New | 9 |
| `client/src/pages/settings.tsx` | Modify | 9 (link to help) |
| `client/src/app/types.ts` | Modify | 3, 14 |
| `client/src/app/auth.tsx` | Modify | 6, 7, 8, 11, 14 |
| `client/src/app/router.tsx` | Modify | 6, 9 |
| `client/src/components/layout.tsx` | Modify | 9 (nav item) |
| `client/src/index.css` | Modify | 1, 4, 5, 6, 7, 8, 9, 14 |
