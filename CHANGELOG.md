# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]

### Added

- Prettier, Husky, lint-staged, and commitlint tooling.
- Strict TypeScript compiler options.
- Project governance docs (license, contributing, security, code of conduct).
- Vitest unit suite with coverage thresholds, plus a CI workflow.
- Rate limiting for document creation, uploads, voice sessions, context search, and
  blob cleanup (Upstash when configured, in-memory fallback).
- Security headers and a Content Security Policy.
- Zod-validated server environment with fail-fast boot.
- Real `/pricing`, `/terms`, and `/privacy` pages.
- Responsive mobile navigation and a working settings page.
- Open Graph image and social metadata generated at build time.
- `/api/health` database readiness probe.
- Skip link and per-page `main` landmarks for keyboard and screen-reader users.
- Engineering case study under `docs/`.

### Changed

- Formatted the codebase with the shared Prettier configuration.
- Replaced in-memory keyword scoring with Postgres full-text search and a GIN index.
- Reader payloads now send a bounded preview per segment instead of full text.
- The reader mounts only a window of PDF pages, keeping long documents responsive.
- Upload dropzones are keyboard and drag accessible; deletion uses a modal dialog.
- Removed dead Clerk CSS and repaired undefined color tokens.
- Drizzle commands now load `.env.local` the same way Next.js does.

### Fixed

- Race condition in document slug allocation under concurrent uploads.
- `.env.example` was gitignored despite setup docs referencing it.
- Dead `#` links in the auth forms and a missing `/pricing` route.
- Malformed upload payloads returned 500 instead of 400.
- Google sign-in was offered even when OAuth was not configured.
- The dashboard showed "No documents match" for an account with no documents.

## [0.1.0] - 2026-09-14

### Added

- PDF upload with private Vercel Blob storage and authenticated proxy routes.
- Server-side PDF extraction, chunking, and transactional segment storage.
- Document reader with page navigation, segment previews, and voice panel.
- Grounded VAPI voice calls with ElevenLabs voice overrides.
- Session-authenticated keyword context search.
- Voice session history.
- Better-Auth email/password and Google OAuth.
- Catppuccin-based light/dark design system.
