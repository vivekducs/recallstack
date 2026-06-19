# RECALLSTACK - FINAL ARCHITECTURE v2 (4-LEVEL HIERARCHY)

**Tagline:** "Learn Once. Recall Anytime."

**Concept:** Personal knowledge management platform with Subject → Topic → Note → Section hierarchy. Homepage shows subject cards with real-time metadata (topics count, notes count).

---

## PLATFORM HIERARCHY (4 LEVELS)

```
Subject (Admin Created)
│   └─ Metadata: Topics: 15, Notes: 82, Icon, Color
│
├── Topic (Admin Created)
│   │  └─ Metadata: Notes: 12, Last Updated: 2 days ago
│   │
│   ├── Note (User Created)
│   │   │  └─ Metadata: Sections: 4, Reading Time: 8min
│   │   │
│   │   ├── Section (User Created)
│   │   │   └─ Content: Text, Code, Examples, Images
│   │   │
│   │   ├── Section
│   │   └── Section
│   │
│   ├── Note
│   └── Note
│
├── Topic
└── Topic
```

**Examples:**

```
Subject: DSA
├─ Topics: 12 | Notes: 85 | Icon: 📊

  Topic: Sorting Algorithms
  ├─ Notes: 8
  
    Note: Merge Sort Complete Guide
    ├─ Section: Concept Explanation
    ├─ Section: Code Implementation
    ├─ Section: Time Complexity Analysis
    └─ Section: Practice Problems

    Note: Quick Sort Optimization
    ├─ Section: Algorithm Overview
    ├─ Section: Pivot Selection Strategies
    └─ Section: Common Pitfalls

  Topic: Dynamic Programming
  ├─ Notes: 12

Subject: System Design
├─ Topics: 8 | Notes: 45 | Icon: 🏗️

Subject: Interview Prep
├─ Topics: 15 | Notes: 120 | Icon: 🎯
```

---

## UPDATED DATABASE SCHEMA

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==================== SUBJECTS ====================
model Subject {
  id          String   @id @default(cuid())
  name        String   @unique          // "DSA"
  slug        String   @unique
  description String?
  icon        String?                   // Icon emoji or URL
  color       String?                   // Hex color for card
  order       Int      @default(0)      // Display order
  
  // Metadata (denormalized for performance)
  topicsCount Int      @default(0)      // Auto-updated
  notesCount  Int      @default(0)      // Auto-updated
  
  topics      Topic[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("subjects")
}

// ==================== TOPICS ====================
model Topic {
  id          String   @id @default(cuid())
  name        String                    // "Sorting Algorithms"
  slug        String
  description String?
  order       Int      @default(0)
  
  subjectId   String
  subject     Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  
  // Metadata (denormalized)
  notesCount  Int      @default(0)      // Auto-updated
  lastUpdated DateTime @default(now())  // Latest note update
  
  notes       Note[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([subjectId, slug])
  @@index([subjectId])
  @@map("topics")
}

// ==================== NOTES ====================
model Note {
  id          String   @id @default(cuid())
  title       String
  slug        String
  excerpt     String?
  
  // SEO fields
  seoTitle    String?
  seoDescription String?
  seoKeywords String?
  ogImage     String?
  
  // Content metadata
  readingTime Int?                      // Minutes
  difficulty  Difficulty @default(MEDIUM) // EASY, MEDIUM, HARD
  tags        String[]                  // Array of tags
  
  // Revision tracking
  revisionHistory RevisionHistory[]
  lastRevised DateTime?
  revisionCount Int @default(0)
  
  // Engagement
  views       Int      @default(0)
  helpfulCount Int     @default(0)
  
  // Relationships
  topicId     String
  topic       Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
  
  authorId    String
  author      User     @relation("NoteAuthor", fields: [authorId], references: [id], onDelete: Cascade)
  
  sections    Section[]
  comments    Comment[]
  bookmarks   Bookmark[]
  
  status      NoteStatus @default(DRAFT)
  publishedAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([topicId])
  @@index([slug])
  @@index([authorId])
  @@map("notes")
}

// ==================== SECTIONS ====================
model Section {
  id          String   @id @default(cuid())
  title       String
  order       Int      @default(0)      // Display order
  
  content     String                    // MDX content
  contentType SectionType @default(TEXT) // TEXT, CODE, EXAMPLE, IMAGE
  
  // Code snippet metadata (if contentType = CODE)
  language    String?                   // javascript, python, cpp
  
  noteId      String
  note        Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([noteId])
  @@map("sections")
}

// ==================== REVISIONS ====================
model RevisionHistory {
  id        String   @id @default(cuid())
  noteId    String
  note      Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  revisedAt DateTime @default(now())
  
  @@index([noteId])
  @@index([userId])
  @@map("revision_history")
}

// ==================== USERS ====================
model User {
  id            String   @id @default(cuid())
  name          String
  username      String   @unique
  email         String   @unique
  passwordHash  String
  avatar        String?
  bio           String?
  role          Role     @default(USER)
  
  notes         Note[]   @relation("NoteAuthor")
  comments      Comment[]
  bookmarks     Bookmark[]
  revisions     RevisionHistory[]
  subscribers   Subscriber[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("users")
}

// ==================== BOOKMARKS ====================
model Bookmark {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  noteId    String
  note      Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([userId, noteId])
  @@index([userId])
  @@map("bookmarks")
}

// ==================== COMMENTS ====================
model Comment {
  id        String   @id @default(cuid())
  content   String
  status    CommentStatus @default(PENDING)
  
  noteId    String
  note      Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  parentId  String?
  parent    Comment? @relation("Replies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   Comment[] @relation("Replies")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([noteId])
  @@index([userId])
  @@map("comments")
}

// ==================== SUBSCRIBERS ====================
model Subscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  createdAt DateTime @default(now())
  
  @@map("subscribers")
}

// ==================== ANALYTICS ====================
model Analytics {
  id          String   @id @default(cuid())
  noteId      String
  views       Int      @default(0)
  uniqueViews Int      @default(0)
  avgReadTime Int?
  helpfulClicks Int   @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("analytics")
}

// ==================== ENUMS ====================
enum Role {
  USER
  ADMIN
}

enum NoteStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum CommentStatus {
  PENDING
  APPROVED
  REJECTED
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum SectionType {
  TEXT
  CODE
  EXAMPLE
  IMAGE
  DIAGRAM
}
```

---

## UPDATED DIRECTORY STRUCTURE

```
recallstack/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js
│   │   │   ├── page.js                    # HOMEPAGE - Subject cards
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.js
│   │   │   │   ├── register/page.js
│   │   │   │   └── forgot-password/page.js
│   │   │   │
│   │   │   ├── learning/
│   │   │   │   ├── page.js                # Subject recommendation (same as home)
│   │   │   │   ├── [subject]/page.js      # Topic list for subject
│   │   │   │   ├── [subject]/[topic]/page.js # Note list for topic
│   │   │   │   └── [subject]/[topic]/[slug]/page.js # Single note with sections
│   │   │   │
│   │   │   ├── my-learnings/
│   │   │   │   ├── page.js                # My notes list
│   │   │   │   ├── create/page.js         # Create note (select subject/topic)
│   │   │   │   └── [id]/edit/page.js      # Edit note + sections
│   │   │   │
│   │   │   ├── bookmarks/page.js          # Saved notes
│   │   │   ├── search/page.js             # Global search
│   │   │   ├── revision-tracker/page.js   # Revision history
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── page.js                # User dashboard
│   │   │   │   ├── analytics/page.js      # Learning stats
│   │   │   │   └── settings/page.js
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── layout.js
│   │   │   │   ├── page.js
│   │   │   │   ├── subjects/page.js       # Manage subjects
│   │   │   │   ├── topics/page.js         # Manage topics
│   │   │   │   ├── moderation/page.js
│   │   │   │   └── analytics/page.js
│   │   │   │
│   │   │   ├── sitemap.js
│   │   │   ├── robots.js
│   │   │   └── rss.xml.js
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.js
│   │   │   │   ├── Sidebar.js
│   │   │   │   ├── Footer.js
│   │   │   │   └── Navigation.js
│   │   │   │
│   │   │   ├── home/
│   │   │   │   ├── SubjectCard.js         # Card: DSA | Topics: 12 | Notes: 85
│   │   │   │   ├── SubjectGrid.js         # Grid of subject cards
│   │   │   │   └── HeroSection.js         # Welcome banner
│   │   │   │
│   │   │   ├── learning/
│   │   │   │   ├── TopicList.js           # List topics in subject
│   │   │   │   ├── TopicCard.js
│   │   │   │   ├── NoteCard.js
│   │   │   │   ├── NoteList.js
│   │   │   │   └── RelatedNotes.js
│   │   │   │
│   │   │   ├── note/
│   │   │   │   ├── NoteHeader.js          # Title, difficulty, reading time
│   │   │   │   ├── SectionContent.js      # Render section (text/code/example)
│   │   │   │   ├── SectionsList.js        # Table of contents
│   │   │   │   ├── CodeBlock.js           # Code highlighting
│   │   │   │   └── NoteActions.js         # Bookmark, helpful, share
│   │   │   │
│   │   │   ├── editor/
│   │   │   │   ├── NoteEditor.js          # Edit note metadata
│   │   │   │   ├── SectionEditor.js       # Add/edit sections
│   │   │   │   ├── CodeSnippetEditor.js   # Code section editor
│   │   │   │   └── PublishSettings.js
│   │   │   │
│   │   │   ├── revision/
│   │   │   │   ├── RevisionTracker.js
│   │   │   │   ├── RevisionTimeline.js
│   │   │   │   └── RevisionStats.js
│   │   │   │
│   │   │   ├── comments/
│   │   │   │   ├── CommentForm.js
│   │   │   │   ├── CommentList.js
│   │   │   │   └── CommentItem.js
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── SubjectManager.js
│   │   │   │   ├── TopicManager.js
│   │   │   │   └── ModerationPanel.js
│   │   │   │
│   │   │   └── common/
│   │   │       ├── Button.js
│   │   │       ├── Input.js
│   │   │       ├── SearchBar.js
│   │   │       ├── Badge.js
│   │   │       └── Loading.js
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useNote.js
│   │   │   ├── useRevision.js
│   │   │   ├── useSearch.js
│   │   │   └── useSections.js
│   │   │
│   │   ├── services/
│   │   │   ├── apiClient.js
│   │   │   ├── authService.js
│   │   │   ├── subjectService.js         # GET all subjects with counts
│   │   │   ├── topicService.js
│   │   │   ├── noteService.js
│   │   │   ├── sectionService.js
│   │   │   ├── revisionService.js
│   │   │   └── analyticsService.js
│   │   │
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   ├── noteStore.js
│   │   │   └── uiStore.js
│   │   │
│   │   ├── lib/
│   │   │   ├── seo.js
│   │   │   ├── og-image.js
│   │   │   └── formatters.js
│   │   │
│   │   └── utils/
│   │       ├── cn.js
│   │       └── constants.js
│   │
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.local
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── email.js
│   │   │   ├── jwt.js
│   │   │   └── constants.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── subject.controller.js
│   │   │   ├── topic.controller.js
│   │   │   ├── note.controller.js
│   │   │   ├── section.controller.js      # NEW
│   │   │   ├── comment.controller.js
│   │   │   ├── revision.controller.js
│   │   │   ├── bookmark.controller.js
│   │   │   ├── search.controller.js
│   │   │   └── analytics.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── subject.routes.js
│   │   │   ├── topic.routes.js
│   │   │   ├── note.routes.js
│   │   │   ├── section.routes.js          # NEW
│   │   │   ├── comment.routes.js
│   │   │   ├── revision.routes.js
│   │   │   ├── bookmark.routes.js
│   │   │   ├── search.routes.js
│   │   │   └── analytics.routes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   ├── rateLimit.middleware.js
│   │   │   ├── admin.middleware.js
│   │   │   ├── errorHandler.middleware.js
│   │   │   └── cors.middleware.js
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── subject.service.js
│   │   │   ├── topic.service.js
│   │   │   ├── note.service.js
│   │   │   ├── section.service.js         # NEW
│   │   │   ├── comment.service.js
│   │   │   ├── revision.service.js
│   │   │   ├── bookmark.service.js
│   │   │   ├── email.service.js
│   │   │   ├── search.service.js
│   │   │   └── analytics.service.js
│   │   │
│   │   ├── repositories/
│   │   │   ├── note.repository.js
│   │   │   ├── section.repository.js      # NEW
│   │   │   ├── user.repository.js
│   │   │   └── revision.repository.js
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── note.validator.js
│   │   │   ├── section.validator.js       # NEW
│   │   │   └── comment.validator.js
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── bcrypt.js
│   │   │   ├── slugify.js
│   │   │   └── logger.js
│   │   │
│   │   ├── templates/
│   │   │   ├── welcome-email.html
│   │   │   └── new-note.html
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
│
└── docs/
    ├── API.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md

```

---

## KEY CHANGES FROM PREVIOUS VERSION

### **1. Homepage (NEW)**

**Before:** Blog grid with articles

**Now:** Subject cards grid showing:
```
┌─────────────────┐
│  📊 DSA         │
│                 │
│ Topics: 12      │
│ Notes: 85       │
│                 │
│ [View Subjects] │
└─────────────────┘
```

- Only shows subjects with topics + notes
- Real-time count updates
- Icon + color per subject
- No hardcoded subjects

### **2. 4-Level Hierarchy**

**Before:**
```
Blog → Categories → Posts
```

**Now:**
```
Subject → Topic → Note → Section
```

- **Subject:** Admin-created (DSA, System Design, etc.)
- **Topic:** Admin-created under subject (Sorting, DP, etc.)
- **Note:** User-created under topic (Merge Sort guide, etc.)
- **Section:** User-created under note (Concept, Code, Analysis, etc.)

### **3. Section Support**

Each note has multiple sections:
- **TEXT:** Rich text content
- **CODE:** Code snippet with syntax highlighting
- **EXAMPLE:** Real-world examples
- **IMAGE:** Diagrams, charts
- **DIAGRAM:** ASCII or drawn diagrams

### **4. Denormalized Metadata**

**Why:** Avoid expensive COUNT queries on homepage

```prisma
Subject {
  topicsCount Int      // Auto-updated on topic create/delete
  notesCount Int       // Auto-updated on note create/delete
}

Topic {
  notesCount Int       // Auto-updated
  lastUpdated DateTime // Latest note update
}

Note {
  readingTime Int      // Calculated from sections
}
```

---

## UPDATED API ENDPOINTS

### **Subjects**
```
GET /api/subjects                          # Get all (with counts)
GET /api/subjects/:id                      # Get single subject
POST /api/subjects                         # Create (admin)
PUT /api/subjects/:id                      # Update (admin)
DELETE /api/subjects/:id                   # Delete (admin)
```

### **Topics**
```
GET /api/subjects/:subjectId/topics        # Get topics by subject
POST /api/subjects/:subjectId/topics       # Create (admin)
PUT /api/topics/:id                        # Update (admin)
DELETE /api/topics/:id                     # Delete (admin)
```

### **Notes**
```
GET /api/topics/:topicId/notes             # Get notes by topic
POST /api/notes                            # Create note
GET /api/notes/:id                         # Get single note with sections
PUT /api/notes/:id                         # Update note metadata
DELETE /api/notes/:id                      # Delete note
```

### **Sections (NEW)**
```
POST /api/notes/:noteId/sections           # Add section
PUT /api/sections/:id                      # Update section
DELETE /api/sections/:id                   # Delete section
PATCH /api/sections/:id/reorder            # Reorder sections
```

### **Search**
```
GET /api/search?q=query                    # Search notes + sections
GET /api/search/subjects?q=query           # Search subjects
GET /api/search/topics?q=query             # Search topics
```

---

## IMPLEMENTATION PHASES (8 WEEKS - UPDATED)

### **PHASE 1: CORE (Weeks 1-3)**

#### **Week 1: Auth + Subject/Topic Management**
- User authentication
- Admin panel
- Subject CRUD (admin only)
- Topic CRUD under subjects
- Denormalized counts

**Deliverable:** Admin can create subjects + topics, counts auto-update

---

#### **Week 2: Note + Section CRUD**
- Note creation under topics
- Section management (add/edit/delete/reorder)
- Section types (TEXT, CODE, EXAMPLE, IMAGE)
- Code syntax highlighting
- Draft/published workflow

**Deliverable:** Users can create notes with multiple sections

---

#### **Week 3: Frontend - Homepage + Learning Pages**
- **Homepage:** Subject cards grid (real-time counts)
- **Subject Page:** Topics list for subject
- **Topic Page:** Notes list for topic
- **Note Page:** Sections display with TOC
- Navigation structure

**Deliverable:** Users can browse subjects → topics → notes → sections

---

### **PHASE 2: SEARCH + SEO (Weeks 4-5)**

#### **Week 4: SEO Implementation**
- Dynamic meta tags
- JSON-LD schema (Article, Breadcrumb)
- Sitemap generation
- Robots.txt
- Open Graph tags
- RSS feed

**Deliverable:** SEO audit 90+, homepage indexed

---

#### **Week 5: Search + Revision Tracking**
- Full-text search (subjects, topics, notes, sections)
- Search filters (difficulty, subject, topic)
- Revision tracking
- Revision timeline

**Deliverable:** Search working, revision tracking visible

---

### **PHASE 3: ENGAGEMENT (Weeks 6-7)**

#### **Week 6: Comments + Bookmarks**
- Comments on notes (nested replies)
- Bookmark/save functionality
- My Learnings page
- Drafts management

**Deliverable:** Comments + bookmarks functional

---

#### **Week 7: Analytics + Dashboard**
- User dashboard (learning progress)
- Most revised notes
- Learning timeline
- Reading stats

**Deliverable:** Analytics dashboard complete

---

### **PHASE 4: POLISH (Week 8)**

#### **Week 8: Testing + Deployment**
- Bug fixes
- Performance optimization
- Mobile responsiveness
- Email notifications
- Final deployment

**Deliverable:** Production-ready RecallStack

---

## DATABASE COUNTS (AUTO-UPDATE)

**When subject is created:**
- `Subject.topicsCount = 0`
- `Subject.notesCount = 0`

**When topic is created under subject:**
```sql
UPDATE subjects SET topicsCount = topicsCount + 1 WHERE id = subjectId
```

**When note is published under topic:**
```sql
UPDATE topics SET notesCount = notesCount + 1 WHERE id = topicId
UPDATE subjects SET notesCount = notesCount + 1 WHERE id = subjectId
```

**When note is deleted:**
```sql
UPDATE topics SET notesCount = notesCount - 1 WHERE id = topicId
UPDATE subjects SET notesCount = notesCount - 1 WHERE id = subjectId
```

---

## HOMEPAGE COMPONENT

```jsx
// frontend/src/components/home/SubjectGrid.js

export default function SubjectGrid() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch all subjects with counts
    fetch(`${API_URL}/api/subjects`)
      .then(res => res.json())
      .then(data => {
        setSubjects(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingGrid />

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
      {subjects.map(subject => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          topicsCount={subject.topicsCount}
          notesCount={subject.notesCount}
        />
      ))}
    </div>
  )
}

// frontend/src/components/home/SubjectCard.js

export default function SubjectCard({ subject }) {
  return (
    <Link href={`/learning/${subject.slug}`}>
      <div className="p-6 border rounded-lg hover:shadow-lg transition">
        <div className="text-4xl mb-4">{subject.icon}</div>
        <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
        <div className="flex justify-between text-gray-500">
          <span>Topics: {subject.topicsCount}</span>
          <span>Notes: {subject.notesCount}</span>
        </div>
      </div>
    </Link>
  )
}
```

---

## KEY ADVANTAGES OF THIS STRUCTURE

✅ **Knowledge Repository Feel** - Subject cards instead of blog articles
✅ **Real-time Metadata** - Always accurate topic/note counts
✅ **4-Level Clarity** - Clear information hierarchy
✅ **No Hardcoding** - All data from database
✅ **Scalable** - Can add infinite subjects/topics
✅ **SEO Friendly** - Each subject/topic/note gets unique URL
✅ **User Discovery** - Browse structure vs. search-first
✅ **Admin Control** - Full subject/topic management
✅ **Section Flexibility** - Different content types (code, text, examples)
✅ **Revision Tracking** - Learn-and-review workflow

---

## START HERE (File Priority)

1. `backend/src/app.js`
2. `prisma/schema.prisma` (4-level schema)
3. `backend/src/routes/subject.routes.js`
4. `backend/src/routes/topic.routes.js`
5. `backend/src/routes/note.routes.js`
6. `backend/src/routes/section.routes.js`
7. `frontend/src/app/page.js` (homepage)
8. `frontend/src/components/home/SubjectGrid.js`

---

## FINAL VERDICT

**This is vastly superior to original blog outline.**

- Subject cards homepage = knowledge discovery
- 4-level hierarchy = information clarity
- Denormalized counts = performance
- Real-time metadata = accurate data
- No hardcoding = scalability

**Ship it. RecallStack is ready.**

