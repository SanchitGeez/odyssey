# Odyssey Backend Architecture (Stage 1)

This document reflects the simplified Phase 1 architecture:

- `tasks` module: one-time + recurring tasks
- `quests` module: single standard project model (no project types in V1)
- `journals` module
- `insights` module (query-driven analytics, no snapshot table in V1)

Core principle: keep source-of-truth tables small and stable, and track behavior through activity logs.

## 1. Architecture Style

- Modular monolith (single deployable backend)
- Clear module boundaries and layered internals
- Query-driven insights from transactional + activity tables
- No premature precomputed analytics/snapshot pipelines

Recommended stack:

- FastAPI + Pydantic v2
- PostgreSQL + SQLAlchemy 2 + Alembic
- Redis for short-lived cache and request throttling

## 2. Module Responsibilities

## `identity` (supporting)
- Signup/login/refresh/logout
- Password hashing and session/token lifecycle
- User auth context for protected APIs

## `tasks` (core)
- CRUD for one-time and recurring tasks
- Scheduling metadata and due-window metadata
- Daily response handling (`done` / `skipped` / optional value input)
- Progress/state changes via activity events
- Streak/check-in completion calculation through smart queries

## `quests` (core)
- CRUD for quests (single project model for V1)
- Optional milestone/checkpoint style updates
- Progress updates and status transitions via activity events
- Timeline of all quest actions

## `journals` (core)
- Journal CRUD
- Optional tags/categories
- Full-text search

## `insights` (read layer)
- Query-only analytics across tasks/quests/journals
- No `insight_snapshots` table in V1
- No generic `activity_events` table in V1
- Uses task and quest activity tables directly

## `shared`
- Config, logging, tracing, errors
- DB session/UoW and migrations
- Pagination, idempotency utilities, UTC time helpers

## 3. Scalable Folder Structure

```txt
server/
  app/
    main.py

    api/
      v1/
        identity_routes.py
        tasks_routes.py
        quests_routes.py
        journals_routes.py
        insights_routes.py
      deps.py
      error_handlers.py

    modules/
      identity/
        domain/
        application/
        infrastructure/
        presentation/

      tasks/
        domain/
          entities.py
          value_objects.py
          repositories.py
          services.py
        application/
          commands.py
          queries.py
          handlers.py
          dto.py
        infrastructure/
          orm_models.py
          repository_impl.py
        presentation/
          schemas.py
          mapper.py

      quests/
        domain/
          entities.py
          value_objects.py
          repositories.py
          services.py
        application/
          commands.py
          queries.py
          handlers.py
          dto.py
        infrastructure/
          orm_models.py
          repository_impl.py
        presentation/
          schemas.py
          mapper.py

      journals/
        domain/
        application/
        infrastructure/
        presentation/

      insights/
        domain/
        application/
        infrastructure/
        presentation/

    shared/
      core/
        config.py
        constants.py
      db/
        base.py
        session.py
        uow.py
        migrations/
      observability/
        logging.py
        tracing.py
        metrics.py
      security/
        jwt.py
        password.py
        permissions.py
      caching/
        redis_client.py
      web/
        middleware.py
        exceptions.py
      utils/
        time.py
        idempotency.py
        pagination.py

    tests/
      unit/
      integration/
      contract/
      e2e/
```

## 4. LLD + OOP Rules (Practical)

1. Entities hold invariants.
- `Task`, `Quest`, `JournalEntry` expose intent methods (`mark_done`, `archive`, `change_state`, etc).

2. Value objects for rule-heavy fields.
- `TaskSchedule`, `DueWindow`, `QuestState`.

3. Repositories are domain interfaces.
- SQLAlchemy implementation remains in infrastructure.

4. One handler per use-case.
- `CreateTaskHandler`, `RespondTaskDailyItemHandler`, `CreateQuestHandler`, `AddQuestActivityHandler`.

5. Routes/controllers stay thin.
- validate input -> call handler -> map response.

## 5. Phase 1 Data Schemas

Enums:

- `task_type`: `one_time`, `recurring`
- `task_status`: `active`, `completed`, `archived`
- `quest_status`: `active`, `paused`, `completed`, `archived`
- `task_activity_type`:
  - `done`
  - `skipped`
  - `value_logged`
  - `status_changed`
  - `deadline_extended`
  - `note_added`
- `quest_activity_type`:
  - `progress_updated`
  - `status_changed`
  - `milestone_added`
  - `milestone_completed`
  - `note_added`

## `users`
- `id` (uuid, pk)
- `email` (varchar, unique, not null)
- `password_hash` (varchar, not null)
- `timezone` (varchar, not null, default `Asia/Kolkata`)
- `created_at`, `updated_at` (timestamptz)

Indexes:

- unique index on `email`

## `refresh_tokens`
- `id` (uuid, pk)
- `user_id` (uuid, fk -> users.id, not null)
- `token_hash` (varchar, not null)
- `expires_at` (timestamptz, not null)
- `revoked_at` (timestamptz, nullable)
- `created_at` (timestamptz, not null)

Indexes:

- index on `(user_id, expires_at)`

## `tasks`
- `id` (uuid, pk)
- `user_id` (uuid, fk -> users.id, not null)
- `title` (varchar, not null)
- `description` (text, nullable)
- `category` (varchar, not null)
- `task_type` (enum task_type, not null)
- `status` (enum task_status, not null, default `active`)
- `schedule_type` (varchar, nullable)      # daily/specific_days/x_per_week/once_per_week
- `schedule_config` (jsonb, nullable)      # e.g. days_of_week, target_count
- `due_window_type` (varchar, nullable)    # date/week/month/none
- `due_date` (date, nullable)
- `window_start` (date, nullable)
- `window_end` (date, nullable)
- `created_at`, `updated_at` (timestamptz)

Indexes:

- index on `(user_id, status)`
- index on `(user_id, task_type)`
- index on `(user_id, due_date)`

## `task_activity`
- `id` (uuid, pk)
- `task_id` (uuid, fk -> tasks.id, not null)
- `user_id` (uuid, fk -> users.id, not null)
- `activity_type` (enum task_activity_type, not null)
- `event_date` (date, not null)            # logical business day for reporting/streaks
- `created_at` (timestamptz, not null)     # exact insertion timestamp
- `updated_at` (timestamptz, nullable)     # only needed if activity rows are editable
- `payload` (jsonb, nullable)              # deltas/input/value/deadline metadata

Constraints:

- unique `(task_id, event_date, activity_type)` for `done` and `skipped`

Indexes:

- index on `(user_id, event_date)`
- index on `(task_id, event_date)`
- index on `(user_id, activity_type, event_date desc)`

## `quests`
- `id` (uuid, pk)
- `user_id` (uuid, fk -> users.id, not null)
- `title` (varchar, not null)
- `description` (text, nullable)
- `category` (varchar, nullable)
- `status` (enum quest_status, not null, default `active`)
- `target_date` (date, nullable)
- `success_criteria` (text, nullable)
- `progress_percent` (numeric(5,2), nullable)
- `created_at`, `updated_at` (timestamptz)

Indexes:

- index on `(user_id, status)`
- index on `(user_id, target_date)`

## `quest_activity`
- `id` (uuid, pk)
- `quest_id` (uuid, fk -> quests.id, not null)
- `user_id` (uuid, fk -> users.id, not null)
- `activity_type` (enum quest_activity_type, not null)
- `event_date` (date, not null)
- `created_at` (timestamptz, not null)
- `updated_at` (timestamptz, nullable)
- `payload` (jsonb, nullable)              # milestone info, progress delta, notes

Indexes:

- index on `(user_id, event_date)`
- index on `(quest_id, event_date)`
- index on `(user_id, activity_type, event_date desc)`

## `journal_entries`
- `id` (uuid, pk)
- `user_id` (uuid, fk -> users.id, not null)
- `title` (varchar, nullable)
- `content` (text, not null)
- `tags` (text[], nullable)
- `category_tags` (text[], nullable)
- `created_at`, `updated_at` (timestamptz)

Indexes:

- index on `(user_id, created_at desc)`
- GIN index on `to_tsvector('simple', content)`

## Optional (recommended) `checkin_days`

If you want simple streak calculation and quick monthly heatmaps, keep this small table:

- `id` (uuid, pk)
- `user_id` (uuid, fk -> users.id, not null)
- `for_date` (date, not null)
- `items_total` (int, not null)
- `items_answered` (int, not null)
- `completed` (bool, not null)
- `completed_at` (timestamptz, nullable)

Constraint:

- unique `(user_id, for_date)`

If removed, streaks are still possible from `task_activity` but query logic becomes more complex.

## 6. Dynamic Daily Item Generation (No Stored Items Table)

Daily items are generated per request and optionally cached briefly.

Flow:

1. Query active tasks for user.
2. Apply schedule rules to compute `due_today`.
3. Query `task_activity` for today (`done`, `skipped`) for those task IDs.
4. Mark remaining tasks as pending items.
5. Return ordered items + counts.
6. On response, insert `task_activity` row with `event_date=today`.

Performance:

- Cache daily items payload by `(user_id, today)` for 30-120 seconds.
- Invalidate cache on new task daily-response writes.

## 7. Anti-Overengineering Guardrails

Do now:

- one service, one database
- one table + one activity table per core domain (`tasks`, `quests`)
- smart insights queries over those activity tables

Do later only if needed:

- precomputed insight snapshots
- generic global event streams
- read replicas or separate analytics DB

## 8. Minimum Quality Bar

- `ruff` + `black` + type checks
- unit tests for schedule and daily item generation rules
- integration tests for activity idempotency constraints
- contract tests for task/quest/journal/insight APIs
- structured logs + request IDs + endpoint latency metrics

---

This model is simpler, production-capable, and optimized for fast Phase 1 delivery without locking you out of future scale.
