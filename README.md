# 🐛 DebugDiary

> AI-powered personal bug-fixing journal. Paste errors, get step-by-step fixes from Gemini, build your searchable knowledge base — organised by project.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| AI | Google Gemini 2.5 Flash lite |
| Database | MongoDB + Mongoose |
| Styling | Tailwind CSS |
| Markdown | react-markdown + remark-gfm |
| Highlighting | rehype-highlight (highlight.js) |
| Toasts | react-hot-toast |
| Language | TypeScript |

---


## Features

### 🏠 Dashboard
- Project cards with bug count, last activity, and status badges
- "🐛 X bugs crushed" motivational counter
- One-click project creation

### 🤖 AI Bug Fixing
- Paste any error → Gemini analyses it immediately
- Structured response: What it means → Cause → Step-by-step fix → Prevention
- Clean Markdown with syntax-highlighted code blocks

### 📁 Project Management
- Organise bugs by project (WorkApp, MyPortfolio, etc.)
- Browser-tab style navigation between projects
- Project names are unique per anonymous user (stored in localStorage)

### 🔍 Search
- Keyword search within a project
- "Search All Projects" toggle for cross-project search
- Debounced, real-time filtering

### 📖 Bug Diary
- Expandable/collapsible error text and AI fix
- Status toggle: "Solved ✓" / "Still Investigating"
- Pagination (10 per page)
- Delete individual entries

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd debugdiary
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/debugdiary
GEMINI_API_KEY=your_gemini_api_key_here
```

**Getting your keys:**
- **MongoDB**: Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Gemini**: Get a free API key at [aistudio.google.com](https://aistudio.google.com)

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
  page.tsx                  → Home dashboard
  projects/[id]/page.tsx    → Project diary (tabbed)
  api/
    projects/route.ts       → GET/POST projects
    bugs/route.ts           → GET/POST bugs
    bugs/[id]/route.ts      → PATCH/DELETE bug

components/
  ProjectCard.tsx           → Dashboard project card
  BugEntryCard.tsx          → Bug + AI fix display
  BugInput.tsx              → Sticky input bar
  AskProjectModal.tsx       → "Which project?" modal
  SearchBar.tsx             → Search + all-projects toggle
  Skeleton.tsx              → Loading skeletons

lib/
  mongodb.ts                → Connection utility
  gemini.ts                 → Gemini API integration
  api.ts                    → Client-side fetch helpers
  userId.ts                 → Anonymous user ID (localStorage)

models/
  Project.ts                → Mongoose Project schema
  BugEntry.ts               → Mongoose BugEntry schema
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/bugs?projectId=&search=&page=` | Fetch bugs |
| `POST` | `/api/bugs` | Submit bug (triggers Gemini) |
| `PATCH` | `/api/bugs/:id` | Update status |
| `DELETE` | `/api/bugs/:id` | Delete bug entry |

All requests pass `x-user-id` header (set from localStorage).

---

## MongoDB Indexes

- `BugEntry`: Full-text index on `errorText + aiFixMarkdown` for search
- `Project`: Compound unique index on `name + userId`
- Both models indexed on `userId` for fast per-user queries

---

## Deploy

```bash
# Vercel (recommended)
npx vercel

# Or build locally
npm run build
npm start
```

Set environment variables in your deployment platform.
