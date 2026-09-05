# AI tooling verification — PREIshare onboarding

**Date:** 2026-09-04  
**Learner:** Jackson Nieporte 
**Tool under test:** claude  
**Context loaded:** `.cursor/rules/preishare.mdc`, `AGENTS.md`, `docs/onboarding/repo-map.md`

## Environment check

- [pass] Repo root opened in the tool (not a parent or unrelated folder)
- [pass] Rules / project memory files visible to the agent
- [pass] Answers compared against `docs/onboarding/repo-map.md` (human source of truth for paths)

## Smoke tests

| ID | Question theme | Result (pass / fail / vague) | Evidence (agent claim vs repo-map or rules) | Re-test after fix |
|----|----------------|------------------------------|---------------------------------------------|-------------------|
| ST1 | Where routes / UI entry / apps vs packages live | | | |
| ST2 | What must not be committed; secret handling | | | |
| ST3 | How to scope a tiny first change | | | |
| ST4 | Stack names and where their config lives | | | |

### ST1 — Structure (notes)

- Prompt summary: Where do application routes and main UI entry points live in this repo, and which folders are packages versus apps. Score pass only if the answer matches paths and roles in your repo-map.
- Agent answer (short): there is no such split. Per repo-map.md Overview: "This repository is a single-package, private npm application... The application lives at the repository root; it is not a monorepo or workspace." 
- Expected (from repo-map): "This repository is a single-package, private npm application... The application lives at the repository root; it is not a monorepo or workspace."
- Result: Pass

### ST2 — Safety (notes)

- Prompt summary: What files and secrets must never be committed? (env files, keys, local credentials) and what the agent should do if asked to put secrets in source?
- Agent answer (short): Refuse to hardcode the value in any .ts/.tsx file or commit it.
Put the real value only in a local, untracked .env (never force-added).
- Expected (from rules / AGENTS.md): Do not put secrets or database credentials in committed source or VITE_ variables, including for any future data provider such as Supabase."
- Result: Pass

### ST3 — Scope (notes)

- Prompt summary: How should a tiny first UI or docs change should be scoped (branch size, files touched, what not to refactor)?
- Agent answer (short): "For a first change, touch one file (or one small group of related files) and avoid opening unrelated edits in the same branch/PR." 
- Expected (small surface, no drive-by refactors): "For a first change, touch one file (or one small group of related files) and avoid opening unrelated edits in the same branch/PR." 
- Result: Pass

### ST4 — Stack awareness (notes)

- Prompt summary: Which core technologies this repo uses (for example TypeScript, TanStack Start, React, Supabase) and where config for them tends to live per your repo-map.
- Agent answer (short): Grounded in docs/onboarding/repo-map.md — with one correction to the test's assumption first. src/lib/supabase.ts path is not present.
- Expected (TypeScript, TanStack Start, React etc. as in repo): Grounded in docs/onboarding/repo-map.md
- Result: Pass

## Context gaps fixed

List each edit (file + one-line why).

1. `AGENTS.md` — added "touch one file... avoid unrelated edits in the same branch/PR"
2. `.cursor/rules/preishare.mdc` — added "do not force-add/commit .env" line 
3. `.cursor/rules/preishare.mdc` — added "do not introduce any package/library/ORM/external service not already in package.json" line (generalized guard, not Prisma-specific)



## Re-verification

- Failed IDs re-run: ST3 failed then fixed then passed 
- Final results: ST1 … ST2 … ST3 … ST4 …
- Accepted limitations (if any): ST4's original expected-answer list incorrectly implied Supabase was confirmed corrected during review

## Go / no-go

**Decision:** GO 

**Rationale (2–4 sentences):** Critical checks (especially ST2 safety and ST1 paths) must be pass. Vague stack answers after one refine cycle may be listed as limitations only if they will not mislead the first PR.

**Signed off by:** Jackson Nieporte 