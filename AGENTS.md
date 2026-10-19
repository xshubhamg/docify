<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide
in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

- use `bun` for package management.

# Docify — Project Spec

AI-powered document intelligence: upload a PDF, pick a voice persona, have a live
voice conversation grounded in the document's content.

## Stack

- Runtime/pkg: `bun` only (`bun install/dev/build/lint`, never npm/pnpm).
- Core: Next.js 16 App Router + React 19 + TypeScript strict + Tailwind v4 + shadcn `new-york/zinc`.
- DB: Postgres (Neon/Supabase on Vercel) via Drizzle ORM. Schema source: `src/lib/db/schema.ts`.
- Auth: Better-Auth email+password + Google OAuth. API handler: `src/app/api/auth/[...all]/route.ts`.
- Storage: Vercel Blob, `access: "private"` always. Keys: `users/{userId}/{pdf|cover}/{uuid}-{sanitized}`.
- Voice/AI: VAPI (`@vapi-ai/web`, static `NEXT_PUBLIC_ASSISTANT_ID`) + ElevenLabs voice IDs.
- PDF: server `pdfjs-dist/legacy`, client `react-pdf` (worker synced to
  `public/pdf.worker.min.mjs` by `bun run pdf:worker`). Chunking: 180 words / 30 overlap per page.

## Routes & Layout Groups

- `(landing)/` public hero, `(auth)/login|signup`, `(main)/dashboard|documents/new|documents/[slug]|settings`.
- APIs: `/api/auth/[...all]`, `/api/blob/upload|cleanup`, `/api/documents` (POST create),
  `/api/documents/[slug]` (GET), `/file`, `/cover` (proxied private streams),
  `/voice-sessions` (POST) + `/voice-sessions/[sessionId]` (PATCH finish),
  `/context?query=&limit=` (keyword search over segments, session-authenticated).

## Key Flows

- Upload: `UploadForm.tsx` uploads pdf+cover in parallel to `/api/blob/upload`
  (prefix-enforced token, 5min expiry) → `POST /api/documents` → `service.ts`
  (verify ownership, assert PDF constraints, `extractPdfPages`, chunk, tx insert
  document+segments, delete blobs on failure) → redirect `/documents/{slug}`.
- Reader: `DocumentReader.tsx` (client-only via `DocumentReaderClient` dynamic import).
  3 tabs: Navigate (page buttons + IntersectionObserver), Segments (previews),
  Voice (VAPI mic + live transcript + volume).
- Voice start (grounded): `handleVoiceToggle` POSTs a `voice_session`, GETs
  `/context?limit=5` overview, then calls
  `vapi.start(ASSISTANT_ID, { variableValues: { documentTitle, documentAuthor, documentContext },
metadata: { documentId, slug, voiceId }, voice: { provider: "11labs", voiceId, stability, similarityBoost } })`.
  Context fetch failure must NOT block the call — warn and start bare.
- VAPI dashboard contract: assistant system prompt must reference
  `{{documentTitle}}` / `{{documentContext}}`; turn-taking/noise settings live in the
  dashboard (see `VAPI_DASHBOARD_CONFIG` reference in `src/lib/constants.ts`).
  A `search_document` server tool pointing at `/context?query=` is the phase-2 upgrade
  (needs non-cookie tool auth first).

## Conventions

- Server auth: `auth.api.getSession({ headers })` → 401; ownership via
  `getDocumentBySlugForUser` → 404 (never leak existence).
- Errors: throw `DocumentFlowError(message, statusCode)` in `src/lib/documents/*`;
  map `ZodError→400`, `DocumentFlowError→its code`, else 500 without leaking internals.
- Zod v4 (`zod/v4`): `UploadSchema` (client) / `createDocumentSchema` (server).
- Types: `types.d.ts` (forms/cards) + `src/lib/documents/types.ts` (DB-facing).
- Never: expose raw blob URLs (reader uses proxied routes), `access: "public"`,
  bare `vapi.start(ASSISTANT_ID)` without overrides, new `/pricing`-style dead links,
  claims of Word/OCR/semantic-RAG support (keyword search only).

## Env (see `.env.example`)

Validated at boot by `src/lib/env.ts` (server) — missing or malformed values fail
fast with an actionable message. Google OAuth and VAPI are optional; the app runs
without them (voice is disabled).

`DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, BLOB_READ_WRITE_TOKEN,`
`GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_VAPI_PUBLIC_KEY, NEXT_PUBLIC_ASSISTANT_ID`

## Commands

`bun dev|build|start|lint`, `bun db:generate|db:migrate|db:push|db:studio`.
