---
name: recallstack
description: >
  Master skill for building RecallStack — a personal knowledge management
  platform (Next.js 14 frontend, Node.js/Express backend, PostgreSQL + Prisma,
  Claude + Gemini AI). Use this skill for every task on the RecallStack project:
  creating files, writing routes, building components, designing the schema,
  implementing SEO, setting up AI features, writing tests, or updating docs.
  Trigger on any RecallStack mention, any file creation in frontend/ or backend/,
  any Prisma schema work, any Next.js page or component, and any API endpoint work.
---

# RecallStack — Master Development Skill

**Tagline:** "Learn Once. Recall Anytime."

**What it is:** A personal knowledge management platform structured as a
4-level hierarchy: Subject > Topic > Note > Section. Public by default (no
paywall), inspired by Medium + interview prep platforms. Admin creates Subjects
and Topics; users create Notes and Sections under them.

**Stack:** Next.js 14 (App Router), Node.js + Express, PostgreSQL + Prisma,
Tailwind CSS, Claude API (Anthropic), Gemini API (Google).

---

## ABSOLUTE RULES — READ BEFORE EVERY ACTION

These rules are non-negotiable. Violating them means the agent has made an
error and must stop and correct itself.

1. **Never implement anything without explicit confirmation from the user.**
   Present the plan, wait for approval, then build. This applies to every file,
   every function, every schema change, and every config edit.

2. **Never hallucinate.** If any detail — a library version, an API behavior,
   a file path, a Prisma syntax — is uncertain, stop and ask the user before
   proceeding. Guessing is not allowed.

3. **Every completed phase must be documented in README.md** before moving to
   the next phase. The README is a living document; it grows with the project.

4. **Every file must have a documentation block at the top** explaining what
   the file is and why it exists. Every non-trivial function must have a comment
   block. Every non-obvious line of logic must have an inline comment.
   Comments explain what the code does and why it is there — not how it looks.

5. **No emoji anywhere in code, comments, README, or documentation.**

6. **No move to the next phase without user sign-off** on the current phase's
   deliverable.

---

## WORKFLOW FOR EVERY TASK

Follow this sequence for every task, no exceptions:

```
Step 1  Read this skill (already done if you are reading this)
Step 2  Present a written implementation plan to the user
Step 3  Wait for explicit confirmation ("yes", "go ahead", "approved", etc.)
Step 4  Implement — one logical unit at a time
Step 5  After each file or feature, explain what was done and why
Step 6  Update README.md with what was built
Step 7  Ask: "Ready to continue to [next item]?"
```

If the user says "just do it" or "go ahead with everything", still pause at
major decision points (schema changes, new dependencies, AI integration design)
and confirm before proceeding.

---

## PROJECT HIERARCHY

```
Subject        (admin-created)   e.g. DSA, System Design, Interview Prep
  Topic        (admin-created)   e.g. Sorting Algorithms, Dynamic Programming
    Note       (user-created)    e.g. Merge Sort Complete Guide
      Section  (user-created)    e.g. Concept, Code, Complexity Analysis
```

Subjects hold denormalized `topicsCount` and `notesCount` for fast homepage
rendering without expensive COUNT queries. Topics hold `notesCount` and
`lastUpdated`. These are updated atomically in Prisma transactions whenever
topics or notes are created, published, or deleted.

---

## DIRECTORY STRUCTURE

```
recallstack/
  frontend/                    Next.js 14 app
    src/
      app/
        layout.js
        page.js                Homepage — subject cards grid
        (auth)/
          login/page.js
          register/page.js
          forgot-password/page.js
        learning/
          page.js              Subject listing
          [subject]/page.js    Topics for a subject
          [subject]/[topic]/page.js          Notes for a topic
          [subject]/[topic]/[slug]/page.js   Single note with sections
        my-learnings/
          page.js              My notes list
          create/page.js       Create note
          [id]/edit/page.js    Edit note and sections
        bookmarks/page.js
        search/page.js
        revision-tracker/page.js
        dashboard/
          page.js
          analytics/page.js
          settings/page.js
        admin/
          layout.js
          page.js
          subjects/page.js
          topics/page.js
          moderation/page.js
          analytics/page.js
        sitemap.js
        robots.js
        rss.xml.js
      components/
        layout/      Header.js  Sidebar.js  Footer.js  Navigation.js
        home/        SubjectCard.js  SubjectGrid.js  HeroSection.js
        learning/    TopicList.js  TopicCard.js  NoteCard.js  NoteList.js  RelatedNotes.js
        note/        NoteHeader.js  SectionContent.js  SectionsList.js  CodeBlock.js  NoteActions.js
        editor/      NoteEditor.js  SectionEditor.js  CodeSnippetEditor.js  PublishSettings.js
        revision/    RevisionTracker.js  RevisionTimeline.js  RevisionStats.js
        comments/    CommentForm.js  CommentList.js  CommentItem.js
        admin/       SubjectManager.js  TopicManager.js  ModerationPanel.js
        common/      Button.js  Input.js  SearchBar.js  Badge.js  Loading.js
      hooks/         useAuth.js  useNote.js  useRevision.js  useSearch.js  useSections.js
      services/      apiClient.js  authService.js  subjectService.js  topicService.js
                     noteService.js  sectionService.js  revisionService.js  analyticsService.js
      store/         authStore.js  noteStore.js  uiStore.js
      lib/           seo.js  og-image.js  formatters.js
      utils/         cn.js  constants.js
    next.config.js
    tailwind.config.js
    package.json
    .env.local

  backend/                     Node.js + Express API
    src/
      config/        database.js  email.js  jwt.js  constants.js
      controllers/   auth  subject  topic  note  section  comment
                     revision  bookmark  search  analytics
      routes/        (mirrors controllers)
      middleware/    auth  validation  rateLimit  admin  errorHandler  cors
      services/      (mirrors controllers plus email)
      repositories/  note  section  user  revision
      validators/    auth  note  section  comment
      utils/         jwt.js  bcrypt.js  slugify.js  logger.js
      templates/     welcome-email.html  new-note.html
      app.js
      server.js
    package.json
    .env

  prisma/
    schema.prisma
    migrations/
    seed.js

  docs/
    API.md
    ARCHITECTURE.md
    DEPLOYMENT.md

  README.md                    Living document — updated after every phase
```

---

## DATABASE SCHEMA (Prisma)

The full schema is in the architecture document. Key decisions to remember:

- `Subject` has `topicsCount` and `notesCount` (denormalized integers).
- `Topic` has `notesCount` and `lastUpdated` (denormalized).
- `Note` has `readingTime` (calculated from section content length).
- `Section` has `contentType` enum: TEXT, CODE, EXAMPLE, IMAGE, DIAGRAM.
- `Note` has `difficulty` enum: EASY, MEDIUM, HARD.
- `Note` has `status` enum: DRAFT, PUBLISHED, ARCHIVED.
- `Comment` supports nested replies via self-referential `parentId`.
- `RevisionHistory` tracks every note save with userId and timestamp.
- All cascade deletes are set: deleting a Subject cascades to Topics, Notes,
  Sections, RevisionHistory, Comments, Bookmarks.

Denormalized count update pattern (always use Prisma transactions):
```js
// When a note is published under a topic
await prisma.$transaction([
  prisma.topic.update({ where: { id: topicId }, data: { notesCount: { increment: 1 }, lastUpdated: new Date() } }),
  prisma.subject.update({ where: { id: subjectId }, data: { notesCount: { increment: 1 } } }),
]);
```

---

## API ENDPOINTS

All routes are prefixed `/api`. Admin-only routes require the `admin`
middleware. Authenticated routes require the `auth` middleware.

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  POST   /api/auth/refresh
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password

Subjects  (GET: public, POST/PUT/DELETE: admin)
  GET    /api/subjects
  GET    /api/subjects/:id
  POST   /api/subjects
  PUT    /api/subjects/:id
  DELETE /api/subjects/:id

Topics  (GET: public, write: admin)
  GET    /api/subjects/:subjectId/topics
  POST   /api/subjects/:subjectId/topics
  PUT    /api/topics/:id
  DELETE /api/topics/:id

Notes  (GET published: public, write: authenticated)
  GET    /api/topics/:topicId/notes
  POST   /api/notes
  GET    /api/notes/:id
  PUT    /api/notes/:id
  DELETE /api/notes/:id

Sections  (write: authenticated note owner or admin)
  POST   /api/notes/:noteId/sections
  PUT    /api/sections/:id
  DELETE /api/sections/:id
  PATCH  /api/sections/:id/reorder

Search  (public)
  GET    /api/search?q=query
  GET    /api/search/subjects?q=query
  GET    /api/search/topics?q=query

Comments  (GET: public, POST: authenticated, moderation: admin)
  GET    /api/notes/:noteId/comments
  POST   /api/notes/:noteId/comments
  DELETE /api/comments/:id

Bookmarks  (authenticated)
  GET    /api/bookmarks
  POST   /api/bookmarks
  DELETE /api/bookmarks/:noteId

Analytics  (admin)
  GET    /api/analytics/overview
  GET    /api/analytics/notes/:noteId

Revisions  (authenticated)
  GET    /api/notes/:noteId/revisions
```

---

## IMPLEMENTATION PHASES

Each phase has a gate: the agent must present a completion report, list what
was built, and get user sign-off before starting the next phase. The README
must be updated at the end of every phase.

### Phase 1 — Core Infrastructure (Weeks 1-3)

**Week 1: Auth + Subject/Topic Management**
- Project scaffolding (monorepo, both packages)
- PostgreSQL setup, Prisma schema, first migration
- User auth (register, login, JWT, refresh tokens)
- Admin middleware and role guard
- Subject CRUD (admin only) with denormalized count logic
- Topic CRUD under subjects
- README: project setup, env vars, how to run locally

**Week 2: Note + Section CRUD**
- Note creation under topics
- Section management: add, edit, delete, reorder
- Section types: TEXT, CODE, EXAMPLE, IMAGE, DIAGRAM
- Draft/Published/Archived workflow
- Reading time calculation from section content
- RevisionHistory entry on every save
- README: note and section API documentation

**Week 3: Frontend — Homepage + Learning Pages**
- Next.js project setup with Tailwind and App Router
- SubjectGrid homepage (subject cards with live counts)
- Subject page (topic list)
- Topic page (note list)
- Note page (sections display with table of contents)
- Navigation, Header, Footer
- README: frontend structure and routing

**Phase 1 gate deliverable:** Admin can create subjects and topics. Users can
create notes with sections. Users can browse the full Subject > Topic > Note >
Section hierarchy.

---

### Phase 2 — Search + SEO (Weeks 4-5)

**Week 4: SEO**
- Dynamic metadata in Next.js layout and page files
- JSON-LD schema: Article, BreadcrumbList, WebSite
- Sitemap generation at /sitemap.xml
- Robots.txt at /robots.txt
- Open Graph tags for every page
- RSS feed at /rss.xml
- AI crawler-friendly: structured data, semantic HTML, descriptive alt text
- README: SEO decisions, sitemap structure, schema types used

**Week 5: Search + Revision Tracking**
- Full-text search across subjects, topics, notes, sections using PostgreSQL
  tsvector or pg_trgm (confirm with user which approach)
- Search filters: difficulty, subject, topic
- Revision timeline UI component
- Most-revised notes view
- README: search implementation, revision tracking

**Phase 2 gate deliverable:** Search working end-to-end. SEO audit score 90+.
Sitemap indexed. Revision timeline visible.

---

### Phase 3 — Engagement (Weeks 6-7)

**Week 6: Comments + Bookmarks**
- Nested comments on notes (up to 2 levels)
- Comment moderation (admin approve/reject)
- Bookmark/save functionality
- My Learnings page (user's notes and bookmarks)
- Drafts management

**Week 7: Analytics + Dashboard**
- User dashboard: learning progress, notes count, revision streak
- Most revised notes
- Learning timeline
- Reading stats
- Admin analytics: top notes, active users, content coverage
- README: analytics data model, dashboard components

**Phase 3 gate deliverable:** Comments, bookmarks, and dashboards fully
functional.

---

### Phase 4 — AI Features (integrated throughout, formalized in week 8)

AI features use both Claude (Anthropic) and Gemini (Google). Confirm with
the user which feature uses which model before implementing.

Planned AI features (confirm scope before building each):
- AI summary of a note (on note page, one-click)
- AI-generated quiz from note content for interview practice
- AI suggested related notes
- AI writing assistant in the section editor (improve, simplify, expand)
- AI-powered search re-ranking (semantic similarity)

All AI calls must:
- Be rate-limited per user
- Show loading and error states in the UI
- Never block page render (always async, progressive)
- Log token usage per request for cost tracking

---

### Phase 5 — Polish + Deployment (Week 8)

- Mobile responsiveness audit and fixes
- Performance: lazy loading, image optimization, bundle analysis
- Email notifications (welcome, new note in subscribed subject)
- Error boundary components
- Final deployment (confirm platform: Vercel for frontend, confirm for backend)
- README: deployment guide, environment variables, production checklist

---

## CODE QUALITY STANDARDS

### File Header Comment (required on every file)

```js
/*
 * FILE: src/controllers/subject.controller.js
 *
 * PURPOSE:
 * Handles HTTP request and response logic for Subject endpoints.
 * Subjects are the top level of the 4-level hierarchy (Subject > Topic > Note > Section).
 * This controller delegates business logic to subject.service.js and returns
 * standardized JSON responses.
 *
 * ROUTES SERVED:
 * GET    /api/subjects
 * GET    /api/subjects/:id
 * POST   /api/subjects        (admin only)
 * PUT    /api/subjects/:id    (admin only)
 * DELETE /api/subjects/:id    (admin only)
 */
```

### Function Comment (required on every exported or complex function)

```js
/*
 * createSubject
 *
 * Creates a new subject and initializes its denormalized counts to 0.
 * Only admins can call this; the admin middleware runs before this controller.
 *
 * @param {object} req.body - { name, slug, description, icon, color, order }
 * @returns {201} The created subject object
 * @returns {400} If slug already exists or required fields are missing
 */
```

### Inline Comment Rules

- Comment non-obvious logic, not obvious assignments.
- Explain WHY a decision was made if it is not self-evident.
- Mark all TODO items with: `// TODO: [description] — [reason not done yet]`

```js
// Bad comment (states the obvious)
const slug = slugify(name); // slugify the name

// Good comment (explains the why)
// Slugs are generated at creation and never regenerated on update.
// Changing a slug would break existing URLs and SEO indexing.
const slug = slugify(name);
```

---

## SEO RULES

Every public page must have:
- Unique `<title>` and `<meta name="description">`
- Open Graph: og:title, og:description, og:image, og:url, og:type
- Twitter card meta tags
- Canonical URL
- JSON-LD structured data appropriate to the page type

Page-specific JSON-LD schema types:
- Homepage: WebSite + SearchAction
- Subject page: CollectionPage
- Topic page: CollectionPage + BreadcrumbList
- Note page: Article + BreadcrumbList + Person (author)

AI crawler support:
- `/llms.txt` at the root listing available content structure
- Semantic HTML5 elements (article, section, nav, main, aside)
- Descriptive alt attributes on all images
- Structured headings (single h1 per page, logical h2/h3 hierarchy)
- No content hidden behind JavaScript-only renders for core reading content
  (use Next.js SSR or SSG for note pages)

---

## UI / UX STANDARDS

The platform must feel like a premium knowledge tool, not a generic blog.

Design principles:
- Clean, high-contrast typography. Reading is the primary activity.
- Consistent spacing system. Use Tailwind's spacing scale — do not use
  arbitrary pixel values.
- Subject cards on the homepage must show icon, name, description, topic count,
  and note count. They must be visually distinct and inviting.
- Code sections must use syntax highlighting (Shiki or Prism — confirm with user
  before installing).
- Table of contents on note pages must be sticky on desktop.
- Mobile: the sidebar collapses. The TOC moves to a bottom sheet or accordion.
- Every interactive element must have a visible focus state for accessibility.
- Color palette: confirm with user before finalizing. Do not assume.
- No Lorem Ipsum in the codebase, ever.

Component rules:
- All shared UI components live in `components/common/`.
- No inline styles. Use Tailwind utility classes only.
- Each component file exports exactly one component as the default export.
- Props must be destructured at the top of the function signature.

---

## README UPDATE PROTOCOL

After every phase and every significant feature, update README.md with:

```
## What Was Built

### [Phase Name] — [Date Completed]

What was built:
- [File or feature 1] — [one sentence explanation]
- [File or feature 2] — [one sentence explanation]

How to test it:
- [Step-by-step instructions a developer can follow right now]

Known limitations or next steps:
- [Anything deferred or intentionally incomplete]
```

The README must always contain:
- Project overview and tagline
- Tech stack table
- Environment variables list with descriptions (no actual secrets)
- How to run locally (exact commands)
- How to run migrations
- Phase completion log
- API endpoint reference (link to docs/API.md)

---

## DEPENDENCY DECISIONS

Confirm all dependency choices with the user before `npm install`.

Known planned dependencies (frontend):
- next 14, react, react-dom
- tailwindcss, postcss, autoprefixer
- @anthropic-ai/sdk
- @google/generative-ai
- zustand (state management — confirm)
- shiki or prism-react-renderer (code highlighting — confirm)
- next-seo (confirm if using, or use native Next.js metadata API)

Known planned dependencies (backend):
- express
- @prisma/client, prisma
- jsonwebtoken
- bcryptjs
- zod (validation)
- nodemailer
- express-rate-limit
- cors
- helmet
- morgan (logging)
- winston (structured logging — confirm)
- slugify

---

## AI INTEGRATION PATTERN

```js
/*
 * All AI calls follow this pattern to ensure consistent error handling,
 * rate limiting, and token tracking.
 */

async function callAI(provider, prompt, options = {}) {
  // provider: "claude" | "gemini"
  // This wrapper enforces rate limits, logs token usage,
  // and normalizes the response format across providers.
}
```

Claude (Anthropic) is used for: writing assistance, note summarization, quiz
generation.

Gemini (Google) is used for: semantic search re-ranking, related note
suggestions.

Confirm this split with the user before implementing any AI feature.

---

## BEFORE STARTING ANY PHASE

Ask the user to confirm:
1. All dependencies for the phase are approved.
2. Any environment variables needed are documented (not their values).
3. The deliverable criteria are agreed upon.
4. Any design decisions (color palette, component library choices, specific
   library versions) that affect the phase output are confirmed.

Never assume. Never hallucinate. If uncertain, ask.
