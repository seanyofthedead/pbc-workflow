# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **React 19** + **TypeScript 6** + **Vite 8** (SPA, no SSR)
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin — **not** the v3 PostCSS setup
- ESLint flat config (`eslint.config.js`) with `typescript-eslint`, `react-hooks`, `react-refresh`

## Commands

| Task | Command |
|---|---|
| Dev server (HMR, port 5173) | `npm run dev` |
| Type-check + production build | `npm run build` |
| Lint | `npm run lint` |
| Preview built bundle | `npm run preview` |

`npm run build` runs `tsc -b` first — TypeScript errors fail the build before Vite sees the code.

There is no test runner wired up yet. If adding tests, prefer Vitest (it shares Vite's config and transforms) over Jest.

## Tailwind v4 specifics

This project uses Tailwind v4, which has materially different ergonomics from v3 — knowledge from older training data will mislead you:

- Styles are loaded via a single `@import "tailwindcss";` line in `src/index.css`. **Do not** add `@tailwind base/components/utilities` directives — those are v3 syntax and will silently produce no output in v4.
- There is **no `tailwind.config.js`** by default. Theme tokens, custom utilities, and content sources are configured in CSS using `@theme { ... }`, `@utility`, and `@source` directives in `src/index.css`. Only fall back to a JS config if a v4-incompatible plugin requires it.
- Content scanning is automatic — Tailwind v4 detects template files via the Vite plugin, so there is no `content: [...]` array to maintain.
- The Vite plugin must remain registered in `vite.config.ts` (`plugins: [react(), tailwindcss()]`); removing it kills all utility generation.

## Code layout

- `src/main.tsx` — entry, mounts `<App />` into `#root` with `StrictMode`. Imports `./index.css` (the only CSS entry).
- `src/App.tsx` — root component. Tailwind utility classes only; no per-component CSS modules or `App.css`.
- `src/index.css` — single Tailwind import. Add design tokens here via `@theme` if/when needed.
- `index.html` — Vite entry HTML; `<title>` and favicon live here, not in React.
- `public/` — static passthrough served at site root (e.g., `/favicon.svg`). Do **not** import from here in TS — use `src/assets/` for bundled assets.

The app is a single-page React SPA. There is no router, no state library, no data layer yet — add them only when a concrete need appears, and prefer to colocate state in components until the second consumer shows up.

## TypeScript config

`tsconfig.json` is a project-references shell pointing to:
- `tsconfig.app.json` — covers `src/**`, used by `vite build`'s type-check pass
- `tsconfig.node.json` — covers `vite.config.ts` and other node-side files

When adding files outside `src/` that need type-checking, add them to `tsconfig.node.json`'s `include`, not the app config.

## Conventions

- Style with Tailwind utilities directly in JSX. Reach for `@apply` or extracted components only when a class string is reused 3+ times or genuinely complex.
- React 19 — function components, hooks, no class components. Server Components do not apply (this is a Vite SPA, not Next.js).
- Path imports are relative; no `@/` alias is configured. Add one in `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json` (`paths`) together if you introduce one.
