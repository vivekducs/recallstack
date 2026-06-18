# RecallStack

"Learn Once. Recall Anytime."

RecallStack is a developer-centric personal knowledge management (PKM) platform designed around a structured 4-level knowledge hierarchy: Subject -> Topic -> Note -> Section. 

It features a premium glassmorphic dark-themed user interface, full-text search, revision tracking, a multi-section creator workspace, bookmarking, and nested comments, backed by a Node.js/Express API and a PostgreSQL database using Prisma ORM.

---

## Key Features

* **4-Level Structured Hierarchy**:
  * **Subject**: High-level learning areas (e.g., DSA, System Design) configured with unique names, slugs, icon labels, and card colors.
  * **Topic**: Sub-domains under subjects (e.g., Sorting Algorithms under DSA).
  * **Note**: Learning logs authored by users (e.g., Merge Sort Complete Guide).
  * **Section**: Individual content blocks within a note supporting TEXT, CODE (with syntax highlighting), EXAMPLE, IMAGE, and DIAGRAM content types.
* **Creator Workspace (My Learnings)**: An interactive workflow allowing users to create notes, select subject/topic associations, and add, edit, or reorder content sections in real-time.
* **Full-Text Search & Filters**: Insensitive string search scanning note titles, excerpts, and section contents, query-filtered by subject, topic, and difficulty.
* **Revision History & Timeline**: Automatic logging of note edits with a sequential timeline of revisions per user.
* **Engagement & Moderation**: Bookmarks folder for saving notes, nested comments supporting admin/owner moderation (Pending/Approved/Rejected statuses), views count tracking, and helpful ratings.
* **Database Transactions & Denormalization**: Denormalized topicsCount and notesCount values on subjects and topics managed via atomic database transactions to ensure O(1) reads on entry point queries.
* **SEO Engine**: Static sitemaps, robots.txt routing, Open Graph image parameters, dynamic structured JSON-LD (Article & Breadcrumbs schemas) injections, RSS feed generation, and an LLM-friendly llms.txt route.

---

## Technology Stack

* **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Axios, Highlight.js
* **Backend**: Node.js, Express, Prisma ORM, JSON Web Tokens (JWT), BcryptJS
* **Database**: PostgreSQL

---

## Detailed Repository Structure

```text
recallstack/
├── docs/                               # Architecture and reference documents
│   ├── API.md                          # Comprehensive endpoint lists and parameters
│   ├── ARCHITECTURE.md                 # System overview and denormalization logic
│   └── DEPLOYMENT.md                   # Instructions for production hosting
│
├── prisma/                             # Database definition and initialization
│   ├── schema.prisma                   # Database models and relations
│   ├── seed.js                         # Database seed scripts for subjects, topics, and notes
│   └── migrations/                     # Auto-generated migrations history folder
│
├── backend/                            # Server application and API layers
│   ├── .env                            # Environment variables (Database URL, JWT config, PORT)
│   ├── package.json                    # Backend project dependencies and scripts
│   ├── package-lock.json               # Locked dependency tree
│   └── src/
│       ├── app.js                      # Express application setup, router mounting, global handlers
│       ├── server.js                   # Entry point for launching the API server
│       ├── config/                     # Configuration definitions
│       │   ├── constants.js            # General settings configuration
│       │   ├── database.js             # Prisma client connection instance
│       │   ├── email.js                # Mail service provider settings
│       │   └── jwt.js                  # Token options
│       ├── controllers/                # Empty placeholder files left for modular structure
│       │   ├── analytics.controller.js
│       │   ├── auth.controller.js
│       │   ├── bookmark.controller.js
│       │   ├── comment.controller.js
│       │   ├── note.controller.js
│       │   ├── revision.controller.js
│       │   ├── search.controller.js
│       │   ├── section.controller.js
│       │   ├── subject.controller.js
│       │   └── topic.controller.js
│       ├── middleware/                 # Request validation and guard layers
│       │   ├── admin.middleware.js     # Restricts access to users with Role ADMIN
│       │   ├── auth.middleware.js      # Decodes JWT tokens and exposes req.user object
│       │   ├── cors.middleware.js      # Cross-origin policy controls
│       │   ├── errorHandler.middleware.js # Express unified error response handler
│       │   ├── rateLimit.middleware.js # API access rate throttling
│       │   └── validation.middleware.js # Request payload validator
│       ├── repositories/               # Direct queries separation logic
│       │   ├── note.repository.js
│       │   ├── revision.repository.js
│       │   ├── section.repository.js
│       │   └── user.repository.js
│       ├── routes/                     # Mounts API endpoint logic (containing actual database code)
│       │   ├── analytics.routes.js     # Analytical metrics routing placeholder
│       │   ├── auth.routes.js          # Handles registration, login, and profile fetching
│       │   ├── bookmark.routes.js      # Saves, deletes, and lists user bookmarks
│       │   ├── comment.routes.js       # Threaded replies, moderation approval, and delete logic
│       │   ├── note.routes.js          # CRUD operations for drafts, publish, and denormalized syncs
│       │   ├── revision.routes.js      # Returns revision histories list for notes
│       │   ├── search.routes.js        # Main query filters search engine and sitemap routes
│       │   ├── section.routes.js       # Handles section CRUD, reordering, and reading time calls
│       │   ├── subject.routes.js       # Admin CRUD for subjects and homepage lookups
│       │   └── topic.routes.js         # Admin CRUD for topics nested under subjects
│       ├── services/                   # Business layers placeholders (currently handled in routes)
│       │   ├── analytics.service.js
│       │   ├── auth.service.js
│       │   ├── bookmark.service.js
│       │   ├── comment.service.js
│       │   ├── email.service.js
│       │   ├── note.service.js
│       │   ├── revision.service.js
│       │   ├── search.service.js
│       │   ├── section.service.js
│       │   ├── subject.service.js
│       │   └── topic.service.js
│       ├── templates/                  # Mail templates files
│       │   ├── new-note.html
│       │   └── welcome-email.html
│       ├── utils/                      # Helper methods and utilities
│       │   ├── bcrypt.js               # Password hashing helpers
│       │   ├── jwt.js                  # Signing utilities
│       │   ├── logger.js               # Standard backend console outputs
│       │   ├── readingTime.js          # Automatic reading time word count parsing
│       │   └── slugify.js              # Converts raw titles into URL-friendly strings
│       └── validators/                 # Middleware validators
│           ├── auth.validator.js
│           ├── comment.validator.js
│           ├── note.validator.js
│           └── section.validator.js
│
└── frontend/                           # Next.js web application
    ├── .env.local                      # Local settings mapping backend API URL
    ├── jsconfig.json                   # Path aliases mappings
    ├── next.config.js                  # Next.js router and optimization configs
    ├── package.json                    # Frontend package dependencies
    ├── package-lock.json               # Locked dependency tree
    ├── postcss.config.js               # Tailwind processor configuration
    ├── tailwind.config.js              # Theme custom styles setup
    └── src/
        ├── app/                        # App Router Pages
        │   ├── layout.js               # General HTML wrappers, fonts, and dark theme variables
        │   ├── page.js                 # Homepage displaying subject cards
        │   ├── (auth)/                 # Guest auth grouping
        │   │   ├── login/page.js       # Sign in page
        │   │   └── register/page.js    # Register user account page
        │   ├── admin/                  # Management console
        │   │   ├── layout.js           # Admin sidebar positioning wrapper
        │   │   ├── page.js             # General administration summary
        │   │   ├── analytics/page.js   # Admin analytics summary
        │   │   ├── moderation/page.js  # Approves or rejects user comments
        │   │   ├── subjects/page.js    # Subject creation forms
        │   │   └── topics/page.js      # Topic creation forms
        │   ├── bookmarks/page.js       # View user's saved notes
        │   ├── dashboard/page.js       # User center and settings page
        │   ├── globals.css             # Main styling, custom CSS animations, and custom colors
        │   ├── learning/               # Structured learning catalog pages
        │   │   ├── page.js             # General feed list index
        │   │   └── [subject]/
        │   │       ├── page.js         # Lists topics inside a subject
        │   │       └── [topic]/
        │   │           ├── page.js     # Lists notes inside a topic
        │   │           └── [slug]/
        │   │               └── page.js # Displays full note sections and comment threads
        │   ├── llms.txt/
        │   │   └── route.js            # Custom plain-text API for LLM parsing
        │   ├── my-learnings/           # Creator workspace panel
        │   │   ├── page.js             # List draft and published user notes
        │   │   ├── create/page.js      # Note builder setup wizard
        │   │   └── [id]/
        │   │       └── edit/page.js    # Workspace editor (adding, updating, and reordering sections)
        │   ├── revision-tracker/page.js # Historical revision logs page
        │   ├── robots.js               # Robot indexing config
        │   ├── rss.xml/
        │   │   └── route.js            # Dynamic RSS feed generation
        │   ├── search/page.js          # Filterable search panel
        │   └── sitemap.js              # Next.js dynamic XML sitemap builder
        ├── components/                 # Presentation layers
        │   ├── admin/                  # Subject and topic builders
        │   ├── comments/               # Reply forms, listing and tree threads
        │   ├── common/                 # Reusable buttons, badges, loaders, and input fields
        │   ├── editor/                 # Note and section edit workspace builders
        │   ├── home/                   # Main grids and hero sections
        │   ├── layout/                 # Headers, Footers, and responsive Sidebars
        │   ├── learning/               # Content feeds, topics lists, and note layouts
        │   ├── note/                   # Highlighted code viewers and single note layouts
        │   └── revision/               # Timelines and revisions logs lists
        ├── hooks/                      # React state logic hooks
        │   ├── useAuth.js              # Token synchronization and credential storage
        │   ├── useNote.js              # Fetching and caching note information
        │   ├── useRevision.js          # Fetches historical logs for a note
        │   ├── useSearch.js            # Triggers query updates and debouncing
        │   └── useSections.js          # Direct interactions with section operations
        ├── lib/                        # Framework integrations
        │   ├── formatters.js           # Datetime and word helpers
        │   ├── og-image.js             # Visual meta graph generator
        │   └── seo.js                  # Standard metadata configuration structures
        ├── services/                   # Network configurations
        │   ├── apiClient.js            # Axios client with interceptor injections
        │   ├── authService.js          # User requests definitions
        │   ├── noteService.js          # Notes requests definitions
        │   ├── revisionService.js      # Revisions logs requests definitions
        │   ├── sectionService.js       # Sections requests definitions
        │   ├── subjectService.js       # Subjects lists requests definitions
        │   └── topicService.js         # Topics lists requests definitions
        ├── store/                      # Unused state frameworks placeholders
        │   ├── authStore.js
        │   ├── noteStore.js
        │   └── uiStore.js
        └── utils/                      # Helper settings
            ├── cn.js                   # Conditional class name merger
            └── constants.js            # Shared UI labels and values
```

---

## Core Database Models

The schema uses PostgreSQL, defined in `prisma/schema.prisma` with the following relationships:

* **User**: Can author multiple notes, create multiple bookmarks, write multiple comments, and have a collection of logs under RevisionHistory. Has roles (USER or ADMIN).
* **Subject**: Represents high-level categories (e.g., DSA) containing multiple Topic entries. Holds denormalized `topicsCount` and `notesCount` integers.
* **Topic**: Belongs to a Subject, containing multiple Note records. Holds denormalized `notesCount` and `lastUpdated` timestamp.
* **Note**: Belongs to a Topic and User (Author). Contains multiple Section, Comment, Bookmark, and RevisionHistory records. Has statuses (DRAFT, PUBLISHED, ARCHIVED) and difficulty levels (EASY, MEDIUM, HARD).
* **Section**: Belongs to a Note. Represents specific elements within a note, categorized by `SectionType` (TEXT, CODE, EXAMPLE, IMAGE, DIAGRAM).
* **Comment**: Belongs to a Note and a User. Can self-relate through a parent-child structure (`parentId`) to support nested tree replies. Has statuses (PENDING, APPROVED, REJECTED).
* **Bookmark**: Joins a User and a Note (unique multi-column key on `userId` and `noteId`) for user saved lists.
* **RevisionHistory**: Logs the history of updates on a note, mapping `noteId` to the editing `userId` and date.

---

## Denormalization and Transaction Logic

To ensure high performance and sub-millisecond response times under load, RecallStack denormalizes counter metrics:

### 1. Subject and Topic Counter Invalidation
* **Adding a Topic**: When a Topic is created under a Subject, `Subject.topicsCount` is atomically incremented inside a Prisma Transaction.
* **Publishing a Note**: Creating a Note does not update the counts as notes are initialized as DRAFTs. When a Note's status is updated to PUBLISHED, `Topic.notesCount` and `Subject.notesCount` are both incremented inside a database Transaction (`prisma.$transaction()`).
* **Deleting a Note**: If the deleted note was in DRAFT status, parent counts remain untouched. If the note was PUBLISHED, both `Topic.notesCount` and `Subject.notesCount` are decremented.
* **Deleting a Topic**: When a Topic is removed, the containing Subject's `topicsCount` is decremented by 1, and the Subject's `notesCount` is decremented by the exact number of notes that belonged to the deleted topic.

### 2. Reading Time Calculation
A note's reading time is computed dynamically whenever a Section belonging to it is created, updated, or deleted. 
* The system reads all Sections of types TEXT and EXAMPLE belonging to that note.
* It extracts all alphanumeric strings (splitting contents by whitespace).
* The total word count is divided by 200 (assuming a standard reading rate of 200 words per minute), rounded up, defaulting to a minimum of 1 minute.
* The parent Note's `readingTime` field is updated in the database.

---

## API Endpoints Reference

### Authentication (api/auth)
* `POST /api/auth/register` - Register a new user account (returns token, userId, and role).
* `POST /api/auth/login` - Authenticate credentials (returns token, user details, and role).
* `GET /api/auth/me` - Expose profile information of the currently authenticated token user.

### Subjects (api/subjects)
* `GET /api/subjects` - Lists subjects containing one or more topics.
* `GET /api/subjects/:id` - Fetch details of a single subject by ID or slug, including nested topics.
* `POST /api/subjects` - Add a new subject (Admin only).
* `PUT /api/subjects/:id` - Edit metadata of an existing subject (Admin only).
* `DELETE /api/subjects/:id` - Delete a subject (Admin only).

### Topics (api/topics)
* `GET /api/subjects/:subjectId/topics` - Get all topics associated with a subject (by Subject ID or Slug).
* `POST /api/subjects/:subjectId/topics` - Create a topic nested under a subject (Admin only).
* `PUT /api/topics/:id` - Update topic metadata (Admin only).
* `DELETE /api/topics/:id` - Remove a topic and its count associations (Admin only).

### Notes (api/notes)
* `GET /api/topics/:topicId/notes` - Get all published notes under a topic.
* `GET /api/notes/user/my-notes` - Fetch all notes authored by the current logged-in user.
* `GET /api/notes/:id` - Fetch full metadata and all sections of a single note.
* `POST /api/notes` - Initialize a note under a topic in DRAFT status.
* `PUT /api/notes/:id` - Edit note settings (title, excerpt, difficulty, tags).
* `PATCH /api/notes/:id/publish` - Set status to PUBLISHED and increment denormalized parent counts.
* `DELETE /api/notes/:id` - Remove a note.

### Sections (api/sections)
* `POST /api/notes/:noteId/sections` - Add a section (TEXT, CODE, EXAMPLE, IMAGE, DIAGRAM) to a note.
* `PUT /api/sections/:id` - Update title, content, or types of a section.
* `DELETE /api/sections/:id` - Remove a section.

### Search (api/search)
* `GET /api/search` - Searches published notes and sections using filters (q, subject, topic, difficulty).
* `GET /api/search/sitemap` - Helper query nesting all subjects, topics, and published notes for SEO engines.

### Revisions (api/notes/:noteId/revisions)
* `GET /api/notes/:noteId/revisions` - Lists the sequential edit logs of a note.

### Bookmarks (api/bookmarks)
* `GET /api/bookmarks` - Return all notes saved in the authenticated user's bookmarks list.
* `POST /api/bookmarks` - Save a note to the bookmarks.
* `DELETE /api/bookmarks/:noteId` - Unsave a note from bookmarks.

### Comments (api/comments & api/notes/:noteId/comments)
* `GET /api/notes/:noteId/comments` - Fetch the hierarchical comment tree for a note.
* `POST /api/notes/:noteId/comments` - Post a new comment or threaded reply under a parent comment.
* `PUT /api/comments/:id` - Edit the text of a comment (Author only).
* `DELETE /api/comments/:id` - Delete a comment (Author, Note Owner, or Admin only).
* `PATCH /api/comments/:id/status` - Moderate comments status to APPROVED, REJECTED, or PENDING.

---

## Configuration and Setup

### 1. Backend Configuration

1. Locate the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create a `.env` configuration file with the following variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/recallstack?schema=public"
   JWT_SECRET="your_custom_jwt_security_secret_key"
   PORT=5000
   NODE_ENV="development"
   ```
3. Initialize the PostgreSQL schema via Prisma:
   ```bash
   npx prisma db push
   ```
4. Run the seed configuration to pre-populate starter rows:
   ```bash
   npm run db:seed
   ```
5. Install packages:
   ```bash
   npm install
   ```
6. Start the API server:
   ```bash
   npm run dev
   ```
   The API server will listen on http://localhost:5000.

### 2. Frontend Configuration

1. Locate the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Create a `.env.local` configuration file:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```
3. Install frontend packages:
   ```bash
   npm install
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The client application will run on http://localhost:3000.
