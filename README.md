# Odyssey

Full-stack web application with FastAPI backend, React frontend, and PostgreSQL database.

## Project Structure

```
Odyssey/
├── server/               # FastAPI backend
│   ├── main.py          # Application entry point
│   ├── requirements.txt # Python dependencies
│   └── Dockerfile       # Server container config
├── client/              # React + Vite + TypeScript frontend
│   ├── src/            # React source code
│   ├── Dockerfile      # Client container config
│   └── package.json    # Node dependencies
├── docker-compose.yml  # Docker orchestration
└── .venv/              # Python virtual environment
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

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check endpoint

## Environment Variables

**Database Configuration:**
- `POSTGRES_USER=odyssey`
- `POSTGRES_PASSWORD=odyssey`
- `POSTGRES_DB=odyssey`
- `DATABASE_URL=postgresql://odyssey:odyssey@postgres:5432/odyssey`

## Development

**Server Features:**
- FastAPI with automatic API documentation
- CORS enabled for frontend development
- Hot-reload enabled in Docker
- PostgreSQL integration ready

**Client Features:**
- React 18 with TypeScript
- Vite for fast development and builds
- Hot Module Replacement (HMR)
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
