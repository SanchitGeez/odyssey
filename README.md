# Odyssey

Odyssey backend for Stage 1: tasks, quests, journals, and insights.

## Current Status

- Backend architecture: modular monolith with layered modules
- Implemented modules: `identity`, `tasks`, `quests`, `journals`, `insights`
- DB migrations: Alembic
- Tests: Pytest (API integration tests)

Reference architecture: [architecurre.md](/home/sanchit/projects/odyssey/architecurre.md)

## Backend Structure

```txt
server/
  app/
    api/v1/                      # Thin HTTP routes
    modules/
      identity/                  # auth/session
      tasks/                     # tasks + task_activity + daily items
      quests/                    # quests + quest_activity
      journals/                  # journal CRUD + search
      insights/                  # query-driven analytics
    shared/
      core/                      # config/security
      db/                        # base/session/uow/models
  alembic/
  requirements.txt
```

## Prerequisites

- Python 3.13+
- Docker + Docker Compose (optional, for Postgres)

## Local Setup (Backend)

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Environment Variables

Default local DB is SQLite (`sqlite:///./odyssey.db`) if `DATABASE_URL` is not set.

Create `server/.env` (optional):

```env
APP_NAME=Odyssey Backend
APP_VERSION=0.1.0
DATABASE_URL=sqlite:///./odyssey.db
JWT_SECRET=change-me-in-prod
JWT_ALGORITHM=HS256
ACCESS_TOKEN_MINUTES=30
REFRESH_TOKEN_DAYS=30
```

For Postgres (Docker), use:

```env
DATABASE_URL=postgresql://odyssey:odyssey@localhost:5432/odyssey
```

## Run Migrations

Alembic now auto-reads `DATABASE_URL` from env if set.

```bash
cd server
source .venv/bin/activate
alembic upgrade head
```

## Run Server

```bash
cd server
source .venv/bin/activate
uvicorn main:app --reload
```

Useful URLs:

- API docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

## Run Tests

```bash
cd server
source .venv/bin/activate
pytest -q
```

## Docker (Postgres + Server)

```bash
docker compose up --build
```

Services:

- Postgres: `localhost:5432`
- Server: `localhost:8000`

After containers start, run migrations:

```bash
docker compose exec server alembic upgrade head
```

## Implemented API Endpoints

Identity:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`

Tasks:

- `POST /api/v1/tasks`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/by-id/{task_id}`
- `PATCH /api/v1/tasks/by-id/{task_id}`
- `DELETE /api/v1/tasks/by-id/{task_id}`
- `GET /api/v1/tasks/daily-items`
- `POST /api/v1/tasks/by-id/{task_id}/respond`

Quests:

- `POST /api/v1/quests`
- `GET /api/v1/quests`
- `PATCH /api/v1/quests/{quest_id}`
- `DELETE /api/v1/quests/{quest_id}`
- `POST /api/v1/quests/{quest_id}/activity`
- `GET /api/v1/quests/{quest_id}/activity`

Journals:

- `POST /api/v1/journals`
- `GET /api/v1/journals`
- `DELETE /api/v1/journals/{journal_id}`

Insights:

- `GET /api/v1/insights/overview`

## Notes

- `tasks` and `quests` follow the activity-table model:
  - `tasks` + `task_activity`
  - `quests` + `quest_activity`
- Daily items are query-generated (not stored as a `cards` table).
- `checkin_days` is used for streak and completion aggregation.
