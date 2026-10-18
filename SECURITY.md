# Security Policy

## Supported versions

Docify is a continuously deployed application; only the latest `main` is
supported.

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Report privately
via GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
or email the maintainer listed on the repository profile.

Include:

- A description of the issue and its impact
- Steps to reproduce (or a proof of concept)
- Affected routes/files if known

You can expect an acknowledgement within 72 hours.

## Security model (summary)

- **Authentication:** Better-Auth (email/password + Google OAuth); sessions are
  httpOnly cookies handled by `nextCookies`.
- **Authorization:** every document query is scoped by `userId`. Unknown or
  foreign slugs return `404` to avoid leaking existence.
- **Storage:** Vercel Blob with `access: "private"`. Files are streamed through
  authenticated proxy routes (`/api/documents/[slug]/file|cover`); raw blob URLs
  are never exposed. Upload tokens are prefix-scoped to the user and expire.
- **Input validation:** Zod at API boundaries; PDF constraints re-checked against
  blob metadata server-side.
- **Secrets:** never committed; `.env*` is gitignored. Rotate any key that was
  ever exposed.

## Operational notes

- Rate limiting and security headers are tracked in `plan.md` (Phase 2).
- Orphaned blobs are cleaned best-effort; a scheduled GC job is planned.
