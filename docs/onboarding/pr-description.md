# Pull request description — first PREIshare contribution

**PR URL:** https://github.com/EdTechForLearning/PREIShare-org-repo/pull/7
**Base repository:** EdTechForLearning/PREIShare-org-repo
**Base branch:** main
**Head repository (my fork):** oakshone/PREIShare-org-repo
**Compare branch:** docs/first-contribution-jackson-clean
**Author:** Jackson Nieporte / oakshone
**Date opened:** 2026-09-07

## Problem
PREIshare had no clear, reviewed onboarding contribution from this engineer yet.
The team needs a small, low-risk change that proves the Git → review → merge path works
for a new teammate without touching product runtime code.

This PR is intentionally limited to the contributor roster entry and does not include broader onboarding process docs, runtime app changes, or config work.

## Approach
- Added a personal entry to `CONTRIBUTORS.md` following the repo's existing format.
- Kept the change scoped to a single documentation file only (no app, package, or config runtime edits).
- Kept this PR focused on the contributor entry itself; broader onboarding artifacts and process notes remain separate from this reviewable change.
- Followed the plan in `docs/onboarding/first-contribution-plan.md` and the repo’s safe-first-touch guidance from the onboarding map rather than guessing at product work.

## What reviewers should look at
- [x] `CONTRIBUTORS.md` — new entry is accurate, formatted like the existing row, and free of secrets
- [x] Diff contains only intended files (no accidental `.env`, build output, or editor junk)
- [x] The scope is intentionally limited to the contributor roster entry and excludes app/runtime changes
- [x] Commit message explains *why* this onboarding change exists

## Test plan
1. `git branch --show-current` and `git status --short` confirm I am on the feature branch and only the expected files are modified.
2. `git diff --stat` confirms the diff is limited to the contributor roster file and no unrelated files were touched.
3. Open the Files changed tab and confirm only `docs/onboarding/CONTRIBUTORS.md` appears.
4. Skim `CONTRIBUTORS.md` in the PR diff: the name/handle/role/date line renders as a valid Markdown table row.
5. Search the diff for tokens, passwords, or local absolute paths — none found.
6. Checked out the branch locally and confirmed the file matches expectations.

## Screenshots / notes
No UI screenshots (docs-only change).
Implementation decisions and verification notes: see `docs/onboarding/first-contribution-notes.md`.

## Checklist before requesting review
- [x] Feature branch is pushed and up to date with this description
- [x] PR title is specific ("Add CONTRIBUTORS.md entry for onboarding")
- [x] Description states problem, approach, and test plan
- [x] Scope is explicit and limited to a safe first contribution
- [x] No secrets, `.env` values, or machine-specific paths were included
- [x] I can explain every staged line if a reviewer asks