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

A single-package, private npm app at the repo root (`preishare-org-repo`): TanStack Start (React 19 + TanStack Router file-based routes), Vite 8 + TypeScript, Tailwind CSS v4. Not a monorepo.

- **Sprint 3:** investor dashboard shell at `/dashboard`, with labelled sample data.
- **Sprint 4 (in progress):** sponsor sign-in with Supabase Auth, the dashboard guarded behind it, and Supabase migrations for `property_listings` / `sponsor_profiles` with Row Level Security.
- **Not done yet:** no Supabase project is provisioned and the migrations are not applied, so sign-in can't succeed and `/dashboard` redirects to `/login`. Dashboard pages still render sample data, not database rows.

## Stack

| Choice | Value |
|--------|--------|
| Framework | React 19 + TanStack Start |
| Starter | Blank / default file-router preset |
| Package manager | npm |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Toolchain | Vite 8 + TypeScript |
| Router | TanStack Router file-based routes (`src/routes`) |
| Auth / database | Supabase (`@supabase/supabase-js`, `@supabase/ssr`); Postgres with Row Level Security |

## Scripts

Only these are defined in `package.json` — don't assume others exist (no `test`, `lint`, or `format` script yet):

```bash
npm install
npm run dev             # Vite on port 3000
npm run build
npm run preview
npm run typecheck       # tsc --noEmit
npm run generate-routes # regenerates src/routeTree.gen.ts
```

The Supabase CLI is **not** installed or configured (no `supabase/config.toml`). Don't add it without team approval; see `docs/data-model/rls-policy-review.md` for how migrations get applied.

## Layout (preserve unless there is a clear reason to change)

- `src/routes/` — file routes: `__root.tsx`, `index.tsx`, `about.tsx`, `auth/` (`login.tsx`, `signup.tsx`), and `dashboard/` (`route.tsx` = the `/dashboard` layout + guard; child pages `index.tsx`, `portfolio.tsx`, `deals.tsx`, `profile.tsx`, `properties.index.tsx`, `properties.new.tsx`)
- `src/router.tsx` — router factory
- `src/components/` — starter Header, Footer, ThemeToggle; `dashboard/` (AppShell, Header, Sidebar, MobileNav, SignOutButton, page widgets); `layout/navConfig.ts`
- `src/lib/` — shared helpers:
  - `supabase/server.ts` — `getSupabaseServerClient()`: server client acting as the signed-in user (server-only via `createServerOnlyFn`)
  - `supabase/client.ts` — `getSupabaseBrowserClient()`: browser client, public `VITE_` values only (sign-in / sign-out; `createClientOnlyFn`)
  - `supabase/types.ts` — hand-written `Database` types from the migrations; update in the same change as any migration
  - `auth.functions.ts` — `getCurrentUser` server function used by the dashboard guard
  - `auth-validation.ts` — shared sign-in validation, error wording, safe redirect paths
  - `user.ts` — old placeholder (`getUser()` returns `null`); superseded by `getCurrentUser`
- `src/env.d.ts` — typed env names (strict `import.meta.env`, `ServerEnv`)
- `supabase/migrations/` — schema + RLS, applied in filename order
- `src/styles.css` — Tailwind entry and theme tokens
- `src/styles/dashboard.css` — dashboard shell, grid, and accessibility styles (imported by `src/styles.css`)
- `vite.config.ts` — `devtools()`, `tailwindcss()`, `tanstackStart()`, `viteReact()`
- `tsr.config.json` — route generation config

## Dashboard shell rules

Apply to `/dashboard` routes, `src/components/layout/`, and `src/components/dashboard/`. Where they differ from the Cursor rules, these win:
- `.cursorrules` says "Use the Supabase client from `lib/supabase.ts`". There is deliberately **no** shared `src/lib/supabase.ts`. Use `src/lib/supabase/server.ts` (server) or `src/lib/supabase/client.ts` (browser sign-in / sign-out only), so server code can't leak into the browser bundle.
- `.cursorrules` says "Write tests for new features", but no test runner is configured yet. Verify with `npm run typecheck`, `npm run build`, and the checks in the relevant docs.

- **Source of truth:** `docs/dashboard-ia.md` (URLs, pages) and `docs/component-plan.md` (component responsibilities). Ask before adding pages or changing scope.
- **Sample data, real sign-in:** page content (metrics, holdings, deals, profile) is still sample data, labelled "Sample". Access is real: `/dashboard` requires a Supabase session. Don't wire pages to database rows until a task asks for it, and never add payments.
- **Shared frame:** `src/routes/dashboard/route.tsx` guards every dashboard page and wraps its `<Outlet />` in `AppShell`. Pages render only their own content (`<section>` and `h2`) and never build their own sidebar, header, `<main>`, or `h1`.
- **Landmarks:** an `<aside>` containing a labelled `<nav>`, one `<header>`, and one `<main id="main-content">`.
- **Spacing:** keep the shell's `gap-6` and the padded content card so page content doesn't sit against the frame.
- **One job per component:** `AppShell`, `Sidebar` and `Header` hold no page widgets (stats cards, tables, lists); those belong to page components. Nav links come from the single `navConfig` in `src/components/layout/navConfig.ts`.

## Auth and data rules (Supabase)

- **Identity is enforced by Postgres, not the UI.** Every policy compares the row's owner with `auth.uid()` (`owner_id = auth.uid()`). Never "secure" data by filtering it in React.
- **Normal requests run as the signed-in user** (anon key + session), so RLS applies. The **service-role key bypasses RLS**: server-only admin code in its own `*.server.ts` module, never in browser code, shared React components, loaders, or a `VITE_` variable.
- **Session checks use `auth.getUser()`**, not `auth.getSession()`, so the session is verified.
- **The guard lives on the layout route** (`src/routes/dashboard/route.tsx` `beforeLoad` → `getCurrentUser` server function). `beforeLoad` and loaders also run in the browser, so they call server functions; they never import `*.server.ts` directly.
- **Server-only / browser-only code:** TanStack Start's import protection only blocks files *named* `*.server.*` (from the browser) and `*.client.*` (from the server). `src/lib/supabase/server.ts` and `client.ts` don't match those names, so they're protected by wrappers instead: `createServerOnlyFn` (body stripped from the browser bundle, throws if called there) and `createClientOnlyFn` (throws during server rendering). Keep those wrappers; never name a helper `*.client.*` if server-rendered pages import it.
- **Migrations:** schema SQL lives only in `supabase/migrations/`. Never edit a migration that may have been applied; add a new one with a later timestamp. Each migration needs a unique timestamp. Every new table with sponsor data needs `ENABLE ROW LEVEL SECURITY` and owner-scoped policies (no `USING (true)`).
- **Design docs:** `docs/data-model/property-listings-schema.md`, `docs/data-model-and-rls-matrix.md`, `docs/data-model/rls-policy-review.md` (incl. open risks R1–R9), `docs/requirements/sponsor-auth-and-listings-brief.md`.

## Docs & Onboarding

`docs/onboarding/` holds:
- `repo-map.md` — verified top-level map, frontend/backend/tooling split, safe-first-touch and do-not-edit-yet lists, open questions.
- `setup-log.md` — one learner's verified fork/clone/remote setup record.
- `team-orientation-notes.md` — referenced by `setup-log.md` but **not present** in this checkout; don't assume its contents.

## Agent Workflow: plan → small diff → verify

1. **Plan** — skim `docs/onboarding/repo-map.md` and [.cursor/rules/preishare.mdc](.cursor/rules/preishare.mdc) before non-trivial changes. For Start/Router/Devtools work, check `npx @tanstack/intent@latest list` for a matching skill first.
2. **Small diff** — make the minimal, scoped edit. Don't touch `src/routeTree.gen.ts` (generated), `package-lock.json`, or tooling config without a reason. For a first change, touch one file (or one small group of related files) and avoid opening unrelated edits in the same branch/PR.
3. **Verify** — re-read the changed file(s), check for errors, and run the relevant script (`npm run build` / `npm run dev`) when the change affects runtime behavior.

If an onboarding check (e.g. a smoke test in `docs/onboarding/`) finds a gap in this file or in `.cursor/rules/preishare.mdc`, patch that specific file with a small, targeted addition and re-test — don't leave the gap, and don't rewrite the file's broader scope to fix it.

See [.cursor/rules/preishare.mdc](.cursor/rules/preishare.mdc) for the full edit-surface and do-not rules.

## Environment variables

Names are listed in `.env.example` (placeholders only, committed) and explained in `docs/env-var-checklist.md`. Real values go only in a local `.env` and in Vercel; every `.env.*` file except `.env.example` is gitignored.

- **Server-only:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (secret), `DATABASE_URL` (secret). Read with `process.env` inside handlers / `createServerFn`, never at module scope, never with a `VITE_` prefix. In `src/lib/supabase/server.ts`, read through `readServerEnv()` so typos fail the type-check.
- **Client-safe:** only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, via `import.meta.env`. Strict env typing (`src/env.d.ts`) makes any other `import.meta.env` name a type error.
- **Adding a variable:** add it to `.env.example` (empty), the checklist table, and `src/env.d.ts`.
- **Never** paste real URLs or keys into committed files, docs, or chat.

## Known gotchas

- `intent install` keeps a short skill-loading block at the top of this file; durable project notes live below it.
- Nested `my-tanstack-app/` from the original create command was flattened into this repo root on purpose.
- No host-specific deployment adapter; TanStack Start deploys to Vercel via Vite + Nitro. Vercel needs Node ≥ 22.12.
- `src/routes/dashboard.tsx` must not exist: the `/dashboard` layout is `src/routes/dashboard/route.tsx` (file name required by the current sprint). TanStack treats both names as the same route, so having both would define `/dashboard` twice.
- A blocked UPDATE/DELETE under RLS returns success with 0 rows, not an error. Treat 0 rows as "not found" (404), never as "saved".
