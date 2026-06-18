# RecallStack Deployment & Configuration Guide

This document describes how to configure, seed, and run RecallStack backend and frontend applications locally and prepare for production deployment.

---

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: npm (ships with Node.js)
- **Database**: PostgreSQL (v14+) running locally or hosted on a cloud provider (e.g., Supabase, Neon, Railway)

---

## 2. Local Environment Setup

### 2.1 Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd recallstack/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `recallstack/backend/` directory with the following variables:
   ```env
   # PostgreSQL Connection string
   DATABASE_URL="postgresql://<db_user>:<db_password>@<db_host>:<db_port>/<db_name>?schema=public"
   
   # JWT Secret Key for token signing (use a long random string in production)
   JWT_SECRET="your-secret-key-change-in-production"
   
   # Port for Express server to bind to
   PORT=5000
   
   # Allowed Frontend Origin for CORS configuration
   FRONTEND_URL="http://localhost:3000"
   
   # Node environment state
   NODE_ENV="development"
   ```

### 2.2 Database Initialization & Seeding
Once the PostgreSQL database is online and the `DATABASE_URL` is set, set up the schema and seed initial users and subjects:

1. Run Prisma migrations to construct tables:
   ```bash
   npx prisma migrate dev --name init
   ```
2. Run the seed script to create initial admin and regular test users, four subjects, and a complete mock note on "Merge Sort":
   ```bash
   npm run db:seed
   ```
   *Seeded Credentials:*
   - **Admin Profile**: `admin@recallstack.com` / `admin12345`
   - **Test User Profile**: `user@recallstack.com` / `user12345`

### 2.3 Starting Backend Dev Server
Run the Express development server (monitored by `nodemon`):
```bash
npm run dev
```
The API should now be active at `http://localhost:5000/api`. You can query `http://localhost:5000/api/health` to verify server state.

---

## 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd recallstack/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `recallstack/frontend/` directory with the backend endpoint URI:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```
4. Start Next.js in hot-reloading development mode:
   ```bash
   npm run dev
   ```
Open `http://localhost:3000` in your browser to view the homepage grid with seeded subjects.

---

## 4. Production Deployment

### 4.1 Backend Deployment (e.g. Railway, Render, Heroku)
- Configure the environment variables (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, etc.) inside the hosting provider's dashboard.
- Set the start command to:
  ```bash
  npx prisma migrate deploy && npm start
  ```
  *(This ensures migrations are automatically applied on every deployment).*

### 4.2 Frontend Deployment (e.g. Vercel, Netlify)
- Link the frontend Git repository.
- Specify the Build command: `npm run build`.
- Specify the Output directory: `.next`.
- Add the Environment Variable `NEXT_PUBLIC_API_URL` pointing to the live backend URL.
