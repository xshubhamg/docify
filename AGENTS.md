# Docify – Agent Instructions

Docify is a platform for uploading documents and getting AI-powered insights. Ask questions about your documents.

## Package manager

- Always use `bun` to run scripts, install packages and run application.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19 with React Compiler
- **Styling**: Tailwind CSS v4
- **UI**: shadcn/ui, Radix UI, Lucide icons
- **Theming**: next-themes (light/dark/system)

## Dev Environment

- Run `npm run dev` to start the development server
- Run `npm run build` to build for production
- Run `npm run lint` to run ESLint

## Project Structure

- `src/app/` – App Router pages and layouts
- `src/components/` – Reusable React components
- `src/lib/` – Utilities (e.g. `cn` for class merging)

## Coding Conventions

- Use functional components and hooks
- Prefer `"use client"` only when needed (e.g. interactivity, hooks)
- Use `@/` path alias for imports
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Follow existing patterns: Navbar, ThemeProvider, ThemeToggle

## UI & Styling

- Use Tailwind v4 syntax (e.g. `text-(--text-primary)`, `bg-(--bg-primary)`)
- Add new components via `npx shadcn@latest add <component>`
- Respect theme variables in `globals.css` for light/dark support

## Do Not

- Commit API keys or secrets
- Bypass or disable ESLint without justification
- Add dependencies without checking compatibility with Next.js 16 and React 19
