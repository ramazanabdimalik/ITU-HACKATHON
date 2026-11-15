# Project skeleton progress

- [x] 1. Create a Next.js app in `web/` (TypeScript, Tailwind CSS, App Router, ESLint, no `src/` directory).
- [x] 2. Create `web/data/mock.json` (empty, fake fintech data will be added later).
- [x] 3. Replace the default home page (`web/app/page.tsx`) with a clean placeholder: title "SafeTransfer", a short subtitle, a centered card layout with Tailwind. Remove all default Next.js boilerplate and logos.
- [x] 4. Add `web/.env.example` with a comment line only (no real keys). Make sure `.env*` files (except `.env.example`) are git-ignored. Do not rewrite the root `.gitignore`, only add missing lines.
- [ ] 5. Update the root `README.md`: keep the existing title and description, add short sections "Tech stack" (Next.js, TypeScript, Tailwind CSS) and "How to run" (cd web, npm install, npm run dev, open http://localhost:3000).
- [ ] 6. Run `npm run lint` and `npm run build` inside `web/` and fix any errors.

## Notes

- Initialized the checklist on `setup/project-skeleton`; next: create the draft PR and scaffold `web/`. The request cuts off after "fix any"; step 6 is interpreted as fixing lint/build errors.

- Step 1 complete: generated and installed the Next.js app with TypeScript, Tailwind, App Router and ESLint; next: add empty mock data. Draft PR creation is blocked by the proxy denying api.github.com; Git push works. npm cache and generator config use writable /workspace directories.

- Step 2 complete: added mock.json as an empty JSON array; next: replace the starter page and remove template branding.

- Step 3 complete: added the centered SafeTransfer placeholder and metadata; removed starter logos, favicon, README and remote font downloads. Next: add the environment example and ignore rules.

- Step 4 complete: added a comment-only .env.example, appended root ignore rules and exempted the example in web/.gitignore; checked that local environment files are ignored and the example is trackable. Next: document stack and run commands.
