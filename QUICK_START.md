# 🚀 Odyssey - Quick Start Guide

## Start Everything

```bash
# Stop current containers
docker compose down

# Rebuild and start all services
docker compose up --build
```

---

## 🔑 Access Credentials

### PgAdmin - Database Management
- **URL**: http://localhost:5050
- **Email**: `admin@admin.com`
- **Password**: `admin`

### PostgreSQL Database
- **Host**: `postgres` (inside Docker) or `localhost` (from host machine)
- **Port**: `5432`
- **Database**: `odyssey`
- **Username**: `odyssey`
- **Password**: `odyssey`

### FastAPI Server
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Base URL**: http://localhost:8000

### React Client (when ready)
- **URL**: http://localhost:5173

---

## 📊 Connect PgAdmin to Database

1. Open http://localhost:5050
2. Login with `admin@admin.com` / `admin`
3. Right-click **Servers** → **Register** → **Server**
4. **General Tab**:
   - Name: `Odyssey`
5. **Connection Tab**:
   ```
   Host: postgres
   Port: 5432
   Maintenance database: odyssey
   Username: odyssey
   Password: odyssey
   ☑ Save password
   ```
6. Click **Save**

---

## 🧪 Test Authentication API

### Via Swagger UI (Easiest)
1. Open http://localhost:8000/docs
2. Expand `/api/v1/auth/register` → Click "Try it out"
3. Enter:
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
4. Click "Execute"
5. You should see a 201 response with user data!

6. Try `/api/v1/auth/login` with same credentials
7. Copy the `access_token` from response
8. Click **Authorize** button at top of page
9. Paste token in format: `Bearer your_token_here`
10. Now try `/api/v1/auth/me` - it should return your user!

### Via curl
```bash
# Register
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login (save the token!)
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user (replace TOKEN with actual token)
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer TOKEN"
```

---

## 🐳 Useful Docker Commands

```bash
# View running containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f server

# Restart a service
docker compose restart server

# Stop everything
docker compose down

# Stop and delete volumes (⚠️ deletes database!)
docker compose down -v

# Run migrations inside server container
docker compose exec server alembic upgrade head

# Access PostgreSQL CLI
docker compose exec postgres psql -U odyssey -d odyssey
```

---

## 📝 What's Running

| Service | Status | URL |
|---------|--------|-----|
| PostgreSQL | ✅ Running | localhost:5432 |
| PgAdmin | ✅ Running | http://localhost:5050 |
| FastAPI Server | ✅ Running | http://localhost:8000 |
| React Client | ✅ Running | http://localhost:5173 |

---

## 🎯 API Endpoints Available

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (returns JWT token)
- `GET /api/v1/auth/me` - Get current user (requires auth)
- `POST /api/v1/auth/logout` - Logout
- `GET /health` - Health check
- `GET /docs` - Swagger UI
- `GET /redoc` - ReDoc documentation

---

## ✅ Verification Checklist

- [ ] All containers running: `docker compose ps`
- [ ] PgAdmin accessible at http://localhost:5050
- [ ] FastAPI docs at http://localhost:8000/docs
- [ ] Can register a user via Swagger UI
- [ ] Can login and get JWT token
- [ ] Can access `/api/v1/auth/me` with token
- [ ] Can view users table in PgAdmin

---

## 🔧 Fixes Applied

1. ✅ Changed PgAdmin email from `admin@odyssey.local` to `admin@admin.com` (`.local` domain not allowed)
2. ✅ Updated `requirements.txt` to use `psycopg[binary]==3.2.3` for Docker compatibility
3. ✅ Database URL uses `postgresql+psycopg://` dialect

---

## 📚 Full Documentation

See `DOCKER_SETUP.md` for comprehensive Docker Compose guide.
