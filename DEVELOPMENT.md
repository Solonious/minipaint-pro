# MiniPaint Pro - Development & Deployment Guide

This guide covers local development setup, running the application, and CI/CD deployment configurations.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Running the Application](#running-the-application)
- [Database Management](#database-management)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [CI/CD Deployment](#cicd-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v20.x or higher | Runtime environment |
| npm | v10.x or higher | Package manager |
| PostgreSQL | v14.x or higher | Database |
| Git | Latest | Version control |

### Optional Tools

- **Docker** - For containerized PostgreSQL
- **Prisma Studio** - Visual database browser (included)
- **VS Code** - Recommended IDE with Angular/NestJS extensions

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd minipaint-pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your local settings:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minipaint_pro?schema=public"

# API
PORT=3000
API_PREFIX=api
NODE_ENV=development

# Auth (Phase 2)
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:4200
```

### 4. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE minipaint_pro;"
```

#### Option B: Docker PostgreSQL

```bash
docker run --name minipaint-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=minipaint_pro \
  -p 5432:5432 \
  -d postgres:14
```

### 5. Initialize the Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# OR run migrations (production-like)
npx prisma migrate dev --name init
```

### 6. Seed the Database (Optional)

```bash
npx prisma db seed
```

---

## Running the Application

### Start Both Frontend and Backend

```bash
# Terminal 1: Start the API server (port 3000)
npx nx serve api

# Terminal 2: Start the web frontend (port 4200)
npx nx serve web
```

### Or run both simultaneously:

```bash
npx nx run-many -t serve -p web api
```

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:4200 | Angular application |
| Backend API | http://localhost:3000/api | NestJS REST API |
| Swagger Docs | http://localhost:3000/docs | API documentation |
| Prisma Studio | http://localhost:5555 | Database browser |

### Start Prisma Studio (Database Browser)

```bash
npx prisma studio
```

---

## Database Management

### Common Prisma Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database (no migration)
npx prisma db push

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (drops all data!)
npx prisma migrate reset

# Open database browser
npx prisma studio

# Format schema file
npx prisma format
```

### Viewing Database Data

```bash
# Using Prisma Studio (recommended)
npx prisma studio

# Using psql
psql -U postgres -d minipaint_pro -c "SELECT * FROM miniatures;"
```

---

## Testing

### Run All Tests

```bash
# Web tests
npx nx test web

# API tests (if configured)
npx nx test api
```

### Run Tests in Watch Mode

```bash
npx nx test web --watch
```

### Run Linting

```bash
# Lint web project
npx nx lint web

# Lint and auto-fix
npm run lint-staged
```

---

## Building for Production

### Build Frontend

```bash
npx nx build web --configuration=production
```

Output: `dist/apps/web/`

### Build Backend

```bash
npx nx build api --configuration=production
```

Output: `dist/apps/api/`

### Build Both

```bash
npx nx run-many -t build -p web api --configuration=production
```

---

## CI/CD Deployment

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20.x'

jobs:
  # ============================================
  # Lint and Test
  # ============================================
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npx nx lint web

      - name: Run tests
        run: npx nx test web --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/apps/web/lcov.info

  # ============================================
  # Build
  # ============================================
  build:
    runs-on: ubuntu-latest
    needs: lint-test
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Build web application
        run: npx nx build web --configuration=production

      - name: Build API application
        run: npx nx build api --configuration=production

      - name: Upload web artifacts
        uses: actions/upload-artifact@v4
        with:
          name: web-dist
          path: dist/apps/web/

      - name: Upload API artifacts
        uses: actions/upload-artifact@v4
        with:
          name: api-dist
          path: dist/apps/api/

  # ============================================
  # Deploy to Vercel (Frontend)
  # ============================================
  deploy-frontend:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build for Vercel
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}

  # ============================================
  # Deploy to Railway (Backend)
  # ============================================
  deploy-backend:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: railway up --service api
```

### Required GitHub Secrets

Set these in your repository settings (Settings > Secrets and variables > Actions):

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel deployment token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `RAILWAY_TOKEN` | Railway deployment token |
| `DATABASE_URL` | Production database URL |

---

## Deployment Platforms

### Frontend: Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `apps/web` directory as root

2. **Configure Build Settings**
   ```
   Build Command: npx nx build web --configuration=production
   Output Directory: dist/apps/web/browser
   Install Command: npm ci
   ```

3. **Environment Variables**
   ```
   API_URL=/api  (or your backend URL)
   ```

### Backend: Railway

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub

2. **Configure Service**
   ```
   Build Command: npm ci && npx prisma generate && npx nx build api
   Start Command: node dist/apps/api/main.js
   ```

3. **Add PostgreSQL**
   - Add PostgreSQL plugin in Railway
   - Copy `DATABASE_URL` to environment variables

4. **Environment Variables**
   ```
   DATABASE_URL=<from Railway PostgreSQL>
   NODE_ENV=production
   PORT=3000
   API_PREFIX=api
   JWT_SECRET=<generate-secure-key>
   CORS_ORIGIN=https://your-vercel-domain.vercel.app
   ```

### Alternative: Render

1. **Backend Service**
   ```yaml
   # render.yaml
   services:
     - type: web
       name: minipaint-api
       env: node
       buildCommand: npm ci && npx prisma generate && npx nx build api
       startCommand: node dist/apps/api/main.js
       envVars:
         - key: DATABASE_URL
           fromDatabase:
             name: minipaint-db
             property: connectionString
         - key: NODE_ENV
           value: production

   databases:
     - name: minipaint-db
       plan: free
   ```

---

## Environment Variables

### Development (`.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minipaint_pro?schema=public"

# API
PORT=3000
API_PREFIX=api
NODE_ENV=development

# Auth
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:4200
```

### Production

```env
# Database (from hosting provider)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# API
PORT=3000
API_PREFIX=api
NODE_ENV=production

# Auth (generate secure key!)
JWT_SECRET=<generate-with: openssl rand -base64 32>
JWT_EXPIRES_IN=7d

# CORS (your frontend domain)
CORS_ORIGIN=https://minipaint-pro.vercel.app
```

### Generate Secure JWT Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Troubleshooting

### Common Issues

#### Database Connection Error

```
Error: Can't reach database server at localhost:5432
```

**Solution:**
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify database exists: `psql -U postgres -l`

#### Prisma Client Not Generated

```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
npx prisma generate
```

#### CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Ensure `CORS_ORIGIN` matches your frontend URL
2. Check API is running on correct port

#### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

#### Prisma Migration Drift

```
Drift detected: Your database schema is not in sync
```

**Solution (Development only):**
```bash
npx prisma db push
# OR reset completely
npx prisma migrate reset
```

### Useful Debug Commands

```bash
# Check Nx workspace
npx nx report

# View project graph
npx nx graph

# Check database status
npx prisma migrate status

# Validate Prisma schema
npx prisma validate

# View all Nx targets for a project
npx nx show project web --web
```

---

## Quick Reference

### Daily Development Commands

```bash
# Start development servers
npx nx serve api          # Backend: http://localhost:3000
npx nx serve web          # Frontend: http://localhost:4200

# Database
npx prisma studio         # Visual database browser
npx prisma db push        # Sync schema changes

# Quality checks
npx nx lint web           # Run linting
npx nx test web           # Run tests
npm run lint-staged       # Lint staged files
```

### Pre-commit Checklist

1. `npx nx lint web` - No lint errors
2. `npx nx test web` - All tests pass
3. `npx nx build web` - Build succeeds
4. Test in browser - Features work as expected

### Deployment Checklist

1. All tests passing
2. Build succeeds locally
3. Environment variables configured
4. Database migrations applied
5. CORS settings correct for production domain
