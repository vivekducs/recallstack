# RecallStack 🧠

> **"Learn Once. Recall Anytime."**

RecallStack is a developer-centric personal knowledge management (PKM) platform designed around a structured 4-level knowledge hierarchy: **Subject ➔ Topic ➔ Note ➔ Section**. 

It features a premium glassmorphic dark-themed UI, full-text search, revision tracking, note editors, bookmarking, and nested comments, backed by a high-performance Express API and a denormalized PostgreSQL database.

---

## 🚀 Key Features

* **4-Level Structured Hierarchy**: 
  * **Subject**: High-level learning areas (e.g., *DSA*, *System Design*, *Web Development*) with emoji icons and custom card colors.
  * **Topic**: Sub-domains under subjects (e.g., *Sorting Algorithms* under *DSA*).
  * **Note**: Multi-section deep-dives authored by users (e.g., *Merge Sort Complete Guide*).
  * **Section**: Modifiable content blocks within a note supporting `TEXT`, `CODE` (with client-side syntax highlighting via `highlight.js`), `EXAMPLE`, `IMAGE`, and `DIAGRAM`.
* **Creator Workspace (My Learnings)**: An interactive wizard to create notes, select subject/topic associations, and add, edit, or reorder content sections seamlessly.
* **Full-Text Search & Filters**: Search through subjects, topics, notes, and sections, filtered by difficulty, subject, and topic.
* **Revision History & Timeline**: Automatic tracking of note edits with a clean timeline of modifications.
* **Engagement Tools**: Save notes to a personal bookmarks folder, read stats (views, helpful counters), and participate in nested comment threads.
* **Optimized Performance**: Denormalized counters (`topicsCount`, `notesCount`) on subjects and topics handled via database transactions to ensure fast sub-millisecond responses on high-traffic entry points.
* **SEO Optimized**: Dynamic metadata generation, JSON-LD schemas (Article and Breadcrumbs), auto-updating `sitemap.xml`, `robots.txt`, RSS feeds, and a parser-friendly `llms.txt`.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Axios, Highlight.js.
* **Backend**: Node.js, Express, Prisma ORM, JSON Web Tokens (JWT), BcryptJS.
* **Database**: PostgreSQL (seeded with subjects, topics, and initial content).

---

## 📁 Repository Structure

```text
recallstack/
├── frontend/             # Next.js frontend application
│   ├── src/
│   │   ├── app/          # App router pages (Home, Auth, Learning Feed, Workspace, Admin)
│   │   ├── components/   # Modular UI components (Layout, Learning, Editor, Comments, etc.)
│   │   ├── hooks/        # Custom React hooks (useAuth, useNote, useSearch)
│   │   ├── services/     # API services for fetching data
│   │   ├── store/        # State management (authStore, uiStore)
│   │   └── utils/        # Helper functions & styling utilities
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/              # Node.js Express server & REST API
│   ├── src/
│   │   ├── controllers/  # Request handlers (auth, notes, search, etc.)
│   │   ├── routes/       # Express API routes
│   │   ├── middleware/   # Authentication, error handling, validation
│   │   ├── services/     # Business logic layers
│   │   ├── repositories/ # Data access abstraction
│   │   └── app.js        # Server initialization
│   └── package.json
│
├── prisma/               # Prisma schema & seeding configs
│   ├── schema.prisma     # PostgreSQL schema definitions
│   └── seed.js           # Pre-populates database with starter data
│
└── docs/                 # Detailed architecture & API docs
    ├── ARCHITECTURE.md
    ├── API.md
    └── DEPLOYMENT.md
```

---

## ⚙️ Getting Started

Follow the instructions below to run both the frontend and backend locally.

### Prerequisites

* Node.js (v18 or higher recommended)
* npm (comes with Node.js)
* A running PostgreSQL instance

---

### 1. Database Setup (Prisma)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file based on the environment configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/recallstack?schema=public"
   JWT_SECRET="your_jwt_signing_secret"
   PORT=5000
   ```
3. Push the schema to your database:
   ```bash
   npx prisma db push
   ```
4. Run the seed script to populate subjects, topics, and sample users/notes:
   ```bash
   npm run db:seed
   ```

---

### 2. Run the Backend API

1. In the `backend` directory, install dependencies:
   ```bash
   npm install
   ```
2. Start the API server in development mode:
   ```bash
   npm run dev
   ```
   *The server runs by default on `http://localhost:5000`.*

---

### 3. Run the Frontend App

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.*

---

## 📖 Additional Documentation

For deeper details, consult the markdown files in the `/docs` directory:
* **[Architecture Overview](file:///c:/Users/91969/Desktop/RecallStack/recallstack/docs/ARCHITECTURE.md)**: Details the database layout, performance caching/denormalization mechanisms, and visual design systems.
* **[API Documentation](file:///c:/Users/91969/Desktop/RecallStack/recallstack/docs/API.md)**: Explains the available REST API endpoints for authentication, subjects, topics, notes, sections, comments, search, and bookmarks.
* **[Deployment Guide](file:///c:/Users/91969/Desktop/RecallStack/recallstack/docs/DEPLOYMENT.md)**: Instructions for deploying to production hosting platforms.
