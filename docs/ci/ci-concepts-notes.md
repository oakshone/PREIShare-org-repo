# CI concepts notes — PREIshare dashboard

## In my own words

**Continuous integration (CI)**  
CI means the team automatically runs the same install and quality checks
every time someone proposes code changes (usually on a pull request),
so we learn quickly if the change breaks the app—before it lands on main.

**Pipeline / workflow**  
A pipeline (in GitHub, often a “workflow”) is the ordered recipe of
automated steps: e.g. check out the code → install dependencies →
typecheck → build → lint → test. Humans define the recipe; a cloud
machine runs it the same way every time.

**Green check vs red X**  
- Green: every required automated step passed. Safe *signal* to start
  human review—not an automatic “merge without thinking.”
  - Green means: it installs, type-checks and builds (the checks we chose).
  - Green does **not** mean: the code is good, safe, or ready to merge. RLS rules, secrets
    design and whether it matches the client story still need a person.
- Red: at least one step failed. Do not merge until a human understands
  the failure and the fix is re-checked.
  - Next steps: open the failed run, read **which step** failed (install, typecheck, build…),
    fix it, push again. CI re-runs by itself on the new push.
  - A red X is **CI working**, not CI broken: it caught a problem before `main` did.

**Why every pull request (for PREIshare)**  
Our pains (from docs/ci/pr-pain-and-goals.md) include forgotten local
checks, different results on different laptops, and slow/uneven review.
Running one shared pipeline on every PR gives the same signal to every
teammate and catches breakages early.

In PREIshare terms: today every check (typecheck, build, the secret search) is run **by hand**,
so it gets skipped when someone forgets. Running on every PR means nobody has to remember.
CI is **not** the review; it's the automatic check that runs **before** a human reviews.

## Pain → CI idea map

| Pain (from pr-pain-and-goals) | CI idea |
| --- | --- |
| Teammates forget to install/build/test locally | Workflow runs install + checks on every PR |
| “Works on my machine” disagreements | One shared runner environment and script versions |
| Reviewers waste time on obviously broken PRs | Red X blocks deep review until basics pass |
| Broken code reaches main | Checks run *before* merge, not only after |
| Vercel is the first robot to see a problem (Sprint 3 deploy blocked by a TanStack Start security issue) | The same build, plus `npm audit`, runs on the PR, before deploy |
| “No secret key in the browser” is checked by a hand-run search | The browser-file secret scan runs as a CI step every time |

## Non-examples (“CI washing”) — not real CI

“CI washing” = something that *looks* like CI, but doesn't give the team an automatic, shared,
before-merge signal on every change. In PREIshare terms:

1. **Only running `npm run build` on my laptop.** The result stays on one machine and is never
   shown on the pull request, so teammates and `main` get no shared, repeatable proof.
2. **Merging because an AI said “looks fine” (or “typecheck passes”) while no checks ran on the
   PR.** An AI chat message is a claim, not a recorded run; CI means the robot itself ran the
   checks and the result is attached to the PR.
3. **A `.github/workflows/` file that exists but never triggers on `pull_request`.** The recipe is
   only documentation if it never runs when a change is proposed (for example it only has a
   manual “Run workflow” button, or it watches a branch name we don't use).
4. **Running checks only on `main` after merge.** By then the broken code is already on the
   default branch; CI has to give its answer *before* the merge.
5. **Treating Vercel's deploy build as our CI.** Our `npm run build` is `vite build`, which does
   **not** type-check, and Vercel doesn't run the secret scan or `npm audit`, so a green deploy
   can hide type errors and leaked keys. It's a deploy step, not the agreed set of PR checks.
6. **A workflow that “passes” lint and test steps that don't exist.** PREIshare has no `lint` or
   `test` script yet; a step like `npm run lint || true`, or one that just prints “ok”, turns
   green without checking anything, which is a fake signal.

### Mix-ups to avoid (from my quiz)

| ❌ Fuzzy | ✅ Sharper |
| --- | --- |
| “Green = the PR was processed” | Green = **every required check passed**. It's a signal to start review, not permission to merge |
| “Red = the change isn't viable” | Red = **one step failed**. Read which one, fix, push; CI re-runs |
| “A workflow that fails the build isn't real CI” | A red X from a workflow that ran on the PR **is** real CI, doing its job |
| “Vercel isn't CI because there's no human review” | CI never includes human review. Vercel isn't our CI because `vite build` **doesn't type-check** and it runs no secret scan or audit |
| “An AI saying it passes isn't CI because something could still go wrong” | It isn't CI because **no checks ran on the PR**: a chat message is a claim, not a recorded run |

## What I will demand from later agent-written YAML (preview)

- Triggers on pull requests (not only manual clicks).
- Clear ordered steps: install → typecheck/build/lint/test as we design.
- Failures must fail the job (red X), not hide errors.
- Secrets and merge decisions stay human-controlled.
- Steps for scripts that don't exist yet (lint, test) are left out or clearly marked skipped, never
  faked as passing.
- No secrets needed and no real systems touched: no seed script, migrations, OpenAI calls or
  service-role key.

## Open questions for inventory/design steps

- Which exact npm/pnpm scripts does this repo already expose?
  *Known today:* npm (`package-lock.json`); scripts `dev`, `build` (`vite build`), `preview`,
  `typecheck` (`tsc --noEmit`), `generate-routes`. No `lint` or `test`.
- Which checks are automatable vs must stay human (product UX, security judgment)?
