# FleetFlow - Quick Start Guide

## Prerequisites
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 15 installed and running
- ✅ Docker Desktop (if using Docker Compose)

## Starting the Application

### Option 1: Using Docker Compose (Recommended)
```bash
# From project root
docker-compose up -d
```
This starts PostgreSQL and backend server automatically.

### Option 2: Manual Start

#### 1. Start PostgreSQL
Make sure PostgreSQL is running on localhost:5432

#### 2. Start Backend Server
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

#### 3. Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3001 (or next available port)

## Initial Setup (First Time Only)

### Seed Demo Users
```bash
cd backend
npm run seed
```

This creates 4 demo accounts:
- **Admin**: admin@fleetflow.com / admin123
- **Manager**: manager@fleetflow.com / admin123
- **Dispatcher**: dispatcher@fleetflow.com / admin123
- **Driver**: driver@fleetflow.com / admin123

## Accessing the Application

### Frontend
Navigate to: http://localhost:3001

### Login
1. Go to http://localhost:3001/login
2. Use demo credentials: admin@fleetflow.com / admin123
3. Click "Log In"

### Register New User
1. Go to http://localhost:3001/register
2. Fill out the registration form
3. Click "Register"

## API Endpoints

### Authentication
- **POST** /api/auth/register - Register new user
- **POST** /api/auth/login - Login user
- **GET** /api/auth/profile - Get user profile (requires JWT)

### Health Check
- **GET** /api/health - Server health status

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fleetflow_db
DB_USER=fleetflow_user
DB_PASSWORD=fleetflow_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Testing Authentication

### Test Login (PowerShell)
```powershell
$body = @{
    email = "admin@fleetflow.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Test Protected Endpoint (PowerShell)
```powershell
$token = "<YOUR_JWT_TOKEN>"
$headers = @{ Authorization = "Bearer $token" }

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/profile" `
    -Method GET `
    -Headers $headers
```

## Common Issues

### Port Already in Use
If port 5000 or 3001 is already in use:
- Frontend: Vite will automatically try the next port
- Backend: Change PORT in .env file

### Database Connection Error
- Ensure PostgreSQL is running
- Verify credentials in .env match your PostgreSQL setup
- Check Docker containers: `docker-compose ps`

### JWT Type Error (Development)
The JWT utility file is JavaScript (`jwt.js`) instead of TypeScript due to library compatibility. This is intentional and does not affect functionality.

## Stopping the Application

### Docker Compose
```bash
docker-compose down
```

### Manual
- Backend: Press `Ctrl+C` in backend terminal
- Frontend: Press `Ctrl+C` in frontend terminal

## Development Tools

### Backend
- **Nodemon**: Auto-restarts on file changes
- **ts-node**: Runs TypeScript directly
- **Sequelize CLI**: Database migrations and seeds

### Frontend
- **Vite**: Fast development server with HMR
- **Redux DevTools**: State inspection (Chrome extension)

## Project Structure
```
odooxonline/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helpers (JWT, password, etc.)
│   │   └── server.ts       # Express server
│   ├── config/             # Database config
│   └── .env                # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store & slices
│   │   └── App.tsx         # Root component
│   └── .env                # Environment variables
├── database/
│   ├── migrations/         # Database migrations
│   └── seeds/              # Demo data seeders
├── docs/                   # Documentation
└── docker-compose.yml      # Docker services config
```

## Next Steps
- Explore the dashboard at http://localhost:3001
- Try different user roles (admin, manager, dispatcher, driver)
- Test protected routes
- Review API documentation in docs/

## Need Help?
- Review: docs/PHASE1_COMPLETE.md for detailed implementation docs
- Check: docs/API.md for API endpoint documentation (coming soon)
- Review: Backend logs in terminal for error details

---

**Version**: Phase 1 Complete
**Last Updated**: February 2026
**Status**: ✅ Fully Functional
