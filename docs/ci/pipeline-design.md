# PREIshare PR CI — Pipeline Design

## Purpose
Plain-language design for automated checks on every pull request for the PREIshare dashboard.
This document is the source of truth for the GitHub Actions workflow we will write next.
It does **not** deploy anything and does **not** replace human review.

*Sources: `docs/ci/project-ci-inventory.md` (every command below; tested 2026-11-17 with no
`.env`), `docs/ci/pr-pain-and-goals.md` (why), `docs/ci/ci-concepts-notes.md` (what counts as real CI).*

## Trigger
- Event: `pull_request`
- Branches: PRs targeting the main integration branch (`main`)
- Goal: every proposed change gets the same install → check → build loop before merge discussion continues

## Ordered stages (happy path)
1. **Checkout** — fetch the PR commit so the runner has the proposed code
2. **Setup Node** — install the Node.js version the repo expects (match `.nvmrc` / `package.json` engines if present)
   - PREIshare has **neither** `.nvmrc` nor `engines`. Source of truth today: `README.md` and
     `AGENTS.md` ("Node.js 22.12.0 or newer", which Vercel also needs). Use **Node 22**.
3. **Install dependencies** — clean install from the lockfile (`npm ci`; `package-lock.json` is the only lockfile)
4. **Lint** — static style/quality checks (only if inventory confirms a lint script/config)
   - `npm run lint` (added 2026-11-17: `eslint .`, config `eslint.config.js`). 0 errors on the current code; proven to fail on a planted bad file.
5. **Typecheck** — TypeScript compiler check without emitting a full production bundle first when possible
   - `npm run typecheck` (`tsc --noEmit`). Needed even though there's a build: `vite build` does **not** type-check.
6. **Test** — unit/integration tests the inventory marked CI-ready
   - `npm run test` (added 2026-11-17: `node src/lib/embeddings/self-check.ts`). Real pass/fail
     checks with plain Node, no new package. Covers the embedding size only.
7. **Build** — production or app build so broken imports/config fail on the PR, not after merge
   - `npm run build` (`vite build`). Passes with no env.

**PREIshare-specific stages after Build** (all Bucket A in the inventory: no secrets, tested
2026-11-17). They come after Build because 8, 9 and 12 need its output; 10 and 11 are cheap
and grouped here so the core stages above stay as the template orders them:

8. **Route tree committed**: `git diff --exit-code src/routeTree.gen.ts`. The build regenerates
   the file, so any difference means a route change wasn't committed.
9. **No secrets in browser files**: `grep` over `.output/public` for the secret-hygiene patterns:
   - `sb_secret_[A-Za-z0-9_-]{10,}`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`, `api.openai.com`, `sk-[A-Za-z0-9_-]{20,}`
   - DB URLs with a password

   Fails on any match. This replaces the hand-run search that is easy to forget.
10. ~~Embedding size check~~: **moved into stage 6 (Test)**, since `npm run test` runs the same
    self-check. Don't add it again; the numbering is kept so other references still match.
11. **Invalid listing fixture still fails**: `npx tsc --noEmit --ignoreConfig --skipLibCheck
    --strict --target ES2022 --module ESNext --moduleResolution bundler
    src/fixtures/invalid-listings.errors.ts` must fail with exactly **5** errors
    (`docs/type-safety/expected-type-errors.md`). It fails the job if the fixture compiles.
12. **Signed-out smoke test**: run `npm run preview` in the background, `curl`, then stop it.
    Expected:
    - `/` → 200
    - `/dashboard` and `/dashboard/listings` → 307 to `/auth/login?redirect=…`
    - `/search` → 200
    - `/api/properties/search` → 400
    - `?q=cabin` → 401

> Adjust step order only with a written reason. Typical rule: install before anything that needs `node_modules`; cheaper/faster checks (lint/typecheck) before slower tests/build when scripts allow.

## Commands / scripts (from inventory)
| Stage       | Script or command (from project-ci-inventory) | Required on PR? |
|-------------|-----------------------------------------------|-----------------|
| Install     | `npm ci`                                      | Yes             |
| Lint        | `npm run lint` (`eslint .`)                   | Yes             |
| Typecheck   | `npm run typecheck` (`tsc --noEmit`)          | Yes             |
| Test        | `npm run test` (`node src/lib/embeddings/self-check.ts`) | Yes             |
| Build       | `npm run build` (`vite build`)                | Yes             |
| Route tree committed | `git diff --exit-code src/routeTree.gen.ts` (after Build) | Yes |
| No secrets in browser files | `grep -rlE` secret patterns over `.output/public` | Yes |
| Embedding size check | covered by **Test** (`npm run test`); not a separate step | — |
| Invalid fixture still fails | `npx tsc --noEmit --ignoreConfig … src/fixtures/invalid-listings.errors.ts` → must fail with 5 errors | Yes |
| Signed-out smoke test | `npm run preview` + `curl` status checks | Yes |
| Dependency audit | `npm audit --audit-level=high` | **No (optional, separate job)**: fails today, 25 findings (22 high) |

Every cell above comes from `docs/ci/project-ci-inventory.md`. **Never** use
`npm run generate-routes` in CI: `tsr generate` writes a route tree without TanStack Start's
`Register` block, so stage 8 would always fail.

## Failure policy
- Any required stage failing → the CI job fails (red X on the PR)
- Do not add `continue-on-error: true` for required quality gates
- Optional/experimental checks (if any) must be labeled optional and must not block understanding of required failures
  - The only optional check is **Dependency audit**. It runs as its own job named as optional, so its result never mixes with the required job's.
- Humans still decide merge; CI only reports whether automated gates passed
- Stage names are written as plain words (e.g. "No secrets in browser files"), so the PR page says which gate failed.

## Caching intent
- Cache dependency downloads (npm/pnpm/yarn cache) keyed on the lockfile so repeated PRs install faster
  - PREIshare: the **npm** cache, keyed on `package-lock.json`.
- Do not cache build output across unrelated PRs in a way that hides freshness problems
  - PREIshare: never cache `.output/`, `.nitro/` or `.tanstack/`; stages 8, 9 and 12 must see this PR's own build.
- Note: exact cache actions land in the workflow YAML later; here we only record the intent

## Environment and secrets
- Prefer checks that run with committed config and public env defaults
  - PREIshare: **no env vars at all.** Every required stage passed with no `.env` (inventory). The app fails closed: no Supabase config means signed-out redirects and 401s.
- No production secrets in PR CI logs
  - PREIshare: **no secrets of any kind** in this workflow (no Supabase keys, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL`). Read-only repo permissions.
- If tests need env vars, list only non-secret placeholders or documented dummy values
- Do not connect PR CI to production Supabase projects

## Explicitly out of scope for this PR pipeline
- Production or staging **deploy**
- Live **Supabase** schema migrations or data mutations against shared/prod projects
- Manual QA, product acceptance, and final merge approval (human review)
- AI auto-merge or unattended approval of PRs

PREIshare items from inventory Bucket B, also out:
- the seed script
- data checks
- ranking queries (these call OpenAI)
- signed-in search
- real sign-in flows
- RLS probes with test accounts

## Mapping back to PREIshare goals
- Pain addressed: teammates no longer rely on memory to install/build/test locally before review
- Inventory sources: list which inventory rows drove each required stage
  - Install ← Repo facts (npm, `package-lock.json`) + Bucket A #1
  - Typecheck ← Scripts table (`typecheck`) + Bucket A #2
  - Build ← Scripts table (`build`) + Bucket A #5
  - Route tree ← Bucket A #6 + Risks (don't use `generate-routes`)
  - No secrets ← Bucket A #7 + "Supabase / env caveats"
  - Test (embedding size) ← Scripts table (`test`) + Bucket A #4 / #8
  - Invalid fixture ← Bucket A #9
  - Smoke test ← Bucket A #10
  - Lint ← Scripts table (`lint`) + Bucket A #3
  - Dependency audit (optional) ← Bucket A #11
- Human boundary: CI is a consistent signal; reviewers still own judgment (and later AI review prompts support—not replace—that judgment)
  - PREIshare examples: RLS rules vs data, `SECURITY INVOKER`, reading migrations, where secrets are used, scope, ranking quality (inventory Bucket C).

## Open questions / gaps
- [x] Any CI-ready script missing from package.json? **Not any more.** `test` (the existing self-check) and `lint` (ESLint, a newly approved dev dependency) were both added 2026-11-17.
- [x] Node version source of truth unclear? **Partly:** only `README.md` / `AGENTS.md` say 22.12+. Add `"engines": { "node": ">=22.12.0" }` to `package.json`? (decision)
- [x] Tests that need a database: skipped, mocked, or blocked until a safe test setup exists? **Skipped.** `npm run test` needs no database, and everything database-backed is Bucket B (manual).
- [ ] Also run on `push` to `main`? Most work so far was pushed straight to `main` (1 merged PR in ~100 commits), so a `pull_request`-only trigger wouldn't check those pushes.
- [ ] Branch protection: make the required job a required check so a red X can't merge?
- [ ] Dependency audit: when does it become required (after the 25 findings are fixed or accepted)?
- [ ] Mentor go-ahead to add the workflow file (`docs/onboarding/first-contribution-plan.md`).

## Sign-off for next step
When this design is stable, Step 6 may scaffold `.github/workflows/pr-ci.yml` from these stages only—no extra scope.
