<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `npx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# Project context

## What PREIShare Is

A single-package, private npm app at the repo root (`preishare-org-repo`) — a blank TanStack Start scaffold: React 19 + TanStack Router file-based routes, Vite 8 + TypeScript, Tailwind CSS v4. Not a monorepo; no backend/data layer implemented yet.

## Stack

| Choice | Value |
|--------|--------|
| Framework | React 19 + TanStack Start |
| Starter | Blank / default file-router preset |
| Package manager | npm |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Toolchain | Vite 8 + TypeScript |
| Router | TanStack Router file-based routes (`src/routes`) |
| Integrations / add-ons | None |

## Scripts

Only these are defined in `package.json` — don't assume others exist (no `test`, `lint`, or `format` script yet):

```bash
npm install
npm run dev             # Vite on port 3000
npm run build
npm run preview
npm run generate-routes # regenerates src/routeTree.gen.ts
```

## Layout (preserve unless there is a clear reason to change)

- `src/routes/` — file routes (`__root.tsx`, `index.tsx`, `about.tsx`)
- `src/router.tsx` — router factory
- `src/components/` — Header, Footer, ThemeToggle
- `src/lib/` — shared TypeScript helpers (e.g. `user.ts`)
- `src/styles.css` — Tailwind entry
- `vite.config.ts` — `devtools()`, `tailwindcss()`, `tanstackStart()`, `viteReact()`
- `tsr.config.json` — route generation config

## Docs & Onboarding

`docs/onboarding/` holds:
- `repo-map.md` — verified top-level map, frontend/backend/tooling split, safe-first-touch and do-not-edit-yet lists, open questions.
- `setup-log.md` — one learner's verified fork/clone/remote setup record.
- `team-orientation-notes.md` — referenced by `setup-log.md` but **not present** in this checkout; don't assume its contents.

## Agent Workflow: plan → small diff → verify

1. **Plan** — skim `docs/onboarding/repo-map.md` and [.cursor/rules/preishare.mdc](.cursor/rules/preishare.mdc) before non-trivial changes. For Start/Router/Devtools work, check `npx @tanstack/intent@latest list` for a matching skill first.
2. **Small diff** — make the minimal, scoped edit. Don't touch `src/routeTree.gen.ts` (generated), `package-lock.json`, or tooling config without a reason.
3. **Verify** — re-read the changed file(s), check for errors, and run the relevant script (`npm run build` / `npm run dev`) when the change affects runtime behavior.

See [.cursor/rules/preishare.mdc](.cursor/rules/preishare.mdc) for the full edit-surface and do-not rules.

## Environment variables

None required for the blank scaffold. When adding secrets or config later:
- **Server-only:** read `process.env.MY_SECRET` inside handlers / `createServerFn` — never at module scope, never with a `VITE_` prefix.
- **Client-exposed:** only `VITE_*` via `import.meta.env.VITE_*`.
- `.env` is gitignored.

## Known gotchas

- `intent install` keeps a short skill-loading block at the top of this file; durable project notes live below it.
- Nested `my-tanstack-app/` from the original create command was flattened into this repo root on purpose.
- No host-specific deployment adapter yet; TanStack Start deploys via Vite + Nitro when that's needed.
