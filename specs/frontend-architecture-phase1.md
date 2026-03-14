# Odyssey Frontend Architecture (Phase 1)

**Version:** 1.0  
**Date:** March 14, 2026  
**Scope:** Web frontend for Stage 1 backend (`identity`, `tasks`, `quests`, `journals`, `insights`)

## 1. Objectives

- Deliver a production-grade frontend architecture that can scale beyond MVP without rewrites.
- Keep Phase 1 implementation speed high while preserving clean boundaries.
- Standardize components, data fetching, API access, validation, and error handling.
- Align strictly with existing backend contracts in `server/app/api/v1`.

## 2. Phase 1 Product Scope (Frontend)

Pages and flows required now:

- Authentication: register, login, token refresh, logout, protected routes
- Onboarding: intro + first task creation
- Daily Check-In: fetch daily items, respond done/skipped/value
- Tasks: list/create/edit/delete recurring and one-time tasks
- Quests: list/create/update/delete + add/list activity updates
- Journals: create/list/delete + search
- Insights Overview: streak + summary counters + activity snapshot panels

### 2.1 Phase 1 Sitemap

```txt
/
  /login
  /register
  /onboarding
  /app (protected shell)
    /check-in
    /tasks
      /tasks/new (modal/route)
      /tasks/:taskId/edit (modal/route)
    /quests
      /quests/new (modal/route)
      /quests/:questId/activity
    /journals
      /journals/new (modal/route)
      /journals?search=:query
    /insights
    /settings
```

Navigation model:

- Public routes: `login`, `register`
- Conditional route: `onboarding` (only when first-time user state is incomplete)
- Protected app shell routes: `check-in`, `tasks`, `quests`, `journals`, `insights`, `settings`

### 2.2 Low-Fidelity Wireframes (Text)

#### Auth: Login/Register

```txt
+---------------------------------------------------+
| Odyssey logo                                     |
| Welcome back                                     |
| [ Email ______________________________ ]         |
| [ Password ___________________________ ]         |
| [ Sign In ]                                      |
| ---- or ----                                     |
| New here? [Create account]                       |
+---------------------------------------------------+
```

#### App Shell

```txt
+------------------+--------------------------------+
| Nav              | Topbar: streak, quick actions  |
| - Check-In       |--------------------------------|
| - Tasks          | Route content area             |
| - Quests         | (list/cards/forms/charts)      |
| - Journals       |                                |
| - Insights       |                                |
| - Settings       |                                |
+------------------+--------------------------------+
```

#### Daily Check-In

```txt
+---------------------------------------------------+
| Today's Check-In  (3 cards left)   [Progress 2/5]|
|---------------------------------------------------|
| Category: Body & Vitality                         |
| Task: 30 min walk                                 |
|                                                   |
| [Done]   [Skip]                                   |
|                                                   |
| Optional input (if value task): [_____ ] [Save]  |
+---------------------------------------------------+
| After final card: "You are done for today"        |
| streak + summary + next action                    |
+---------------------------------------------------+
```

#### Tasks

```txt
+---------------------------------------------------+
| Tasks                            [+ New Task]     |
| Filters: [Category] [Type] [Status] [Search]     |
|---------------------------------------------------|
| Task row/card                                      |
| - title, category, schedule/due, status            |
| - actions: edit / archive / delete                 |
+---------------------------------------------------+
```

#### Quests

```txt
+---------------------------------------------------+
| Quests                           [+ New Quest]    |
|---------------------------------------------------|
| Quest card: title, category, progress %, status   |
| [View Activity] [Add Update] [Edit]               |
|---------------------------------------------------|
| Activity timeline (selected quest)                |
| - date | activity_type | note/milestone/progress  |
+---------------------------------------------------+
```

#### Journals

```txt
+---------------------------------------------------+
| Journals                         [+ New Entry]    |
| [Search across entries_______________________]    |
|---------------------------------------------------|
| Entry card: title/date/tags                        |
| Preview lines                                      |
| [Delete]                                           |
+---------------------------------------------------+
```

#### Insights

```txt
+---------------------------------------------------+
| Insights Overview                                  |
| Streak: XX days     Window: [last 30 days]         |
|---------------------------------------------------|
| Tasks: Active | Done | Skipped                     |
| Quests: Active | Updates                           |
| Journals: Entries                                  |
|---------------------------------------------------|
| Quick actions + link to Check-In / Add Task        |
+---------------------------------------------------+
```

### 2.3 Phase 1 User Stories

#### Authentication

- As a new user, I can register with email/password/timezone so that I can access protected features.
  - Acceptance criteria: successful register returns access + refresh token and redirects to onboarding.
- As a returning user, I can login and stay authenticated across refreshes.
  - Acceptance criteria: valid credentials create session; invalid credentials show inline error.
- As an authenticated user, I can be redirected away from public pages and into app shell.
  - Acceptance criteria: opening `/login` while authenticated routes to `/check-in`.

#### Onboarding

- As a first-time user, I can complete a short onboarding to understand 6 dimensions and create my first task.
  - Acceptance criteria: onboarding completion flag is persisted and user lands on check-in/tasks.

#### Daily Check-In

- As a user, I can see only tasks due for a selected day.
  - Acceptance criteria: page calls `GET /api/v1/tasks/daily-items?day=YYYY-MM-DD` and renders returned cards.
- As a user, I can mark a daily card done or skipped.
  - Acceptance criteria: `POST /api/v1/tasks/by-id/{task_id}/respond` succeeds and card state updates immediately.
- As a user, I can complete all cards and see completion summary.
  - Acceptance criteria: once pending reaches 0, completion state with streak context is shown.

#### Tasks

- As a user, I can create recurring and one-time tasks with valid scheduling/due fields.
  - Acceptance criteria: form validation prevents invalid combinations; created task appears in task list.
- As a user, I can edit existing task properties.
  - Acceptance criteria: patch success updates list and dependent views.
- As a user, I can delete tasks I no longer need.
  - Acceptance criteria: delete removes task from list and daily check-in result set.

#### Quests

- As a user, I can create and manage quests separately from daily check-in.
  - Acceptance criteria: quest CRUD operations reflect in quests list without full reload.
- As a user, I can add progress activities to a quest and view historical updates.
  - Acceptance criteria: posting activity appends timeline row and updates quest summary as needed.

#### Journals

- As a user, I can create journal entries with optional tags/category tags.
  - Acceptance criteria: created entry appears in journal list.
- As a user, I can search journals by text.
  - Acceptance criteria: search query updates list via `GET /api/v1/journals?search=...`.
- As a user, I can delete entries.
  - Acceptance criteria: deleted entry is removed from list and no longer returned by search.

#### Insights

- As a user, I can view my high-level metrics for a date window.
  - Acceptance criteria: page calls `GET /api/v1/insights/overview` and shows streak/tasks/quests/journals sections.
- As a user, I can change the date window and refresh insights.
  - Acceptance criteria: new query params refetch data and update all summary blocks consistently.

Out of scope for Phase 1:

- AI mentor
- advanced gamification
- offline-first sync conflict engine
- multi-tenant/team features

## 3. Recommended Tech Stack (Industry Standard)

- Framework: React 19 + TypeScript + Vite
- Routing: React Router v7 (data APIs + protected layouts)
- Server state: TanStack Query v5
- Client state: minimal local store only for UI state (Zustand optional, not mandatory day 1)
- Forms: React Hook Form + Zod
- Styling: Tailwind CSS + CSS variables (design tokens)
- Component primitives: Radix UI
- Component library approach: `shadcn/ui` style internal library (owned in-repo)
- Tables/lists: TanStack Table (for tasks/journals/quests listing scalability)
- Charts: Recharts (radar/hex substitute + trend bars in Insights)
- Date handling: `date-fns` + `date-fns-tz`
- HTTP transport: `fetch` wrapper with typed client layer
- API typing: OpenAPI-driven type generation (`openapi-typescript`) as default path
- Testing: Vitest + React Testing Library + MSW + Playwright (critical flows)
- Quality gates: ESLint + TypeScript strict mode + Prettier + Husky/lint-staged

Why Vite over Next.js for Phase 1:

- Product is mostly authenticated app UI with minimal SEO dependency.
- Faster setup and lower operational complexity now.
- Can migrate to SSR later for marketing/public surfaces without rewriting feature modules.

## 4. High-Level Frontend Architecture

Architecture style: modular frontend with simple feature boundaries.

Practical layers:

1. `app`: bootstrap, providers, router, global styles
2. `pages`: route-level composition only
3. `components`: shared UI library + reusable domain display components
4. `features`: user actions and API-driven flows
5. `lib`: API client, query setup, validation, utility helpers, types

Dependency rule:

- `pages` compose `features` and `components`.
- `features` can use `components` and `lib`.
- `components` can use `lib` utilities, but cannot call endpoints directly.
- `lib` is foundational and must not import from `pages/components/features`.

## 5. Proposed Folder Structure

```txt
frontend/
  src/
    app/
      providers/
        query-provider.tsx
        auth-provider.tsx
        theme-provider.tsx
      router.tsx
      protected-route.tsx
      styles.css
      tokens.css
      main.tsx

    pages/
      LoginPage.tsx
      RegisterPage.tsx
      OnboardingPage.tsx
      CheckinPage.tsx
      TasksPage.tsx
      QuestsPage.tsx
      JournalsPage.tsx
      InsightsPage.tsx
      SettingsPage.tsx

    components/
      ui/
        button.tsx
        input.tsx
        select.tsx
        modal.tsx
        card.tsx
        badge.tsx
        textarea.tsx
        form-field.tsx
        empty-state.tsx
        loading-state.tsx
        error-state.tsx
      layout/
        app-shell.tsx
        sidebar.tsx
        topbar.tsx
        page-header.tsx
      checkin/
        checkin-card.tsx
        checkin-progress.tsx
      tasks/
        task-list.tsx
        task-form.tsx
      quests/
        quest-list.tsx
        quest-form.tsx
        quest-activity-timeline.tsx
      journals/
        journal-list.tsx
        journal-form.tsx
      insights/
        insights-summary-cards.tsx

    features/
      auth/
        use-login.ts
        use-register.ts
        use-logout.ts
      tasks/
        use-create-task.ts
        use-update-task.ts
        use-delete-task.ts
        use-respond-daily-item.ts
      quests/
        use-create-quest.ts
        use-update-quest.ts
        use-add-quest-activity.ts
      journals/
        use-create-journal.ts
        use-search-journals.ts
      insights/
        use-insights-overview.ts

    lib/
      api/
        client.ts
        auth-token-store.ts
        refresh-controller.ts
        auth.ts
        tasks.ts
        quests.ts
        journals.ts
        insights.ts
      query/
        query-client.ts
        query-keys.ts
        invalidation.ts
      validation/
      date/
      error/
      mappers/
      constants/
      hooks/
      types/
        api.generated.ts
        domain.ts

    store/
      ui-store.ts
```

## 6. Component Standardization and Library Strategy

Use a strong in-repo component library with 3 tiers:

1. `components/ui`: design-system primitives and controls (`Button`, `Input`, `Select`, `Modal`, `Card`, `Badge`, `FormField`)
2. `components/layout`: shell and layout scaffolds (`AppShell`, `Sidebar`, `Topbar`, `PageHeader`)
3. `components/<domain>`: reusable domain display components (`CheckinCard`, `TaskList`, `QuestActivityTimeline`)

Standards:

- All reusable components accept `className` and support `data-testid`.
- Tokens only, no hardcoded color values in feature components.
- Accessibility first: keyboard nav, focus-visible, aria labels, semantic HTML.
- Component states must be explicit: `loading`, `empty`, `error`, `ready`.
- Pages should have minimal CSS. Most styling must live inside shared components.
- One-off page styles are allowed only for route-specific spacing wrappers and must use tokens.
- No direct ad-hoc styling in page files for common controls, cards, forms, or tables.

Layout system rules (professional consistency):

- Use CSS Grid for page-level structure.
- `AppShell` uses two-column grid on desktop (`sidebar + content`) and one-column on mobile.
- Standard content container with max width and token-based horizontal padding.
- Use Flexbox inside components for alignment and micro-layout.
- tasks/quests/journals use one canonical list pattern with consistent row spacing, header/action zones, and metadata lines.
- Breakpoints and gaps are token-driven (`sm/md/lg/xl`), not arbitrary pixel values.

Design token baseline:

- Color tokens: semantic (`--color-bg`, `--color-text-primary`, `--color-success`)
- Spacing scale: 4/8px system
- Radius scale: sm/md/lg
- Typography scale and line heights defined once in `tokens.css`
- Shadow, border, and z-index scales also tokenized for consistent elevation.

## 7. Data and Query Handling (TanStack Query)

Core rules:

- Server state belongs in TanStack Query.
- Local store is optional and only for ephemeral UI state (sidebar open, active modal, temporary filters).
- Avoid store usage for API data that already exists in Query cache.
- Query keys are centralized (factory pattern) in `lib/query/query-keys.ts`.
- Mutations own invalidation logic near the mutation hook.
- Use optimistic updates only when rollback is trivial.

Query key examples:

- `auth.me()` -> `['auth', 'me']`
- `tasks.list(filters)` -> `['tasks', 'list', filters]`
- `tasks.dailyItems(date)` -> `['tasks', 'daily-items', date]`
- `quests.activity(questId)` -> `['quests', questId, 'activity']`
- `journals.list(search)` -> `['journals', 'list', { search }]`
- `insights.overview(from, to)` -> `['insights', 'overview', { from, to }]`

Caching defaults (Phase 1):

- `staleTime`: 30-60s for dashboard/check-in data
- `gcTime`: 10m
- retry: 1 for read queries, 0 for writes
- refetch on window focus: enabled for check-in and insights only

Mutation invalidation policy:

- Task create/update/delete -> invalidate `tasks.list`, `tasks.daily-items`, `insights.overview`
- Task respond -> invalidate `tasks.daily-items`, `insights.overview`
- Quest activity/update -> invalidate `quests.list`, `quests.activity`, `insights.overview`
- Journal create/delete -> invalidate `journals.list`, `insights.overview`

## 8. API Client Architecture

Pattern: thin typed endpoint modules over one shared `httpClient`.

`httpClient` responsibilities:

- attach `Authorization: Bearer <access_token>`
- inject correlation/request ID header (e.g. `x-request-id`)
- normalize errors into one shape:
  - `status`
  - `code`
  - `message`
  - `details`
- parse JSON safely
- auto-refresh once on 401, then replay original request

Token refresh control:

- single-flight refresh queue (avoid multiple concurrent refresh calls)
- if refresh fails -> clear session + redirect to `/login`
- store access token in memory + refresh token in secure storage strategy

Storage recommendation (Phase 1 practical):

- If backend remains bearer-token response only: keep refresh token in `localStorage` with strict CSP and short TTL.
- Preferred hardening path: move refresh token to HttpOnly secure cookie in backend Phase 1.1.

Endpoint module example shape:

- `auth.api.ts`: `register`, `login`, `refresh`, `me`
- `tasks.api.ts`: `createTask`, `listTasks`, `getTask`, `updateTask`, `deleteTask`, `getDailyItems`, `respondTask`
- `quests.api.ts`: `listQuests`, `createQuest`, `updateQuest`, `deleteQuest`, `addQuestActivity`, `listQuestActivity`
- `journals.api.ts`: `listJournals`, `createJournal`, `deleteJournal`
- `insights.api.ts`: `getOverview`

## 9. Frontend Domain Models and Validation

- Keep backend DTOs at API boundary.
- Map DTO -> UI model in `lib/mappers/*`.
- Zod schemas validate forms and normalize payload before request.

Examples:

- Task form schema enforces scheduling combinations based on `task_type`.
- Quest activity form validates `activity_type` + payload shape.
- Journal schema enforces non-empty content and normalized tags.

## 10. Route and Page Composition

Recommended route map:

- `/login`
- `/register`
- `/onboarding`
- `/check-in`
- `/tasks`
- `/quests`
- `/journals`
- `/insights`
- `/settings`

Protected shell layout:

- left navigation (desktop) / bottom nav (mobile)
- top bar with streak chip + quick actions
- content area with route-level suspense + error boundary

## 11. Error Handling, Reliability, and UX Standards

- Global error boundary for render/runtime failures.
- Query-level fallback UI for API failures.
- Standard empty states for each list page.
- Non-blocking toasts for successful writes.
- Idempotent submit button pattern (`isPending` + disabled + dedupe).
- Handle 409 conflicts and 422 validation responses with field-level mapping.

## 12. Performance and Observability

Performance targets (Phase 1):

- Initial route interactive under 2.5s on mid-tier mobile network
- Daily check-in interactions under 150ms perceived latency after first load

Tactics:

- Route-based code splitting
- prefetch next likely route (`/check-in` <-> `/insights`)
- memoize heavy list items
- virtualize long journal lists

Observability:

- Frontend logger with env-aware verbosity
- Sentry for runtime errors (Phase 1.1 if not day-1)
- basic web vitals capture

## 13. Testing Strategy

- Unit: utility functions, mappers, validation schemas
- Component: state rendering for loading/error/empty/ready
- Integration: mutation + invalidation flows with MSW
- E2E (Playwright):
  - auth login/logout
  - complete daily check-in
  - create/edit/delete task
  - quest progress update
  - journal create + search

## 14. Security Baseline

- Strict CSP, no inline script in production.
- Escape and sanitize user-generated rich text output.
- Avoid storing sensitive PII outside backend.
- Token rotation supported via refresh endpoint.
- Auto-logout on refresh expiry or repeated 401.

## 15. Implementation Plan (Phase 1)

Sprint order:

1. App shell + auth foundation + API client + query client
2. Tasks + daily check-in (highest product value)
3. Quests + activity timeline
4. Journals + search
5. Insights overview + hardening + test coverage

Definition of Done per feature:

- typed API integration complete
- loading/error/empty states implemented
- happy + error path tests present
- query invalidation rules verified
- accessibility checks passed for keyboard + labels

## 16. Brainstorming Decisions to Finalize

1. Framework direction
- Option A: Vite SPA now (faster Phase 1)
- Option B: Next.js App Router now (SSR-ready, more setup)

2. Token strategy
- Option A: localStorage refresh token (fast implementation)
- Option B: HttpOnly cookie refresh token (recommended hardening)

3. OpenAPI typing
- Option A: generate types from `/openapi.json` in CI (recommended)
- Option B: hand-maintained TS interfaces (faster first day, drift risk)

4. Check-in UX model
- Option A: one-card-at-a-time flow (matches PRD directly)
- Option B: compact checklist with quick actions (faster power-user interaction)

5. Insights visualization depth in Phase 1
- Option A: simple summary cards + streak + basic category bars
- Option B: full radar/hex + timeline filters from day 1

## 17. Suggested Default Choices

For fastest reliable Phase 1 with strong foundations:

- Vite SPA
- TanStack Query + strict query key factory
- Internal design system (Radix + Tailwind + tokenized components)
- Typed API generated from OpenAPI
- HttpOnly refresh token hardening as immediate Phase 1.1 backend task
- One-card-at-a-time check-in first, power view later
