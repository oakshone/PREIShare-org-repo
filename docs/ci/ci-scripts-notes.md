# CI scripts notes — PREIshare dashboard

*Updated 2026-11-17. Matches `package.json` and `.github/workflows/pr-ci.yml` exactly.*

## Package manager
- CI uses: **npm**
- Lockfile present: `package-lock.json` (the only lockfile)
- Node: **22** in CI (`actions/setup-node`, newest 22.x). Locally 22.18+ (`npm run test` runs a `.ts` file directly)
- Env vars / secrets in CI: **none**

## Scripts CI calls (must match package.json and pr-ci.yml)
Order is the order in `pr-ci.yml` (job **PR checks**): Install → Lint → Typecheck → Test → Build.
Every step is non-watch: it runs once and exits; a failure fails the job (red X).

| CI step    | package.json script | Exact local command        | Purpose                          |
|------------|---------------------|----------------------------|----------------------------------|
| Install    | (npm ci)            | `npm ci`                   | Clean install from lockfile ⚠️ locally it deletes and reinstalls `node_modules` |
| Lint       | `lint`              | `npm run lint`             | Style and common bug checks (ESLint: JS/TS recommended rules + React hooks rules; config `eslint.config.js`) |
| Typecheck  | `typecheck`         | `npm run typecheck`        | TypeScript without emit (`vite build` does **not** type-check) |
| Test       | `test`              | `npm run test`             | Embedding self-check: migration and `types.ts` agree on 1536; right/wrong vector sizes accepted/rejected |
| Build      | `build`             | `npm run build`            | Production build (passes with no env) |

## package.json script entries (only if you added or stabilized any)
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "vite build",
    "lint": "eslint .",
    "test": "node src/lib/embeddings/self-check.ts"
  }
}
```
- `lint` **added 2026-11-17**, with new dev dependencies `eslint`, `@eslint/js`,
  `typescript-eslint`, `eslint-plugin-react-hooks` and `globals`, and config `eslint.config.js`.
  It ignores build output, `src/routeTree.gen.ts` (generated), and
  `src/fixtures/invalid-listings.errors.ts` (wrong on purpose). Checked: a probe file with a
  conditional hook, an unused variable and an `any` failed with 3 errors; the real code (60 files)
  has 0 errors.
- `test` **added 2026-11-17**. It runs the existing self-check with plain Node instead of
  `vitest run`, because no test runner is installed. Non-watch: it runs once and exits 0 or 1.
- `typecheck` and `build` were already there.

## Intentional gaps
- No full browser end-to-end suite in PR CI yet (keep human/manual or later sprint).
- Secrets and production deploys are out of scope for this workflow.
- **Real tests:** `npm run test` only covers the embedding size. Tests for auth, validation or RLS
  logic need a test tool (a new package, needs approval).
- **Node version not enforced:** no `.nvmrc` or `engines` field; 22.12+ is only written in `README.md` / `AGENTS.md`.
- **Planned steps not added yet** (from `docs/ci/pipeline-design.md`; no secrets needed):
  - route tree committed
  - no secrets in browser files
  - invalid fixture still fails
  - signed-out smoke test
  - dependency audit (optional; **fails today with 25 findings, 22 high**)
- **Not for CI:**
  - `npm run dev` (never exits)
  - `npm run generate-routes` (writes a route tree without TanStack Start's `Register` block)
  - the seed script (needs secrets and writes to the database)
  - `npm install` (can change the lockfile)

## How to reproduce a CI failure locally
1. git checkout the PR branch
2. npm ci
3. `npm run lint && npm run typecheck && npm run test && npm run build` (the same order as CI; stops at the first failure)
4. Fix until all four pass, then push again
