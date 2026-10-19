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

### Changed

- Formatted the codebase with the shared Prettier configuration.
- Replaced in-memory keyword scoring with Postgres full-text search and a GIN index.
- Reader payloads now send a bounded preview per segment instead of full text.
- Upload dropzones are keyboard and drag accessible; deletion uses a modal dialog.
- Removed dead Clerk CSS and repaired undefined color tokens.

### Fixed

- Race condition in document slug allocation under concurrent uploads.
- `.env.example` was gitignored despite setup docs referencing it.
- Dead `#` links in the auth forms and a missing `/pricing` route.

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
