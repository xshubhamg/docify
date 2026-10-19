# Docify — engineering case study

A short account of the problem, the decisions, and the trade-offs behind Docify.
For the full task-by-task roadmap and audit, see [`../plan.md`](../plan.md).

## The problem

Answering one question in a 300-page report means scrolling, searching, and losing
your place. Docify turns a PDF into a voice conversation: upload a document, pick a
voice, ask out loud, and hear an answer that is grounded in the actual pages while
the source stays visible for verification.

The interesting part is not the chat UI. It is treating a solo project like a system:
private storage that never leaks, an ingestion pipeline that cannot half-succeed, a
grounding step that degrades gracefully, and a search path that scales past the
demo.

## Constraints

- **One runtime.** Bun for install, scripts, and tests; Next.js 16 App Router and
  React 19 on top.
- **Serverless-first.** The app targets Vercel, so there is no long-lived worker to
  hold state. Anything stateful (rate limits) must degrade when it is absent.
- **Private by default.** User PDFs are not public objects. Reads go through
  authenticated routes, which rules out the convenient "sign a public URL" shortcut.
- **Honest surface.** The product may only claim what it does: PDFs, lexical
  full-text grounding, no OCR, no Word support, no semantic retrieval.

## Architecture

- **Upload.** The browser asks `/api/blob/upload` for a token scoped to
  `users/{userId}/{pdf|cover}/`, uploads directly to private Blob storage, then calls
  `POST /api/documents` with the resulting pathnames.
- **Ingestion.** `createDocumentFromUploads` re-verifies ownership, re-checks the
  blob's real size and content type, extracts text with `pdfjs-dist/legacy`, chunks
  it (180 words, 30-word overlap), and inserts the document plus segments in a single
  transaction.
- **Reading.** The reader loads a bounded preview per segment, streams the PDF
  through `/file` and the cover through `/cover`, and mounts only a window of pages.
- **Voice.** Before starting a VAPI call, the client fetches `/context?limit=5` and
  passes the result as `variableValues`. `/context` runs Postgres full-text search
  over the document's segments, scoped to the session's user.

## Decisions and trade-offs

**Private blobs behind authenticated routes.** Every read is scoped by `userId`, and
a foreign slug returns `404` rather than `403` so the API never confirms that a
document exists. The cost is that the server proxies file bytes instead of redirecting
to a CDN. That is the right trade for private documents.

**Transactional ingestion with explicit cleanup.** The document row and its segments
are written in one transaction, so a failure cannot leave a document without segments.
Blobs are deleted on any failure path. Slug allocation is retried with
`ON CONFLICT DO NOTHING` so two simultaneous uploads with the same title cannot
collide.

**Grounding fails open.** The context fetch is best-effort: if search is slow or
errors, the voice call still starts with title and author. A grounding lookup should
never be the reason a user cannot use the product.

**Search: in-memory scoring → Postgres full-text.** The first version loaded every
segment and scored tokens in JavaScript. It worked and was easy to test, but it was a
full table read per call and O(n) CPU on the server. It now queries a GIN index on
`to_tsvector('english', content)`, ranks with `ts_rank_cd`, and falls back to the
opening segments when a query is empty or unmatched. I deliberately did **not** add
embeddings: lexical search is cheap, explainable, and honest for a portfolio project.
Reaching for a vector database here would add cost and a semantic claim the product
cannot fully support.

**Rate limiting with a graceful fallback.** Writes and search are limited with a
sliding window. Upstash is used when configured; otherwise a per-instance in-memory
limiter runs and prints a single warning. This keeps local development frictionless
without pretending the fallback is a distributed limiter in production.

**Fail-fast environment.** `src/lib/env.ts` validates the server environment with Zod
at boot and reports every missing or malformed variable at once. Google OAuth and VAPI
are optional, and the app runs without them — voice simply turns off and the Google
button disappears.

**Honest copy as an engineering constraint.** The landing page, `/pricing`, and
`README` describe keyword-grounded voice Q&A, not "AI insights". Every claim is a
promise the code can keep. This constraint is written into `AGENTS.md` so it survives
future changes.

## Verification

- Vitest covers the pure domain logic (blob path ownership, PDF and image constraints,
  chunking overlap, slug creation, truncation, and the Zod schemas) with 90% coverage
  thresholds.
- `README.md`, `CONTRIBUTING.md`, and the repo templates document the workflow;
  commitlint and Husky keep the history conventional.
- CI installs with a frozen lockfile and runs lint, a Prettier check, typecheck,
  coverage, and a production build on every change.

## What I would do next

1. Integration tests against a disposable Postgres (ingestion, slug races, search
   ranking, ownership boundaries).
2. A `search_document` VAPI server tool with tool-specific auth so the assistant can
   look things up mid-call instead of receiving a fixed overview.
3. Structured error reporting with request context instead of `console.error`.
4. A cache layer for reader metadata, invalidated on upload and delete.

## Résumé summary

Built a production-shaped Next.js 16 / React 19 app on Bun: private PDF ingestion
with transactional chunking, Postgres full-text grounding over a GIN index, live
VAPI + ElevenLabs voice sessions, and authenticated blob streaming. Added Zod env
validation, sliding-window rate limiting with a graceful fallback, a Vitest suite
with 90% coverage gates, and a CI pipeline that verifies lint, formatting, types,
tests, and the production build.
