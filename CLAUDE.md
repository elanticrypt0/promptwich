# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server with HMR at http://localhost:3000
bun start        # Run production server
bun build        # Build for production (outputs to dist/)
bun test         # Run tests
```

## Architecture

This is a Bun + React + Tailwind CSS fullstack application using Bun's native HTML imports (no Vite/Webpack).

**Server** (`src/index.ts`): Uses `Bun.serve()` with file-based routing. API routes are defined in the `routes` object. The `/*` wildcard serves the React SPA for client-side routing.

**Frontend Entry** (`src/frontend.tsx`): React 19 app bootstrapped via `createRoot`, imported directly from HTML.

**Styling**: Tailwind CSS v4 with `@import "tailwindcss"` syntax in `src/index.css`.

## Key Patterns

- HTML files import `.tsx` directly - Bun's bundler handles transpilation
- API routes follow REST conventions: `/api/resource/:param` with method handlers (GET, PUT, etc.)
- Use `Response.json()` for API responses
- Dev mode enables HMR and browser console forwarding via `development: { hmr: true, console: true }`
