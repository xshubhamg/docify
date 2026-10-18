# Docify — Senior-Level Improvement & Portfolio Plan

> **Purpose of this document.** A durable, step-by-step engineering roadmap to take
> Docify from "impressive hackathon-grade product" to a **portfolio/resume-grade,
> production-quality system** — the kind a senior engineer would be proud to walk
> through in an interview. Every task is scoped, sequenced, and paired with the
> commit that should ship it, so the **git history itself becomes a portfolio
> artifact**.
>
> **How to use it.** Work top-to-bottom by phase. Each phase is independently
> shippable and leaves the app green. Treat the checklists as the source of truth;
> update this file as decisions change (keep it living, like `AGENTS.md`).

---

## 0. TL;DR

Docify is already **above the median** for a solo project: end-to-end type safety,
private blob storage with proxied reads, a real ingestion pipeline, a grounded
voice flow with a documented VAPI contract, and honest technical docs (`AGENTS.md`
is excellent). What separates it from "senior portfolio" today is **not features** —
it is **rigor**: tests, CI, security hardening, accessibility, performance at scale,
observability, honest marketing copy, a polished design system, and a documented
decision trail.

The plan closes that gap in **8 phases (~6–8 weeks part-time)**:

| Phase | Theme                       | Outcome                                        |
| ----- | --------------------------- | ---------------------------------------------- |
| 1     | Foundations & hygiene       | Green, reproducible, guarded repo              |
| 2     | Correctness & security      | No false claims, no dead links, hardened APIs  |
| 3     | Testing & CI/CD             | Confidence to refactor; auto-deployed previews |
| 4     | Performance & scale         | Reader + search scale to large PDFs            |
| 5     | Design system & UX polish   | Cohesive, accessible, delightful UI            |
| 6     | Signature features          | The "why should I hire you" differentiators    |
| 7     | Observability & reliability | Production-grade operations                    |
| 8     | Portfolio presentation      | README, case study, demo, docs site            |

---

## 1. North Star

> **Docify is a voice-first document intelligence platform: upload a PDF, pick a
> voice persona, and hold a live, grounded conversation with the document — with a
> reader that renders the source and a transcript that proves the grounding.**

**What "senior" means here (the bar every task must clear):**

1. **Correct by construction** — types, schemas, and DB constraints prevent whole
   classes of bugs; not just "it works when I click it."
2. **Tested at the seams** — pure logic is unit-tested; the ingestion and auth
   boundaries are integration-tested; nothing critical relies on manual QA.
3. **Secure by default** — no user can read another user's data or blob; expensive
   endpoints are rate-limited; failures never leak internals.
4. **Observable** — when something breaks in prod, we can see _what, where, why_.
5. **Honest** — the product claims exactly what it does. No "Word/OCR" if we only
   do PDFs. Trust is a senior trait.
6. **Accessible & fast** — keyboard-navigable, WCAG-AA contrast, no layout thrash,
   large-doc performance handled deliberately.
7. **Documented decisions** — ADRs for the choices that mattered. A reader can
   reconstruct _why_, not just _what_.

---

## 2. Current-State Audit

### 2.1 What is genuinely strong (keep and lean into)

- **Architecture:** clean route groups `(landing)/(auth)/(main)`, a real `lib/documents`
  domain layer (`service.ts`, `queries.ts`, `pdf.ts`, `storage.ts`, `errors.ts`,
  `utils.ts`), and a typed `types.ts`. This is a _deep module_ shape — good.
- **Security basics done right:** private blobs by default, proxy routes
  (`/file`, `/cover`) so raw blob URLs never leak, ownership enforced via
  `getDocumentBySlugForUser` → 404 (no existence leak), prefix-enforced upload
  tokens, cleanup on failure.
- **Ingestion pipeline:** server-side `pdfjs-dist/legacy` extraction → 180/30-word
  overlapping chunking → transactional insert → blob cleanup on failure.
- **Grounded voice flow:** session row created → context overview fetched
  best-effort → `vapi.start` with `variableValues` + ElevenLabs voice override.
  The "context failure must not block the call" contract is documented.
- **Docs:** `AGENTS.md` is a genuinely strong spec (flows, conventions, "never" list,
  phase-2 pointer). `README.md` is above average.
- **Design foundation:** Catppuccin Latte/Mocha tokens, dual themes via `next-themes`,
  serif/sans pairing, soft shadow scale.

### 2.2 Scorecard (honest, senior-eye view)

| Dimension      | Now     | Target | Notes                                                                    |
| -------------- | ------- | ------ | ------------------------------------------------------------------------ |
| Type safety    | 🟢 7/10 | 9/10   | `strict` on; but `types.d.ts` duplicates DB types; unused payload fields |
| Security       | 🟡 6/10 | 9/10   | Good isolation; **no rate limiting, no env validation, no headers/CSP**  |
| Testing        | 🔴 0/10 | 8/10   | **Zero tests, no test runner installed**                                 |
| CI/CD          | 🔴 0/10 | 9/10   | No `.github`, no preview deploys documented                              |
| Performance    | 🟡 5/10 | 8/10   | Reader loads _all_ segments + renders all pages; search is O(n) in JS    |
| Accessibility  | 🔴 3/10 | 8/10   | Click-only dropzone, missing labels/focus states, no skip link           |
| UX polish      | 🟡 6/10 | 9/10   | `window.confirm`, no toasts/skeletons/empty states, dead settings        |
| Design system  | 🟡 6/10 | 9/10   | ~200 lines dead Clerk CSS; undefined CSS vars; invalid utility           |
| Observability  | 🔴 1/10 | 7/10   | No logging, tracing, or error reporting                                  |
| Docs/Portfolio | 🟡 6/10 | 9/10   | No LICENSE, CONTRIBUTING, screenshots, ADRs, case study                  |
| Git history    | 🟡 6/10 | 9/10   | Decent conventional commits; some vague; no branch/PR discipline         |

### 2.3 Concrete defects found (with evidence)

**Correctness / honesty**

- 🔴 `src/app/(landing)/page.tsx:16` — claims **"PDF, Word, text files"**; the spec's
  own "Never" list (`AGENTS.md`) forbids Word/OCR claims. Only PDF is supported.
- 🔴 `src/app/(landing)/page.tsx` — "summaries, themes, entities", "cited answers",
  "Drag and drop or browse to upload any supported document format" overclaims vs.
  keyword search + voice Q&A.
- 🔴 `/pricing` is linked in `src/components/Navbar.tsx` (public **and** auth nav)
  but **no route exists** → 404. Explicitly banned by `AGENTS.md`.
- 🔴 `README.md:5` references `/placeholder-image.png` which does not exist.
- 🔴 Dead `#` links: Terms/Privacy in both auth forms; "Forgot your password?".

**Security**

- 🟠 No rate limiting on `POST /api/documents` (PDF parse = CPU/ffmpeg-free but still
  heavy), `POST /api/blob/upload`, `POST .../voice-sessions`, `/context`.
- 🟠 No environment validation — `process.env.DATABASE_URL!` etc. (`src/lib/db/index.ts:5`,
  `src/lib/auth.ts:11-12`) fail with cryptic runtime errors instead of a clear message.
- 🟠 No security headers (`CSP`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
  configured in `next.config.ts`.
- 🟠 `pdfjs` worker loaded from `unpkg.com` CDN in the browser
  (`DocumentReader.tsx:31-32`) — supply-chain/offline risk; should self-host.
- 🟡 `getUniqueDocumentSlug` (`queries.ts:39-59`) is a check-then-insert race; a
  unique-violation retry is needed.

**Performance / scale**

- 🟠 `getDocumentReaderData` (`queries.ts:131-162`) loads **every segment** into the
  RSC payload — a 400-page book bloats the flight response.
- 🟠 `searchDocumentSegments` (`queries.ts:188-246`) pulls **all** segments and scores
  in JS — O(rows × terms). Fine for 1 book; poor for many/large.
- 🟠 Reader renders **all pages** (`DocumentReader.tsx:546-567`) with no virtualization
  or lazy `Page`.
- 🟡 No `Cache-Control`/revalidation strategy on dashboard/reader data.

**Code quality**

- 🟡 `src/lib/documents/service.ts` accepts `pdfFileSize`/`pdfMimeType` but ignores
  them (uses blob metadata) → misleading `CreateDocumentPayload` (`types.ts:15-16`).
- 🟡 `src/lib/documents/auth.ts::getRequiredSession` is **never used** (dead code).
- 🟡 Duplicated proxy logic between `file/route.ts` and `cover/route.ts`.
- 🟡 Inconsistent error mapping across routes (some catch `ZodError`, some don't;
  `voice-sessions/[sessionId]` maps _everything_ to 400).
- 🟡 `types.d.ts` re-declares DB models (`IDocument`, …) that already exist as Drizzle
  `$inferSelect` → drift risk. `BookCardProps` is used for documents (naming).
- 🟡 `crypto.randomUUID()` sprinkled in queries while a `generateUuid` helper exists.

**Design system / CSS**

- 🟠 `globals.css:780-983` — **~200 lines of dead Clerk CSS** (`.cl-*`), but auth is
  Better-Auth. Pure noise.
- 🟠 `globals.css:633-635` — `.transcript-bubble-user { @apply bg-[(--color-brand)] ... }`
  is an **invalid arbitrary-value syntax** (should be `bg-(--color-brand)`).
- 🟠 `globals.css:375-388` — `.error-banner` references undefined tokens
  (`--border-red-200`, `--red-500`, `--red-600`, `--red-800`) — those "success/danger"
  tokens are never declared.
- 🟡 Large swaths of unused utilities (`library-*`, `book-page-container`, `select-*`,
  `auth-shadow`, `clerk-subscriptions`, …).
- 🟡 Hardcoded palette hexes inside `page.tsx` feature cards instead of tokens.

**UX / A11y**

- 🟠 Upload dropzone is a `<div onClick>` — not focusable, not keyboard-operable, no
  `role`/`aria` (`UploadForm.tsx:178-224`).
- 🟠 No `error.tsx`, `loading.tsx`, `not-found.tsx`, `global-error.tsx` anywhere.
- 🟠 Delete uses native `window.confirm` (`DocumentReader.tsx:152`).
- 🟡 No toast/notification system; errors are ad-hoc banners.
- 🟡 `/settings` is three dead cards (`settings/page.tsx`) — a visible unfinished seam.
- 🟡 No empty-state or onboarding for a brand-new user's dashboard.
- 🟡 `page-title-xl` uses `leading-[54px]` fixed → can clip on mobile.

**Docs & portfolio**

- 🟡 No `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.
- 🟡 No architecture diagram, screenshots, GIF/video demo, or "case study".
- 🟡 No ADRs. No test-coverage badge. No deploy button.
- 🟡 `.env.example` lists keys; README's env section is incomplete/inconsistent.

---

## 3. Engineering Standards (the rules for everything below)

Adopt these once, then every phase references them.

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/). Format
  `type(scope): imperative summary`. Types: `feat|fix|refactor|perf|test|docs|build|ci|chore|style`.
  Scopes: `reader|ingest|auth|voice|blob|ui|db|api|deps|ci|docs`.
  Body explains **why**, not what. One logical change per commit; the tree builds at
  every commit.
- **Branches:** trunk-based with short-lived branches `feat/<scope>-<slug>`,
  `fix/…`, `chore/…`. Merge via PR (even solo) so the PR description becomes part of
  the record. Squash-merge with the conventional title.
- **PRs:** use a template (Summary / Why / How / Screenshots / Checklist). Link the
  phase task. Keep < ~400 LOC where possible.
- **Definition of Done (per task):** typechecks (`bunx tsc --noEmit`), lints
  (`bun run lint`), tests pass (`bun test`), builds (`bun run build`), and (for UI)
  verified light **and** dark at mobile + desktop widths.
- **Code style:** Prettier (add it) + ESLint; no `any`; no non-null `!` on env without
  a validated accessor; errors are typed.
- **Design tokens:** never hardcode hex in components — use the Catppuccin CSS vars.
- **Docs-as-code:** any behavior change updates `AGENTS.md`/`README.md` in the same PR.

---

## 4. Phase 1 — Foundations & Hygiene

**Goal:** a green, reproducible, guarded repo with tooling that catches mistakes
before a human does. No user-visible change.

### 1.1 Tooling

- [ ] Add **Prettier** + `prettier-plugin-tailwindcss`; `.prettierrc`, `.prettierignore`.
  - `chore(tooling): add prettier with tailwind class sorting`
- [ ] Add `format` / `format:check` scripts; run once across repo.
  - `chore(tooling): format codebase with prettier`
- [ ] Add **Husky** + **lint-staged**: pre-commit → prettier + eslint on staged files;
      pre-push → `tsc --noEmit` + `bun test`.
  - `build(tooling): add husky pre-commit and pre-push hooks`
- [ ] Add **commitlint** + `@commitlint/config-conventional` on `commit-msg`.
  - `build(tooling): enforce conventional commits`
- [ ] Add missing scripts: `typecheck`, `test`, `test:watch`, `format`, `check`
      (`lint && typecheck && test`).
  - `chore(scripts): add typecheck, test, and check scripts`

### 1.2 Config hardening

- [ ] `tsconfig.json`: add `noUncheckedIndexedAccess`, `noImplicitOverride`,
      `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`; fix fallout.
  - `refactor(types): enable stricter compiler options`
- [ ] Add `bunfig.toml` (if needed) and pin tooling in `package.json`
      (`"packageManager": "bun@x"`, `engines`).
  - `build: pin package manager and engine versions`
- [ ] Delete tracked build artifacts (`tsconfig.tsbuildinfo` already ignored — verify
      it's not tracked) and add `.editorconfig`.
  - `chore: add editorconfig and confirm build artifacts ignored`

### 1.3 Repo governance (files)

- [ ] `LICENSE` (MIT or Apache-2.0 — **decide and record in an ADR**).
- [ ] `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`.
- [ ] `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*`.
  - `docs: add license, contributing, security, and PR/issue templates`

**DoD:** `bun run check` passes; a bad commit message is rejected; a badly-formatted
file is fixed on commit. **Commit count: ~7.**

---

## 5. Phase 2 — Correctness, Honesty & Security

**Goal:** the app tells the truth, links go somewhere, and the API surface is hard.

### 2.1 Honesty pass (highest portfolio ROI — it signals integrity)

- [ ] Rewrite landing copy (`(landing)/page.tsx`) to match reality: _PDF only_, _live
      voice Q&A_, _keyword-grounded answers_, _private storage_, _source viewer_.
      Remove Word/OCR/"entities"/"cited" claims. Align feature cards with the "Never"
      list in `AGENTS.md`.
  - `fix(ui): make landing copy accurately describe PDF-only voice Q&A`
- [ ] Build a real **`/pricing`** page (or remove the links). Recommend: a simple
      "Free during beta" page with an honest roadmap — no dead link.
  - `feat(ui): add pricing page and remove dead nav link`
- [ ] Fix `README.md` preview image (add real screenshot) or remove the tag.
  - `docs: replace missing preview image reference with real screenshots`
- [ ] Resolve `#` links: real `/terms` + `/privacy` pages (can be simple + honest),
      or remove them.
  - `feat(ui): add terms and privacy pages`
- [ ] Remove "Forgot your password?" until reset exists, or implement it (§ Phase 6).
  - `fix(auth): remove non-functional forgot-password link`

### 2.2 Environment validation

- [ ] Add `src/lib/env.ts` using `zod/v4` to parse & validate all server env at boot
      (fail fast with a readable error listing missing keys). Export typed `env`.
- [ ] Replace `process.env.X!` usages (`db/index.ts`, `auth.ts`, `constants.ts`) with
      `env.X`. Keep `NEXT_PUBLIC_*` reads explicit and documented.
- [ ] Add a **client-safe** split (`env.public` vs `env.server`, `server-only` guard).
  - `feat(config): validate environment variables with zod`

### 2.3 API hardening

- [ ] Centralize auth + error handling in a helper (e.g. `withSession`,
      `jsonError`) and refactor all routes to it; consistent `ZodError→400`,
      `DocumentFlowError→code`, else `500` with generic message (+ correlation id).
  - `refactor(api): centralize auth and error mapping across route handlers`
- [ ] Add **rate limiting** (Upstash Redis / Vercel KV, or in-memory dev fallback):
      stricter on `POST /api/documents`, `POST /api/blob/upload`,
      `POST voice-sessions`, `GET /context`.
  - `feat(api): add rate limiting to expensive endpoints`
- [ ] Add **security headers** in `next.config.ts` (CSP incl. VAPI/pdfs domains,
      `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`,
      `Permissions-Policy` limiting `microphone` to self).
  - `feat(security): add security headers and CSP`
- [ ] Self-host the pdfjs worker (copy `pdf.worker.mjs` to `public/` or import via
      `new URL`), remove the `unpkg` dependency. Also pin/verify `pdfjs-dist` version.
  - `fix(reader): self-host pdfjs worker instead of CDN`
- [ ] Fix the slug race: catch unique-violation on insert and retry with a new suffix
      (or use `ON CONFLICT`). Add an integration test.
  - `fix(ingest): make document slug generation race-safe`

### 2.4 Error/UX boundaries

- [ ] Add `src/app/error.tsx`, `global-error.tsx` (report to Sentry in Phase 7 — stub
      now), `not-found.tsx`, and `loading.tsx` for `(main)` and `documents/[slug]`.
- [ ] Replace `window.confirm` delete with an accessible `AlertDialog` (shadcn) +
      toast feedback.
- [ ] Add a toast system (shadcn `sonner`), standardize success/error feedback.
  - `feat(ui): add route error boundaries, toasts, and an accessible delete dialog`

**DoD:** landing copy is verifiably true; no 404 nav; env misconfig fails fast with a
clear message; API routes are uniform + rate-limited; boundaries exist.
**Commit count: ~10.**

---

## 6. Phase 3 — Testing & CI/CD

**Goal:** refactor with confidence; every PR is validated and previewed.

### 3.1 Test infrastructure

- [ ] Add **Vitest** (+ `@vitest/coverage-v8`) for unit/integration; **Playwright**
      for E2E. Configure `vitest.config.ts` with path aliases.
  - `build(test): add vitest and playwright`
- [ ] Add **Testcontainers** (or a docker-compose Postgres) for DB integration tests.
  - `build(test): add ephemeral postgres for integration tests`

### 3.2 Unit tests (pure logic — fast, high ROI)

- [ ] `utils.ts`: `sanitizeFilename`, `buildBlobPathname`, `assertOwnedBlobPathname`
      (incl. traversal attempts), `createSlug`, `truncateText`, `segmentWords`
      (overlap correctness, boundary counts), `buildSegmentsFromPages` (indices monotonic
      across pages), `formatFileSize`, `ensureVoiceKey`.
- [ ] `zod.ts`: `UploadSchema` / `createDocumentSchema` accept/reject matrices.
- [ ] `queries.ts`: `scoreSegmentContent` ranking.
- [ ] `errors.ts`: `isDocumentFlowError`.
  - `test(lib): cover document utils, schemas, and scoring`

### 3.3 Integration tests (the valuable ones)

- [ ] Ingestion service: happy path → document + N segments in DB; bad mime → 422;
      oversized → 422; foreign pathname → 403; parse failure → blobs deleted.
- [ ] Ownership: user B cannot GET/DELETE user A's document (404, no leak).
- [ ] Voice session lifecycle: create → finish computes duration; cross-user 404.
- [ ] Context search: query filtering, limit clamping, fallback to overview.
  - `test(ingest): cover ownership, constraints, and cleanup on failure`
  - `test(voice): cover session lifecycle and ownership isolation`

### 3.4 E2E (Playwright)

- [ ] Auth (signup/login) → upload a fixture PDF → reader loads → transcript panel →
      delete with dialog → dashboard empty state.
- [ ] Voice start is mocked (no real VAPI call) but asserts session POST + context GET.
  - `test(e2e): add upload-to-reader happy path`

### 3.5 CI/CD

- [ ] `.github/workflows/ci.yml`: install (bun, cached) → `lint` → `typecheck` →
      `test --coverage` → `build`. Matrix not needed.
- [ ] `.github/workflows/e2e.yml` (or job): spin Postgres service + seed + Playwright
      against `next start`.
- [ ] Coverage gate (e.g. lines ≥ 70% on `src/lib/**`); upload artifact.
- [ ] **Deploy:** Vercel preview per PR + production on `main`; add a `deploy`
      badge. Document required secrets in `SECURITY.md`/README.
- [ ] Enable branch protection: require CI + PR review; disallow force-push to `main`.
  - `ci: add lint, typecheck, test, and build workflow`
  - `ci: add e2e workflow with postgres service`
  - `ci: gate merges on coverage and required checks`

**DoD:** CI is green + required; coverage reported; PRs get preview URLs; E2E proves
the core journey. **Commit count: ~9.**

---

## 7. Phase 4 — Performance & Scale

**Goal:** the reader and search stay fast on a 500-page PDF and a 100-document account.

### 4.1 Data loading

- [ ] Stop shipping all segments to the reader. Return segment **pages/counts +
      previews** (or paginate with `?page=`), and fetch full segment content on demand.
  - `perf(reader): paginate segment loading instead of shipping all rows`
- [ ] Add DB indexes for the hot paths: `document(user_id, created_at desc)`,
      `document_segment(document_id, segment_index)` (exists), add GIN/trigram later.
  - `perf(db): add covering indexes for dashboard and segment listing`
- [ ] Introduce a lightweight cache layer for reader metadata (`unstable_cache` /
      `revalidateTag`) invalidated on upload/delete.
  - `perf(reader): cache document metadata with tag-based revalidation`

### 4.2 Search scalability

- [ ] Move keyword search into Postgres: `tsvector` column + GIN index (or `pg_trgm`
      similarity). Keep the JSON contract, swap the implementation.
  - `perf(search): replace in-memory scoring with postgres full-text search`
- [ ] Add `EXPLAIN`-based test/benchmark for a 5k-segment corpus.
  - `test(search): benchmark full-text search on a large corpus`

### 4.3 Client rendering

- [ ] **Virtualize/lazy-render** PDF pages (render current ±1, skeleton placeholders).
      Keep IntersectionObserver navigation. Consider `page`-windowed `Document`.
  - `perf(reader): lazy-render pdf pages`
- [ ] Debounce/abort in-flight fetches (context, etc.); `AbortController` on unmount.
- [ ] Optimize images (`sizes`, `priority` only for hero); verify LCP.
  - `perf(ui): optimize images and network usage`

### 4.4 Measure

- [ ] Add `@next/bundle-analyzer`; record before/after. Target: reader route JS and
      TTI budgets. Add a `performance.md` note with Lighthouse numbers and screenshots.
  - `docs(perf): add before/after bundle and lighthouse report`

**DoD:** 500-page reader interaction is smooth; segment payload bounded; search uses
the DB; documented metrics. **Commit count: ~8.**

---

## 8. Phase 5 — Design System, UX & Accessibility

**Goal:** a cohesive, accessible, genuinely beautiful product. This is where "amazing
design skill" shows.

### 5.1 CSS/design-system cleanup

- [ ] Delete all dead Clerk CSS (`globals.css:780-983`) and unused utilities
      (`library-*`, `select-*`, `auth-shadow`, `clerk-subscriptions`, etc.). Verify with a
      usage grep before deleting.
  - `refactor(css): remove dead clerk and unused utility classes`
- [ ] Fix invalid/undefined tokens: `.transcript-bubble-user` → `bg-(--color-brand)`;
      define a proper semantic color set (`--success/--warning/--danger/--info` with
      fg/bg/border variants) and migrate `.error-banner`/`.warning-banner` to it.
  - `fix(css): correct invalid utility and define semantic color tokens`
- [ ] Add `@theme` radius/space/typography scale documentation; drop `!important`
      where possible; replace fixed `leading-[54px]` with responsive tokens.
  - `refactor(css): document and tidy design tokens`

### 5.2 Component polish

- [ ] Extract hardcoded feature-card colors into token-driven variants.
- [ ] Build a small **UI primitives** set consistently (Button/Input/Tabs/AlertDialog/
      Sonner already partly present) and use them everywhere — no bespoke one-offs.
- [ ] Add skeletons (`loading.tsx`, reader skeleton, dashboard grid skeleton).
- [ ] Consistent focus-visible rings across all interactive elements.
  - `feat(ui): add skeletons and unify focus/interaction states`

### 5.3 Accessibility (WCAG 2.1 AA)

- [ ] Fix the dropzone: `<label>`/button semantics, `role`, keyboard activation,
      drag-and-drop with proper `onDragOver/onDrop`, `aria-live` for status.
  - `fix(a11y): make file upload keyboard- and screen-reader-accessible`
- [ ] Add skip-to-content link; landmark roles (`header/main/nav/footer`); ensure
      one `h1` per page and logical heading order.
- [ ] Audit color contrast with tokens in both themes; fix failures.
- [ ] Icon-only buttons get `aria-label` (mic, theme, delete, session rows).
- [ ] Add `prefers-reduced-motion` handling for animations (pulse/bounce/ping).
- [ ] Run **axe** (Playwright + `@axe-core/playwright`) in CI; zero serious violations.
  - `feat(a11y): add skip link, landmarks, labels, and reduced-motion support`
  - `ci(a11y): fail on serious axe violations`

### 5.4 Product UX

- [ ] Empty states: new-user dashboard ("Upload your first PDF"), no-segments, no
      history. Onboarding hints.
- [ ] Reader: sticky mini-toolbar (page x/y, search-in-doc, jump), collapsible side
      panel, transcript auto-scroll + copy/export.
- [ ] Voice: show the _grounding context_ used, live "thinking/speaking" orb,
      reconnect handling, mic-permission error states.
- [ ] Responsive audit at 360/768/1280; fix overflow/clipping.
  - `feat(ui): add dashboard and reader empty, loading, and error states`
  - `feat(reader): add sticky toolbar and transcript export`
  - `feat(voice): surface grounding context and improve call states`

### 5.5 Settings (make it real)

- [ ] Profile: update name/avatar (Better-Auth `updateUser`), show email + provider.
- [ ] Appearance: theme picker (system/light/dark) persisted.
- [ ] Account: change password, sign out everywhere, danger zone (delete account +
      cascade blobs). Confirmation flows.
  - `feat(settings): implement profile, appearance, and account management`

**DoD:** no dead CSS; axe clean; keyboard-only journey works; settings functional;
documented responsive pass. **Commit count: ~12.**

---

## 9. Phase 6 — Signature Features (differentiators)

**Goal:** the features that make a recruiter say "this person ships product." Each is
scoped to be a clean, well-tested slice with its own commit trail.

- [ ] **6a. Phase-2 `search_document` VAPI tool.** Implement signed, non-cookie tool
      auth (short-lived HMAC token issued with the voice session), expose
      `/api/tools/search?token=`, wire the tool in the VAPI dashboard, document the
      contract in `AGENTS.md`. Now the assistant can retrieve mid-call — the thing that
      makes the product _actually_ conversational.
  - `feat(voice): add authenticated mid-call document search tool`
- [ ] **6b. In-document search UI.** Client search box over segments with highlighted
      hits and jump-to-page (reuses the FTS endpoint).
  - `feat(reader): add in-document search with jump-to-hit`
- [ ] **6c. Citations.** When the assistant answers, show which segments/pages grounded
      it (from the context/search result). Trust + a killer demo visual.
  - `feat(voice): show source citations for grounded answers`
- [ ] **6d. Transcript persistence & export.** Persist final transcripts (new table),
      show history per session, export as Markdown/PDF.
  - `feat(voice): persist and export conversation transcripts`
- [ ] **6e. Password reset + email verification** (Better-Auth + Resend). Re-enables
      the "Forgot password?" link honestly.
  - `feat(auth): add email verification and password reset`
- [ ] **6f. Public share links (read-only, signed).** Opt-in, time-boxed, revocable —
      demonstrates authorization design. Do **not** expose private blobs directly.
  - `feat(documents): add revocable read-only share links`
- [ ] **6g. Account analytics.** Dashboard stats: documents, total pages, voice
      minutes, sessions over time (small chart, Catppuccin-themed).
  - `feat(dashboard): add usage analytics`
- [ ] **6h. Onboarding improvement + demo document.** Seed a public sample PDF so a
      visitor can try the reader without uploading (huge for demos).
  - `feat(onboarding): add a demo document and guided first-run`

**Pick order:** 6a → 6b → 6c (the grounding story) → 6d → 6h → 6e → 6g → 6f.

**DoD:** each feature has tests, is documented, and appears in the README feature list.
**Commit count: ~20+ (each feature = several commits).**

---

## 10. Phase 7 — Observability & Reliability

**Goal:** operate it like production.

- [ ] **Structured logging** (pino) with request ids; log ingestion timings, voice
      session lifecycle, and errors with context (never log secrets/PII).
  - `feat(observability): add structured logging with request ids`
- [ ] **Error tracking:** Sentry (`@sentry/nextjs`) for server + client + source maps;
      wire the error boundaries from Phase 2.
  - `feat(observability): add sentry error tracking`
- [ ] **Product analytics** (PostHog or Vercel Analytics): upload funnel, voice start
      success rate, context-fetch fallback rate.
  - `feat(observability): add product analytics for the core funnel`
- [ ] **Health & readiness:** `/api/health` (DB ping, env sanity) for uptime checks.
  - `feat(api): add health check endpoint`
- [ ] **Uptime + alerts:** external monitor on `/api/health`; alert on error spike.
- [ ] **Backups/retention:** document DB backup + blob lifecycle policy; add an orphan
      blob GC job (referenced in code comments) — a cron route or script.
  - `feat(storage): add orphaned blob garbage collection job`
- [ ] **Load sanity:** a small k6/autocannon script for `/context` and reader route.
  - `test(perf): add load test for context search`

**DoD:** a prod error produces a Sentry event with a traceable request id; health
monitored; orphan GC runs. **Commit count: ~8.**

---

## 11. Phase 8 — Portfolio Presentation

**Goal:** the repo _reads_ like senior work before anyone runs it.

### 8.1 README as a landing page

- [ ] Hero + one-line pitch + badges (CI, coverage, license, deploy).
- [ ] Animated GIF / 30–60s demo video of the voice conversation (the money shot).
- [ ] Architecture diagram (Mermaid or Excalidraw image) — request lifecycle: upload →
      ingest → store → context → VAPI.
- [ ] Feature list (only true features), tech stack table, "Engineering highlights"
      section (security model, chunking, grounding, performance).
- [ ] Quickstart with env table + one-command dev (docker compose for Postgres).
- [ ] Roadmap + "Decisions" links (ADRs).
  - `docs: rebuild readme with demo, diagrams, and architecture highlights`

### 8.2 Decision records

- [ ] `docs/adr/` with ADRs: 0001 private blob + proxy reads; 0002 chunk size/overlap;
      0003 keyword FTS vs embeddings; 0004 VAPI grounding contract; 0005 rate limiting;
      0006 test strategy; 0007 license.
  - `docs(adr): record architecture decisions`
- [ ] `docs/architecture.md` deep-dive + `docs/development.md` (setup, testing, CI).

### 8.3 Presentation surface

- [ ] A **case study** (`docs/case-study.md`): problem → constraints → decisions →
      trade-offs → results → what I'd do next. This is what interviewers read.
- [ ] Deploy to production; custom domain if possible; add live link at top of README.
- [ ] Add a short "engineering principles" section echoing §1.
- [ ] Screenshots for light/dark + mobile; alt text.
  - `docs: add architecture deep-dive and case study`
  - `docs: add screenshots and live demo link`

**DoD:** a stranger can understand the project in 2 minutes and run it in 5.
**Commit count: ~8.**

---

## 12. Cross-Cutting: Git History Strategy

The commit trail is a deliverable. Rules:

1. **Never squash away the story.** Prefer many small, meaningful commits; squash only
   within a PR's fixup noise.
2. **Each commit compiles and tests green.** No "WIP" on `main`.
3. **Body explains the why**, e.g.:
   ```
   perf(search): replace in-memory scoring with postgres FTS

   Loading every segment into Node and scanning with indexOf did not scale
   past a few thousand rows and blocked the event loop per request. Move
   matching into Postgres with a tsvector GIN index; keep the JSON contract
   identical so the reader and the (future) VAPI tool are unaffected.
   ```
4. **Milestones:** tag each phase (`v0.2.0` after Phase 2, etc.) and cut GitHub
   Releases with generated notes. This shows release discipline.
5. **CHANGELOG.md** maintained via `changesets` or manual conventional grouping.
6. Keep commit types honest: don't label a refactor as `feat`.

**Suggested first 15 commits (Phase 1–2) for the track record:**

```
chore(tooling): add prettier with tailwind class sorting
chore(tooling): format codebase with prettier
build(tooling): add husky pre-commit and pre-push hooks
build(tooling): enforce conventional commits with commitlint
chore(scripts): add typecheck, test, and check scripts
refactor(types): enable stricter compiler options
docs: add license, contributing, security, and PR/issue templates
fix(ui): make landing copy accurately describe pdf-only voice q&a
feat(ui): add pricing page and remove dead nav link
feat(ui): add terms and privacy pages
feat(config): validate environment variables with zod
refactor(api): centralize auth and error mapping across route handlers
feat(api): add rate limiting to expensive endpoints
feat(security): add security headers and csp
fix(reader): self-host pdfjs worker instead of cdn
```

---

## 13. Success Metrics (how we know it's "senior")

| Metric                       | Target                                     |
| ---------------------------- | ------------------------------------------ |
| Test coverage (`src/lib/**`) | ≥ 80% lines                                |
| CI                           | Required, green, < 8 min                   |
| Lighthouse (reader, mobile)  | Perf ≥ 85, A11y = 100, Best-practices ≥ 95 |
| axe violations               | 0 serious/critical                         |
| Reader on 500-page PDF       | First paint < 2s, no jank on scroll        |
| Context search p95           | < 150ms with FTS index                     |
| False product claims         | 0                                          |
| Dead links / 404 nav         | 0                                          |
| Env misconfig                | Fails at boot with actionable message      |
| ADRs + README + case study   | Complete                                   |
| Production uptime monitor    | Active with alerts                         |

---

## 14. Suggested Timeline (part-time, ~10–12 h/week)

| Week | Phase                              | Milestone tag            |
| ---- | ---------------------------------- | ------------------------ |
| 1    | Phase 1 + start 2                  | `v0.2.0-foundations`     |
| 2    | Finish Phase 2                     | `v0.3.0-honest-hardened` |
| 3–4  | Phase 3 (tests + CI)               | `v0.4.0-tested`          |
| 5    | Phase 4 (perf)                     | `v0.5.0-scaled`          |
| 6–7  | Phase 5 (design + a11y + settings) | `v0.6.0-polished`        |
| 8+   | Phase 6 (features, pick 3–4)       | `v0.7.0-*`               |
| —    | Phase 7 (observability)            | `v0.8.0-observable`      |
| —    | Phase 8 (portfolio)                | `v1.0.0`                 |

_(Phases 6–8 can interleave; ship the case study as soon as Phase 5 lands so you can
start applying.)_

---

## 15. Risks & Decision Points

- **Scope:** Phase 6 is open-ended — cap it at **3–4 features** chosen for demo value
  (recommend 6a → 6b → 6c → 6h). Depth beats breadth for a portfolio.
- **Cost:** VAPI/ElevenLabs + Postgres + Blob cost real money. Add usage caps/quotas
  (§2.3 rate limiting helps) and a demo mode so reviewers can try without keys.
- **VAPI is external + dashboard-configured.** Document the exact contract; add a
  guard/fallback when `NEXT_PUBLIC_ASSISTANT_ID` is missing so the app degrades
  gracefully (already partially handled — formalize + test it).
- **Keyword vs semantic search.** Keep keyword FTS now (honest, cheap); add embeddings
  only as a _documented, measurable_ upgrade with an ADR — do **not** overclaim RAG.
- **License choice** must be decided in Phase 1 (affects how recruiters can reuse).
- **Don't refactor and redesign at once.** Phases are ordered to keep the app
  shippable after every step.

---

## 16. Immediate Next 5 Actions

1. Approve this plan (and the license choice in §1.3).
2. Execute **Phase 1.1** (Prettier/Husky/commitlint) — ~1 evening.
3. Ship the **honesty pass** (§2.1) — fastest visible integrity win.
4. Add **env validation** (§2.2) — removes a whole class of prod footguns.
5. Stand up **CI** (§3.5) early so every later phase is guarded.

---

_This plan is intentionally opinionated. Challenge any item in review; when a decision
changes, record it as an ADR and update this file rather than silently drifting._
