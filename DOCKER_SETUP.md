# Docker Compose Setup - Odyssey

## 🚀 Quick Start - Run Everything

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode (background)
docker compose up -d --build
```

## 📦 Services Included

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **PostgreSQL** | 5432 | `localhost:5432` | Database |
| **PgAdmin** | 5050 | `http://localhost:5050` | Database GUI |
| **FastAPI Server** | 8000 | `http://localhost:8000` | Backend API |
| **React Client** | 5173 | `http://localhost:5173` | Frontend |

---

## 🔐 Connection Credentials

### PostgreSQL Database
```
Host: localhost (or 'postgres' from within Docker network)
Port: 5432
Database: odyssey
Username: odyssey
Password: odyssey
```

### PgAdmin (Database Management UI)
```
URL: http://localhost:5050
Email: admin@odyssey.local
Password: admin
```

---

## 🗄️ Setting up PgAdmin Connection

1. Open PgAdmin at `http://localhost:5050`
2. Login with:
   - Email: `admin@odyssey.local`
   - Password: `admin`

3. Add new server:
   - Right-click **Servers** → **Register** → **Server**

4. **General Tab**:
   - Name: `Odyssey DB`

5. **Connection Tab**:
   - Host: `postgres` (use service name, not localhost!)
   - Port: `5432`
   - Maintenance database: `odyssey`
   - Username: `odyssey`
   - Password: `odyssey`
   - Save password: ✓ (check this)

6. Click **Save**

---

## 🎯 Docker Compose Commands

### Start Services
```bash
# Start all services
docker compose up

# Start in background (detached)
docker compose up -d

# Rebuild and start (after code changes)
docker compose up --build

# Start specific service
docker compose up postgres pgadmin
```

### Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes data!)
docker compose down -v

# Stop specific service
docker compose stop server
```

### View Logs
```bash
# All services
docker compose logs

# Follow logs (real-time)
docker compose logs -f

# Specific service
docker compose logs -f server

# Last 100 lines
docker compose logs --tail=100
```

### Execute Commands in Containers
```bash
# Access PostgreSQL CLI
docker compose exec postgres psql -U odyssey -d odyssey

# Access server container bash
docker compose exec server bash

# Run Alembic migrations in server
docker compose exec server alembic upgrade head

# Create new migration
docker compose exec server alembic revision --autogenerate -m "description"
```

### Rebuild Services
```bash
# Rebuild all
docker compose build

# Rebuild specific service
docker compose build server

# Force rebuild without cache
docker compose build --no-cache
```

---

## 🧪 Testing the API

Once all services are running, test the authentication API:

### 1. Via Swagger UI (Browser)
Open: `http://localhost:8000/docs`

### 2. Via curl (Terminal)

**Register a user:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get current user (with token):**
```bash
# First, save the token from login response
TOKEN="your_access_token_here"

curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Troubleshooting

### Database connection issues
```bash
# Check if postgres is healthy
docker compose ps

# View postgres logs
docker compose logs postgres

# Restart postgres
docker compose restart postgres
```

### Server won't start
```bash
# Check server logs
docker compose logs server

# Rebuild server
docker compose up --build server

# Check if migrations need to run
docker compose exec server alembic current
```

### Port already in use
```bash
# Check what's using the port
sudo lsof -i :8000  # or :5432, :5173, :5050

# Kill the process or change port in docker-compose.yml
```

### Clean slate restart
```bash
# Stop everything and remove volumes
docker compose down -v

# Rebuild and start fresh
docker compose up --build
```

---

## 📊 Database Management

### View Tables
```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U odyssey -d odyssey

# List tables
\dt

# Describe users table
\d users

# Query users
SELECT * FROM users;

# Exit
\q
```

### Backup Database
```bash
# Backup to file
docker compose exec postgres pg_dump -U odyssey odyssey > backup.sql

# Restore from file
docker compose exec -T postgres psql -U odyssey odyssey < backup.sql
```

---

## 🌐 Network Configuration

All services are on the same Docker network: `odyssey-network`

**Service Communication:**
- Server → Postgres: `postgres:5432`
- Client → Server: `http://server:8000` (or `http://localhost:8000` from host)

---

## ⚙️ Environment Variables

### Server (.env in server folder)
```env
DATABASE_URL=postgresql+psycopg://odyssey:odyssey@postgres:5432/odyssey
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

### Client (.env.local in client folder)
```env
VITE_API_URL=http://localhost:8000
```

---

## 📝 Current Status

- ✅ PostgreSQL running
- ✅ PgAdmin configured
- ✅ Server with authentication API
- ✅ Database migrations ready
- ⏳ Client (React app) - needs auth pages

---

## 🎯 Next Steps

1. Access PgAdmin to view the database
2. Test API endpoints via Swagger UI
3. Check the `users` table in PgAdmin after registering
4. Continue building frontend auth pages

---

## 🆘 Quick Reference

**Start everything:**
```bash
docker compose up -d
```

**View all containers:**
```bash
docker compose ps
```

**Access services:**
- API Docs: http://localhost:8000/docs
- PgAdmin: http://localhost:5050
- Client: http://localhost:5173 (when ready)

**Stop everything:**
```bash
docker compose down
```
