# CI scripts notes (PREIshare)

*2026-11-17. What `.github/workflows/pr-ci.yml` runs, the exact command to run the same thing on
your own machine, and what is deliberately missing. Sources: `package.json`,
`.github/workflows/pr-ci.yml`, `docs/ci/project-ci-inventory.md`, `docs/ci/pipeline-design.md`.*

## Package manager and runtime

| Item | Value |
| --- | --- |
| Package manager | **npm** (never pnpm or yarn) |
| Lockfile | `package-lock.json` (the only lockfile) |
| Install in CI | `npm ci`: exact lockfile versions; fails if `package.json` and the lockfile disagree |
| Node in CI | **22** via `actions/setup-node` (gets the newest 22.x), npm cache keyed on the lockfile |
| Node locally | 22.18 or newer (`npm test` runs a `.ts` file directly). Your machine has 24.12, which is fine |
| Workflow | `.github/workflows/pr-ci.yml`, workflow **PR CI**, job **PR checks**, runs on `pull_request` to `main` |
| Env vars / secrets | **None.** No step needs a `.env` |

## Steps in `pr-ci.yml` (in order)

| # | CI step name | Command in CI | `package.json` script | Run it locally | Checks |
| --- | --- | --- | --- | --- | --- |
| 1 | Checkout | `actions/checkout@v4` | — | (you already have the code) | gets the PR's code |
| 2 | Setup Node | `actions/setup-node@v4`, `node-version: 22`, `cache: npm` | — | `node -v` (22.18+) | the right Node version |
| 3 | Install dependencies | `npm ci` | — (built into npm) | `npm ci` ⚠️ deletes and reinstalls `node_modules` | lockfile in sync; everything installs |
| 4 | Typecheck | `npm run typecheck` | `"typecheck": "tsc --noEmit"` | `npm run typecheck` | type errors, misspelled env names |
| 5 | Test | `npm test` | `"test": "node src/lib/embeddings/self-check.ts"` | `npm test` | migration and `types.ts` agree on vector size 1536; right/wrong-size vectors accepted/rejected |
| 6 | Build | `npm run build` | `"build": "vite build"` | `npm run build` | the production build works (with no env) |

**Run the whole thing locally, the same order as CI:**
```
npm ci && npm run typecheck && npm test && npm run build
```
Each command stops the chain if it fails, like CI does.

Any failing step **fails the job** (red X on the PR). No step uses `continue-on-error` or `|| true`.

## Intentional gaps

| Gap | Why | What would close it |
| --- | --- | --- |
| **Lint** | No lint tool or config is installed (`prettier` only appears as a hidden dependency, with no config). A lint step would be faked | Approve a linter (e.g. ESLint) as a new dev dependency, add a `lint` script, then a Lint step before Typecheck |
| **Real tests** | `npm test` only covers the embedding size. There's no test runner, so no tests for auth, validation or RLS logic | Pick a test tool (needs approval), add tests, and point `test` at it (keep the self-check too) |
| **Node version not enforced** | No `.nvmrc` and no `engines` field; Node 22.12+ is only written in `README.md` / `AGENTS.md` | Add `"engines": { "node": ">=22.12.0" }` (decision) |

## Planned but not added yet (from `docs/ci/pipeline-design.md`)

All need no secrets; commands are from the inventory. Add each as its own step after Build.

| Planned step | Command | Run it locally |
| --- | --- | --- |
| Route tree committed | `git diff --exit-code src/routeTree.gen.ts` (after the build) | `npm run build && git diff --exit-code src/routeTree.gen.ts` |
| No secrets in browser files | `grep -rlE '<patterns>' .output/public` → fail on any match | after `npm run build`, the same `grep` (patterns in `pipeline-design.md` stage 9) |
| Invalid listing fixture still fails | `npx tsc --noEmit --ignoreConfig --skipLibCheck --strict --target ES2022 --module ESNext --moduleResolution bundler src/fixtures/invalid-listings.errors.ts` → must fail with exactly 5 errors | same command; expect 5 `error TS` lines |
| Signed-out smoke test | `npm run preview` in the background, then `curl` for the expected codes | `npm run build && npm run preview`, then open `/dashboard` (→ login) in a private window |
| Dependency audit (optional job) | `npm audit --audit-level=high` | same; **fails today** (19 findings, 16 high), so warn-only |

## Scripts that are NOT for CI

| Script / command | Why not |
| --- | --- |
| `npm run dev` (`vite dev --port 3000`) | Local dev server; never exits |
| `npm run preview` (`vite preview`) | Only as part of the planned smoke test, started in the background |
| `npm run generate-routes` (`tsr generate`) | Writes a route tree **without** TanStack Start's `Register` block, so it differs from the committed file. The build regenerates it correctly |
| `node --env-file=.env scripts/seed-property-embeddings.ts` | Needs the service-role key and OpenAI; writes to the database. Manual only |
| `npm install` | Can change `package-lock.json` (several TanStack packages use `"latest"`). CI uses `npm ci` |
