# Contributing to Docify

Thanks for taking a look. This document keeps changes consistent and reviewable.

## Setup

```bash
bun install
cp .env.example .env.local   # fill in the values
bun db:migrate               # or: bun db:push
bun dev
```

## Scripts

| Command                | Purpose              |
| ---------------------- | -------------------- |
| `bun dev`              | Start the dev server |
| `bun run build`        | Production build     |
| `bun run lint`         | ESLint               |
| `bun run typecheck`    | TypeScript, no emit  |
| `bun run format`       | Format with Prettier |
| `bun run format:check` | Verify formatting    |
| `bun run check`        | Lint + typecheck     |

## Commit convention

We use [Conventional Commits](https://www.conventionalcommits.org/). The
`commit-msg` hook rejects anything else.

```
type(scope): imperative summary

Why this change is needed, what it affects, and anything a reviewer
should know. Wrap the body at a reasonable width.
```

Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`,
`chore`, `style`.

Scopes: `reader`, `ingest`, `auth`, `voice`, `blob`, `ui`, `db`, `api`,
`deps`, `ci`, `docs`.

## Pull requests

- Keep PRs focused; prefer several small PRs over one large one.
- Every commit must typecheck, lint, and build.
- UI changes need light **and** dark screenshots at mobile and desktop widths.
- Update `AGENTS.md` and this file when behavior or conventions change.
- Do not commit secrets. `.env*` is ignored except `.env.example`.

## Coding standards

- TypeScript strict mode; avoid `any` and non-null assertions on env values.
- Validate all external input with Zod at the boundary.
- Use the Catppuccin CSS tokens in `src/app/globals.css`; do not hardcode hex.
- Throw `DocumentFlowError` for expected domain failures.
- Never expose raw blob URLs or use `access: "public"` for user files.
- Keep the product copy honest: Docify supports PDFs and keyword-grounded voice
  Q&A — not Word, OCR, or semantic RAG.
