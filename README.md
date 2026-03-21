# Docify

An AI-powered document intelligence platform. Upload a PDF, choose an AI voice, and have a live voice conversation with your document — ask questions and get context-aware answers.

---

## What is it?

The core user journey:

1. Upload a PDF with a title, author, and a chosen AI voice
2. The system processes and segments the document
3. The user has a voice conversation with the document — asking questions and getting cited answers via VAPI + ElevenLabs

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime / Package Manager | Bun | Faster installs and script execution |
| Framework | Next.js 16 (App Router) | Server components, route groups, co-located layouts |
| Language | TypeScript | Full type safety across app and DB layers |
| Styling | Tailwind CSS v4 + tw-animate-css | `@theme inline {}` tokens in CSS, no separate config file |
| Design System | Catppuccin (Latte/Mocha) | Soft, readable palette with light/dark mode built in |
| Components | shadcn/ui (Radix) | Unstyled primitives, fully overridable |
| Auth | Better-Auth | Self-hosted, Drizzle adapter, no vendor lock-in |
| Database | PostgreSQL + Drizzle ORM | Plain TS schema, auditable SQL, no Prisma runtime |
| Voice TTS | ElevenLabs | 5 pre-configured conversational voices |
| Voice Conversation | VAPI | Turn-taking, smart endpointing, backchanneling |

---

## Running Locally

```bash
bun install
bun dev
```

### Database

```bash
bun db:generate   # generate migrations from schema
bun db:migrate    # run migrations
bun db:push       # push schema directly (dev only)
bun db:studio     # open Drizzle Studio
```

### Environment Variables

```env
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_ASSISTANT_ID=
```

---

## Project Architecture

### Route Groups

```
src/app/
  layout.tsx                   ← Root layout: fonts + ThemeProvider
  globals.css                  ← All design tokens + component utility classes

  (landing)/                   ← Public marketing pages (no Navbar)
    page.tsx                   ← Hero, Features, How it Works, CTA, Footer

  (auth)/                      ← Auth pages (no Navbar)
    login/page.tsx
    signup/page.tsx

  (main)/                      ← Authenticated app (has Navbar)
    layout.tsx                 ← Wraps children with <Navbar />
    dashboard/page.tsx         ← User's document library
    documents/new/page.tsx     ← Upload form
    settings/page.tsx          ← Settings (placeholder)

  api/
    auth/[...all]/route.ts     ← Better-Auth catch-all handler
```

Parenthesized route groups (`(landing)`, `(auth)`, `(main)`) group routes without adding a URL segment, and each has its own layout — cleanly separating which pages render the Navbar.

### Authentication

`better-auth` was chosen over Clerk/Auth.js — auth tables live in the same Drizzle schema as app tables, and the `nextCookies()` plugin handles SSR session reading without extra configuration. Two methods are enabled: email/password and Google OAuth.

### Database Schema

**Migration 0000 — Auth tables** (managed by Better-Auth):
- `user` — id, name, email (unique), email_verified, image
- `session` — token (unique), expiresAt, userId (FK → user, cascade)
- `account` — supports multiple OAuth providers per user
- `verification` — for email verification flows

**Migration 0001 — App tables:**
- `document` — title, slug (unique), author, `voice_id`, `file_url` + `file_blob_key`, optional `cover_url` + `cover_blob_key`, file size, mime type, `total_segments`
- `document_segment` — each document is split into segments for RAG. Stores content, `segment_index`, optional `page_number`, `word_count`. Unique composite index on `(document_id, segment_index)`.
- `voice_session` — tracks each conversation session. Records `started_at`, `ended_at`, `duration_seconds`, and `billing_period_start` for future usage billing.

All app tables cascade-delete when the parent `user` or `document` is deleted. All FK columns are indexed.

### Design System

The color palette is [Catppuccin](https://catppuccin.com/):
- Light mode → **Catppuccin Latte**
- Dark mode → **Catppuccin Mocha**

Brand color (`--color-brand`) is Mauve — `#8839ef` in light, `#cba6f7` in dark. All component-level styles live in `globals.css` as `@layer utilities` classes (`.book-card`, `.btn-primary`, `.upload-dropzone`, `.vapi-mic-btn`, etc.) rather than scattering styles across component files.

**Font pairing:**
- `IBM Plex Serif` — headings, book titles, buttons (editorial/literary feel)
- `Mona Sans` — body and UI text

### Voice Integration

**ElevenLabs** voices are pre-configured in `src/lib/constants.ts`:

| Key | Name | Description |
|---|---|---|
| `dave` | Dave | Young male, British-Essex, casual |
| `daniel` | Daniel | Middle-aged male, British, authoritative |
| `chris` | Chris | Male, casual & easy-going |
| `rachel` | Rachel | Young female, American, calm & clear (default) |
| `sarah` | Sarah | Young female, American, soft & approachable |

**VAPI** handles the voice conversation layer. The `VAPI_DASHBOARD_CONFIG` object in constants documents recommended assistant settings (smart endpointing, backchanneling, background denoising) for the VAPI Dashboard.

---

## Current State

| Area | Status |
|---|---|
| Landing page | Complete |
| Auth (login/signup + Better-Auth) | Complete |
| Navbar (responsive, session-aware) | Complete |
| Dashboard UI (banner + document grid + search) | UI complete — uses hardcoded sample data |
| Upload form (fields + validation + voice selector) | UI complete — submit not wired up |
| Settings page | Placeholder shell only |
| Document detail / reader page | Not built |
| Voice conversation UI component | CSS styles written, React component not built |
| File upload to blob storage | Not implemented |
| PDF parsing / text segmentation | Not implemented |
| API routes (create, list, fetch documents) | Not implemented |
| VAPI / ElevenLabs integration | Not implemented |

---

## What's Next (Logical Order)

1. **Blob storage** — integrate Vercel Blob or Cloudflare R2 for PDF + cover image uploads
2. **PDF parsing server action** — parse uploaded PDFs, split into segments, store in `document_segment`
3. **`/api/documents` route** — create, list, and fetch documents from the DB
4. **Wire up `UploadForm.onSubmit`** — call the real API once blob + parsing is in place
5. **Real dashboard data** — replace `sampleBooks` with actual DB query for the current user's documents
6. **Document detail page** (`/documents/[slug]`) — show metadata and embed the VAPI voice chat UI
7. **VAPI controls component** — build the voice conversation React component using the pre-written CSS classes
8. **Settings page** — profile editing, password change, connected accounts
