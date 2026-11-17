# PREIshare dashboard — CI project inventory

## Purpose
List what this repo can run automatically on a GitHub-hosted runner for pull requests,
what needs secrets or external services, and what stays human. Downstream pipeline
design must use only real package-manager and script names found here.

*Evidence: every Bucket A check except `npm ci` was run on 2026-11-17 in a copy of the repo with
**no `.env` file and no keys in the environment**, so "headless-safe" here is tested, not
assumed. The local machine runs Node 24.12 / npm 11.6; CI should use Node 22 (≥ 22.12) to match Vercel.*

## Repo facts (fill from the real project)
- Package manager: **`npm`** (matches the lockfile)
- Lockfile present: **`package-lock.json`** only (no `pnpm-lock.yaml`, `yarn.lock` or `bun.lockb`)
- Node/TypeScript app signals: `package.json` (`"type": "module"`), `tsconfig.json`, `src/`, `src/router.tsx`
- Framework signals: **React 19 + TanStack Start**: `@tanstack/react-start`, `@tanstack/react-router` and `react` in `package.json`; `tanstackStart()` and `viteReact()` in `vite.config.ts`; file routes in `src/routes/`
- Test runner (if any): **none found** (no vitest, jest or test files). The `test` script (added 2026-11-17) runs the existing self-check with plain Node, no runner needed
- Lint tool (if any): **none found** (no eslint, biome or prettier config or script)

## Scripts discovered in package.json
| Script name | Exact command (from package.json) | Role |
|-------------|-------------------------------------|------|
| `dev` | `vite dev --port 3000` | local dev server (not for CI) |
| `generate-routes` | `tsr generate` | regenerates `src/routeTree.gen.ts` (**not** for CI, see Risks) |
| `build` | `vite build` | build |
| `preview` | `vite preview` | serves the build (used by the smoke test) |
| `typecheck` | `tsc --noEmit` | typecheck |
| `test` | `node src/lib/embeddings/self-check.ts` | test (added 2026-11-17; embedding size checks only) |

Missing common checks (write MISSING if not present):
- typecheck: present (`npm run typecheck`)
- build: present (`npm run build`); note it does **not** type-check by itself
- lint: **MISSING**
- test: present since 2026-11-17 (`npm test` → `node src/lib/embeddings/self-check.ts`). Real pass/fail checks, but they only cover the embedding size; no test tool yet

## Bucket A — Headless-safe on GitHub-hosted runners
Checks that need only a clean checkout, the lockfile install, and public tooling.
For each item: script name, why it belongs in PR CI, rough order (install → typecheck → lint → test → build or as fits this repo).

1. **`npm ci`**: installs exactly the lockfile versions in a clean environment, which catches a
   `package-lock.json` out of sync with `package.json`. *(Not run in the test copy; confirm on the first CI run.)*
2. **`npm run typecheck`** ✅ pass (~2 s): catches type errors, including misspelled env names
   (strict `src/env.d.ts`). Needed because the build doesn't type-check.
3. **lint**: MISSING. Leave it out, or show it as skipped; never fake a pass.
4. **`npm test`** ✅ "All checks passed." (<1 s): runs `src/lib/embeddings/self-check.ts`, the same checks as #8 below. Needs Node 22.18+ to run `.ts` directly (`setup-node` 22 gets the latest 22.x).
5. **`npm run build`** ✅ pass with no env at all (~2 s): catches anything that breaks the build
   before Vercel sees it.
6. **Route tree up to date** ✅: after the build, `git diff --exit-code src/routeTree.gen.ts`.
   Catches a route added or renamed without committing the regenerated tree.
7. **Secret scan of browser files** ✅ 0 hits: `grep -rlE` over `.output/public` for the
   secret-hygiene audit's patterns (secret-key, service-role, OpenAI, DB-URL). Catches a server
   key or the OpenAI address leaking into the browser.
8. **`node src/lib/embeddings/self-check.ts`** ✅ "All checks passed." (<1 s): catches the
   migration and `src/lib/embeddings/types.ts` disagreeing on the vector size (1536). Offline, no key.
   **Now run as `npm test` (#4);** don't add it to CI a second time.
9. **Expected type errors still fail** ✅ exactly 5 errors: `npx tsc --noEmit --ignoreConfig
   --skipLibCheck --strict --target ES2022 --module ESNext --moduleResolution bundler
   src/fixtures/invalid-listings.errors.ts` must **fail** with the 5 errors documented in
   `docs/type-safety/expected-type-errors.md`. Catches the listing types getting loose.
10. **Signed-out smoke test** ✅: `npm run preview`, then `curl`:
    - `/` → 200
    - `/dashboard` and `/dashboard/listings` → 307 to `/auth/login?redirect=…`
    - `/search` → 200
    - `/api/properties/search` (no `q`) → 400
    - `?q=cabin` signed out → 401

    With no env, the app fails closed. Catches the guard or the API's sign-in check breaking.
11. **`npm audit --audit-level=high`** ❌ **fails today: 19 vulnerabilities (16 high, 3
    moderate)**, e.g. `nanoid`, `picomatch`, `source-map-js`. It needs no secrets, but it does need
    the npm registry (internet). Make it **warn-only** at first, or CI is red on day one.

## Bucket B — Needs secrets, env, or external services
Do **not** put these in the first PR CI job unless the team later adds protected secrets and a safe plan.
Examples to verify against this repo: Supabase URL/keys, database URLs, private package tokens.

| Check or step | Why it is not headless-safe | What would be required later |
|---------------|-----------------------------|------------------------------|
| Seed sample properties (`node --env-file=.env scripts/seed-property-embeddings.ts`) | Needs `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) and `OPENAI_API_KEY`; **writes** to the database and spends money | Never in PR CI. At most a manual job against a separate test project |
| Apply migrations (`supabase/migrations/*.sql`) | Pasted by hand into the Supabase SQL Editor; no CLI (`supabase/config.toml` absent); `DATABASE_URL` unused | Team approval for the Supabase CLI, a test project, `DATABASE_URL` as a GitHub encrypted secret |
| Data checks (10 rows, 0 null embeddings, all 1536) | Needs a live database and a privileged key | A test project, seeded the same way, with a read-only check |
| Ranking queries (brief queries 1–4, keyword trap) | Needs `OPENAI_API_KEY` + a live database; costs per run; results need human judgement | An OpenAI key in GitHub secrets, a test project, and a non-PR schedule to limit cost |
| Signed-in search (API 200 path, `/search` results) | Needs a real session cookie, OpenAI and a database | A test account in a test project, plus browser or API automation |
| Sign-up / sign-in / sign-out | Needs a Supabase project and a test account (email confirmation is on) | A test project with a pre-confirmed test user; credentials as secrets |
| RLS probes (anon read returns 0 rows; User A can't see User B) | Needs the project URL, the publishable key and two test accounts | A test project with two seeded users |
| Vercel env vars and deploys | Outside the repo; production access | Stays with Vercel and humans; not part of PR CI |

## Bucket C — Human judgment (not a green checkmark)
Items CI must not pretend to decide: product intent, UX quality, security-sensitive design,
"should we merge", AI review suggestions that still need a person.

- **RLS policies and grants fit the data**: `USING (true)` is OK on sample `properties`, never on sponsor `property_listings`.
- **Security choices in SQL**: `SECURITY INVOKER` and `SET search_path = ''` on `match_properties`; revoke-then-grant.
- **Reading every migration before it's applied**: CI never touches the database.
- **Where secrets are used**: the service-role key only in the seed script; the OpenAI key server-only (`createServerOnlyFn`).
- **Scope vs the client story**: agent-written changes can add out-of-scope work (filters, new pages).
- **Feature quality**: search ranking (the accepted keyword-trap weakness), wording, accessibility, layout.
- **Template deviations**: were the listed adaptations from course templates agreed?
- **Changes to the CI workflow itself**: need a mentor's go-ahead (`docs/onboarding/first-contribution-plan.md`).
- **AI review suggestions**: they assist; a human stays accountable.
- **Should we merge**: green CI is required, never sufficient.

## Supabase / env caveats for CI
- Env var **names** referenced by the app or `.env.example` (values never committed):
  - Server-only: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - Server-only **secrets**: `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `DATABASE_URL` (commented out, unused)
  - Public: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Local-only or dashboard-only steps (migrations against prod, manual SQL, etc.):
  - the 5 migrations in `supabase/migrations/`, applied in the SQL Editor
  - the seed script (run locally with `--env-file=.env`)
  - SQL Editor verification queries
  - Vercel environment variables
- Recommendation for Sprint 6 PR CI: **keep the first pipeline on Bucket A only.** It needs **no
  env vars at all**: the build, smoke test and self-check all pass with none set, and the app fails
  closed. So the workflow should define no secrets.

## Risks and open questions
- **Multiple lockfiles?** No, only `package-lock.json`. There's a leftover `"pnpm"` block in
  `package.json`; it's harmless with npm.
- **Scripts that call interactive tools?** No. None of the Bucket A commands prompt.
- **Tests that need a browser or network?** No. `npm test` (the self-check) is offline. The smoke test needs a local
  server (`npm run preview`) and `curl`, but no browser. `npm audit` needs the npm registry.
- **Don't use `npm run generate-routes` in CI.** `tsr generate` writes a route tree **without**
  the TanStack Start `Register` block that `npm run build` adds, so its output differs from the
  committed file. Tested: generate-routes changed the file; a build changed it back.
- **Check 9 needs `--ignoreConfig`.** TypeScript 6 refuses to compile a single file while
  `tsconfig.json` exists (`error TS5112`).
- **`"latest"` versions** for several TanStack packages: safe with `npm ci` (the lockfile pins
  them), but `npm install` can drift.
- **No `engines` field**, while Vercel needs Node ≥ 22.12. Add `"engines": { "node": ">=22.12.0" }`?
- **`npm audit`**: warn-only now; block once the 19 findings are fixed or accepted?
- **Lint tool**: which, and when? (Needs a new package and approval.) **Test tool**: `npm test` covers only the embedding size; real tests (auth, validation) still need a tool.

## Link back to earlier docs
- Pain/goals addressed by Bucket A (from `docs/ci/pr-pain-and-goals.md`):
  - "Build, typecheck, lint, and test are easy to skip": typecheck and build run on every PR.
  - "Broken code can reach the main branch": checks run before merge.
  - "Reviewers spend energy re-running basic 'does it build?' work": the robot does it.
  - Vercel being the first to catch problems (Sprint 3 security issue): build + `npm audit` on the PR.
  - The hand-run secret search: the secret scan as a step.
- CI idea used: automated checks on every PR before merge (from `docs/ci/ci-concepts-notes.md`).
  Lint is left out rather than faked, per its "CI washing" non-examples; `test` uses a real check that already existed.

## Source files inspected
- `package.json`
- `package-lock.json` (the only lockfile)
- `tsconfig.json`, `vite.config.ts`, `app.config.ts`, `tsr.config.json`, `src/router.tsx`, `src/routes/`, `src/routeTree.gen.ts`
- `.gitignore`, `.env.example` (names only)
- `src/env.d.ts`, `src/lib/embeddings/self-check.ts`, `src/fixtures/invalid-listings.errors.ts`, `docs/type-safety/expected-type-errors.md`
- `supabase/migrations/` (5 files), `scripts/seed-property-embeddings.ts`
- `README.md`, `AGENTS.md`, `docs/onboarding/first-contribution-plan.md`
