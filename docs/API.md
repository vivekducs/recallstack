# RecallStack API Reference

This document details the REST API endpoints available in the RecallStack backend for Phase 1. All endpoints are prefixed with `/api`.

---

## 1. Authentication (`/api/auth`)

### Register User
* **Method & Path**: `POST /api/auth/register`
* **Auth Required**: No
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "userId": "cuid_user_id",
    "role": "USER"
  }
  ```

### Login User
* **Method & Path**: `POST /api/auth/login`
* **Auth Required**: No
* **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "userId": "cuid_user_id",
    "role": "USER",
    "name": "John Doe",
    "username": "johndoe"
  }
  ```

### Get Current User Profile
* **Method & Path**: `GET /api/auth/me`
* **Auth Required**: Yes (Bearer Token)
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "id": "cuid_user_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": null,
    "bio": null,
    "role": "USER",
    "createdAt": "2026-06-18T10:00:00.000Z"
  }
  ```

---

## 2. Subjects (`/api/subjects`)

### Get All Subjects
* **Method & Path**: `GET /api/subjects`
* **Auth Required**: No
* **Note**: Should filter out subjects with 0 topics (to be corrected in code).
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "cuid_subject_id",
      "name": "Data Structures & Algorithms",
      "slug": "dsa",
      "description": "Master fundamental DS and algorithms...",
      "icon": "📊",
      "color": "#6366f1",
      "topicsCount": 4,
      "notesCount": 1
    }
  ]
  ```

### Get Subject Details
* **Method & Path**: `GET /api/subjects/:id` (supports passing either cuid ID or unique slug)
* **Auth Required**: No
* **Success Response (200 OK)**:
  ```json
  {
    "id": "cuid_subject_id",
    "name": "Data Structures & Algorithms",
    "slug": "dsa",
    "description": "...",
    "icon": "📊",
    "color": "#6366f1",
    "topicsCount": 4,
    "notesCount": 1,
    "topics": [
      {
        "id": "cuid_topic_id",
        "name": "Sorting Algorithms",
        "slug": "sorting-algorithms",
        "description": "...",
        "notesCount": 1,
        "lastUpdated": "2026-06-18T10:00:00.000Z"
      }
    ]
  }
  ```

### Create Subject (Admin Only)
* **Method & Path**: `POST /api/subjects`
* **Auth Required**: Yes (Admin only)
* **Request Body**:
  ```json
  {
    "name": "Web Development",
    "slug": "web-development",
    "description": "Learn full stack web dev...",
    "icon": "🌐",
    "color": "#06b6d4"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "id": "cuid_new_subject_id",
    "name": "Web Development",
    "slug": "web-development",
    "description": "...",
    "icon": "🌐",
    "color": "#06b6d4",
    "topicsCount": 0,
    "notesCount": 0
  }
  ```

### Update Subject (Admin Only)
* **Method & Path**: `PUT /api/subjects/:id`
* **Auth Required**: Yes (Admin only)
* **Request Body**: `{ "description": "Updated desc..." }`
* **Success Response (200 OK)**: Updated Subject object

### Delete Subject (Admin Only)
* **Method & Path**: `DELETE /api/subjects/:id`
* **Auth Required**: Yes (Admin only)
* **Success Response (200 OK)**:
  ```json
  {
    "deleted": true,
    "id": "cuid_subject_id"
  }
  ```

---

## 3. Topics (`/api/subjects/:subjectId/topics` & `/api/topics`)

### Get Topics by Subject
* **Method & Path**: `GET /api/subjects/:subjectId/topics`
* **Auth Required**: No
* **Success Response (200 OK)**: List of Topic objects

### Create Topic under Subject (Admin Only)
* **Method & Path**: `POST /api/subjects/:subjectId/topics`
* **Auth Required**: Yes (Admin only)
* **Request Body**:
  ```json
  {
    "name": "Sorting Algorithms",
    "slug": "sorting-algorithms",
    "description": "Basic sorting techniques..."
  }
  ```
* **Success Response (201 Created)**: Created Topic object

### Update Topic (Admin Only)
* **Method & Path**: `PUT /api/topics/:id`
* **Auth Required**: Yes (Admin only)
* **Request Body**: `{ "name": "New Name" }`
* **Success Response (200 OK)**: Updated Topic object

### Delete Topic (Admin Only)
* **Method & Path**: `DELETE /api/topics/:id`
* **Auth Required**: Yes (Admin only)
* **Success Response (200 OK)**:
  ```json
  {
    "deleted": true,
    "id": "cuid_topic_id"
  }
  ```

---

## 4. Notes (`/api/topics/:topicId/notes` & `/api/notes`)

### Get Notes by Topic
* **Method & Path**: `GET /api/topics/:topicId/notes`
* **Auth Required**: No
* **Filters**: Returns only notes where `status: "PUBLISHED"`, sorted by `publishedAt DESC`.
* **Success Response (200 OK)**: List of note objects with author name

### Get Single Note Details
* **Method & Path**: `GET /api/notes/:id`
* **Auth Required**: Optional (guards draft note view limits)
* **Success Response (200 OK)**: Full note details including author details, sections, and parent topic/subject names.

### Create Note
* **Method & Path**: `POST /api/notes`
* **Auth Required**: Yes
* **Request Body**:
  ```json
  {
    "title": "Quick Sort Optimization",
    "topicId": "cuid_topic_id",
    "excerpt": "Advanced quick sort strategies...",
    "difficulty": "HARD",
    "tags": ["sorting", "divide-and-conquer"]
  }
  ```
* **Success Response (201 Created)**: Created Note object (initially status = `DRAFT`)

### Update Note Metadata
* **Method & Path**: `PUT /api/notes/:id`
* **Auth Required**: Yes (Owner or Admin)
* **Request Body**: `{ "title": "Updated Title", "difficulty": "MEDIUM" }`
* **Success Response (200 OK)**: Updated Note metadata

### Publish Note
* **Method & Path**: `PATCH /api/notes/:id/publish`
* **Auth Required**: Yes (Owner or Admin)
* **Success Response (200 OK)**: Note object with `status: "PUBLISHED"` (and increments parent counts atomically)

### Delete Note
* **Method & Path**: `DELETE /api/notes/:id`
* **Auth Required**: Yes (Owner or Admin)
* **Success Response (200 OK)**: `{ "deleted": true, "id": "cuid_note_id" }`

### Get Current User's Notes
* **Method & Path**: `GET /api/notes/user/my-notes`
* **Auth Required**: Yes
* **Success Response (200 OK)**: List of user's notes with topics metadata.
* **Bug Warning**: Due to route shadowing in Express routing definitions, this endpoint is currently unreachable. Refer to Audit report.

---

## 5. Sections (`/api/notes/:noteId/sections` & `/api/sections`)

### Add Section to Note
* **Method & Path**: `POST /api/notes/:noteId/sections`
* **Auth Required**: Yes (Note owner or Admin)
* **Request Body**:
  ```json
  {
    "title": "Pivot Selection",
    "content": "Choosing the right pivot element is vital...",
    "contentType": "TEXT"
  }
  ```
  *(For `contentType: "CODE"`, `language` is mandatory.)*
* **Success Response (201 Created)**: Created Section object

### Update Section
* **Method & Path**: `PUT /api/sections/:id`
* **Auth Required**: Yes (Note owner or Admin)
* **Request Body**: `{ "content": "Updated code or text..." }`
* **Success Response (200 OK)**: Updated Section object

### Delete Section
* **Method & Path**: `DELETE /api/sections/:id`
* **Auth Required**: Yes (Note owner or Admin)
* **Success Response (200 OK)**: `{ "deleted": true, "id": "cuid_section_id" }`

### Reorder Sections
* **Method & Path**: `PATCH /api/sections/:id/reorder`
* **Auth Required**: Yes (Note owner or Admin)
* **Request Body**:
  ```json
  {
    "newOrder": 2
  }
  ```
* **Success Response (200 OK)**: Section object with updated order value
