# Odyssey

A holistic life management application helping users build awareness and maintain balance across six core dimensions of life through flexible task tracking.

**Current Status**: 🚧 Stage 1 - Phase 1 Complete (Authentication) ✅

## Project Vision

Odyssey organizes life into six interconnected categories (Body, Mind, Work, Wealth, Connection, Meaning) and provides flexible task types (Recurring, One-Time, Projects) that match how life actually works. See [specs/stage1](./specs/stage1/) for full MVP vision.

## Implementation Progress

### ✅ Stage 1 - Phase 1: Authentication (COMPLETED)
- Email/password authentication with JWT tokens
- User registration and login
- Protected routes and session management
- PostgreSQL database with Alembic migrations
- Layered backend architecture (API/Service/Repository/Database)
- Dark mode frontend with custom theme

**Documentation**: See [implementation/stage1/phase1/](./implementation/stage1/phase1/)

### 🔜 Upcoming Phases
- Phase 2: Core task management
- Phase 3: Daily check-in interface
- Phase 4: Projects and journal
- Phase 5: Dashboard and analytics

## Project Structure

```
Odyssey/
├── server/                    # FastAPI backend
│   ├── app/
│   │   ├── api/v1/           # API endpoints
│   │   ├── core/             # Config, security, database
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── repositories/     # Data access layer
│   ├── alembic/              # Database migrations
│   ├── main.py               # Application entry point
│   └── requirements.txt      # Python dependencies
├── client/                    # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── lib/
│   │   │   ├── api/          # API client
│   │   │   ├── store/        # Zustand state management
│   │   │   └── types/        # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── implementation/            # Phase-by-phase implementation docs
├── specs/                     # Product specifications
├── docker-compose.yml         # Docker orchestration
└── .venv/                    # Python virtual environment
```

## Prerequisites

- Docker & Docker Compose
- Python 3.13+ (for local development)
- Node.js 20+ (for local development)
- uv (Python package manager)

## Quick Start

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

### Local Development

**Server:**
```bash
cd server
source ../.venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Client:**
```bash
cd client
npm install
npm run dev
```

**Database:**
```bash
docker-compose up postgres -d
```

## Services

| Service  | URL                      | Description                |
|----------|--------------------------|----------------------------|
| Client   | http://localhost:5173    | React frontend             |
| Server   | http://localhost:8000    | FastAPI backend            |
| API Docs | http://localhost:8000/docs | Interactive API documentation |
| Database | localhost:5432           | PostgreSQL database        |
| PgAdmin  | http://localhost:5050    | Database management UI     |

## API Endpoints

### Authentication (Phase 1)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login (returns JWT token)
- `GET /api/v1/auth/me` - Get current user (protected)
- `POST /api/v1/auth/logout` - Logout (client-side)

### General
- `GET /` - Root endpoint
- `GET /health` - Health check endpoint

## Environment Variables

**Backend (server/.env)**:
```env
DATABASE_URL=postgresql+psycopg://odyssey:odyssey@postgres:5432/odyssey
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend (client/.env.local)**:
```env
VITE_API_URL=http://localhost:8000
```

**Database Configuration (docker-compose.yml)**:
- `POSTGRES_USER=odyssey`
- `POSTGRES_PASSWORD=odyssey`
- `POSTGRES_DB=odyssey`

## Development

**Server Features:**
- FastAPI with automatic API documentation
- CORS enabled for frontend development
- Hot-reload enabled in Docker
- PostgreSQL integration ready

**Client Features:**
- React 19 with TypeScript
- Vite for fast development and builds
- Hot Module Replacement (HMR)
- Zustand state management with localStorage persistence
- Axios HTTP client with request/response interceptors
- React Router v6 with protected routes
- Tailwind CSS v4 with custom dark mode theme
- ESLint configured

## Database

PostgreSQL 16 is configured with:
- Persistent volume storage
- Health checks
- Auto-restart on failure

**Connection Details:**
- Host: `localhost` (or `postgres` within Docker network)
- Port: `5432`
- Database: `odyssey`
- Username: `odyssey`
- Password: `odyssey`

## Building for Production

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build server
docker-compose build client
```

## Troubleshooting

**Port already in use:**
```bash
# Check what's using the port
lsof -i :5173  # Client
lsof -i :8000  # Server
lsof -i :5432  # Database
```

**Database connection issues:**
```bash
# Check if postgres is healthy
docker-compose ps
docker-compose logs postgres
```

**Client/Server not updating:**
```bash
# Rebuild and restart
docker-compose down
docker-compose up --build
```

## License

MIT
