# Project skeleton: Next.js + Tailwind

Adds the initial SafeTransfer web skeleton under `web/` using Next.js App Router, TypeScript, Tailwind CSS and ESLint, without a `src/` directory or business features.

- Centered placeholder card with SafeTransfer title and subtitle; starter branding and remote font downloads removed.
- Empty mock data array, comment-only environment example and ignore rules for local environment files.
- Root README retains the original project title/description and documents setup and checks.
- Step-by-step commits and progress notes are in `docs/PROGRESS.md`.

## Run

Requires Node.js 20.9+ and npm. From the repository root:

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000.

## Validation

From `web/`:

```bash
npm run lint
npm run build
npm start
```

Lint and production build (including TypeScript) passed. Both development and production servers returned HTTP 200 with the expected placeholder. The production response also included the expected metadata and Tailwind centering styles, without starter branding. Mock data parses as an empty array. Environment ignore rules were checked.

No business features or credentials were added.
