# PREIshare PR pain points and Sprint 6 CI goals

## Client need (in my own words)
PREIshare’s dashboard team needs every pull request to get the same automatic build-and-check run so broken TypeScript/React changes are caught before merge. Humans still decide whether the change is good enough to merge; automation only proves the project still installs, typechecks, builds, lints, and tests.

## Current PR pain points
- Teammates must remember to install dependencies on their own machines.
- Build, typecheck, lint, and test are easy to skip under time pressure.
- There is no consistent cloud run tied to opening or updating a pull request.
- Broken code can reach the main branch because nothing blocks on shared checks.
- Reviewers spend energy re-running basic “does it build?” work instead of judging design and risk.
- There is no shared written line between machine checks and human judgment (including any AI-assisted review help).

**PREIshare specifics (from the repo):**
- There is no `.github/` folder: no CI exists today. Only 1 merged pull request appears in about 100 commits; almost all work went straight to `main`.
- Vercel is the first automated build, so problems show up at deploy time. In Sprint 3 a deploy was blocked by a security issue in `@tanstack/react-start` 1.168.32 that nothing caught earlier (`docs/sprint3-handoff.md`).
- `package.json` has no `lint` or `test` script yet, only `dev`, `build`, `preview`, `typecheck` and `generate-routes`.
- “No secret key in the browser” is checked today by a hand-run search of the built browser files (secret-hygiene audit). It's easy to forget.

## Automated CI goals (machines should do these on every PR)
- Install project dependencies in a clean environment.
- Run TypeScript typecheck.
- Build the TanStack Start / React dashboard.
- Run lint (once scripts are confirmed).
- Run tests (once scripts are confirmed).
- Fail the PR check clearly when any required step fails.

**PREIshare specifics:**
- Install with `npm ci` on Node 22 (≥ 22.12, the same as Vercel); typecheck with `npm run typecheck`; build with `npm run build`.
- Lint and test: not possible until the team picks tools and adds the scripts. Until then, the workflow should say they're skipped, not pretend they passed.
- Candidate extra checks, using commands that already exist: the browser-file secret scan, `node src/lib/embeddings/self-check.ts` (embedding size 1536), and `npm audit --audit-level=high`.
- CI needs **no secrets** for these checks, and must never run the seed script, apply migrations, call OpenAI or use the service-role key.

## Human review stays in charge
- Approve or request changes on the pull request.
- Judge product/UX risk, security-sensitive logic, and data handling.
- Decide whether to merge—even if CI is green.
- Use AI review prompts only as assistance; a human remains accountable for the merge decision.
- Manage secrets and production access outside the PR automation designed in this sprint.

**PREIshare specifics:** security-sensitive logic here includes RLS policies and grants, the `SECURITY INVOKER` search function, migrations (applied by hand in the Supabase SQL Editor), and where the service-role key is used. Changes to the CI workflow itself need a mentor's go-ahead (`docs/onboarding/first-contribution-plan.md`).

## Out of scope for this sprint (do not solve in the goals brief)
- Full production deploy from the PR workflow.
- Replacing human reviewers with fully automated merge.
- Deep performance or load testing suites (unless already a standard script).
- Inventing new app features unrelated to CI quality.

## Success signals
- Opening or updating a PR triggers a single clear CI workflow.
- Required checks (install → typecheck → build → lint → test) run in a sensible order.
- Failures are visible on the PR without asking a teammate to “try it locally.”
- An AI-assisted review prompt pack exists that speeds humans up without skipping human judgment.
- Stakeholders can read a short handoff that explains what is automated vs human-owned.
