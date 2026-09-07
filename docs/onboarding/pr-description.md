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

## Approach
- Added a personal entry to `CONTRIBUTORS.md` following the repo's existing format.
- Kept the change scoped to documentation only (no app, package, or config runtime edits).
- Deliberately excluded my broader onboarding artifacts (plan file, notes file) from this
  PR, since they are personal process records tracked separately on my fork rather than
  part of this specific contribution.
- Followed the plan in `docs/onboarding/first-contribution-plan.md` and implementation notes in
  `docs/onboarding/first-contribution-notes.md`.

## What reviewers should look at
- [x] `CONTRIBUTORS.md` — new entry is accurate, formatted like the existing row, and free of secrets
- [x] Diff contains only intended files (no accidental `.env`, build output, or editor junk)
- [x] Commit message explains *why* this onboarding change exists

## Test plan
1. Open the Files changed tab and confirm only `docs/onboarding/CONTRIBUTORS.md` appears.
2. Skim `CONTRIBUTORS.md` in the PR diff: name/handle/role/date line renders as a valid Markdown table row.
3. Searched the diff for tokens, passwords, or local absolute paths — none found.
4. Checked out the branch locally and confirmed the file matches expectations.

## Screenshots / notes
No UI screenshots (docs-only change).
Implementation decisions and verification notes: see `docs/onboarding/first-contribution-notes.md`.

## Checklist before requesting review
- [x] Feature branch is pushed and up to date with this description
- [x] PR title is specific ("Add CONTRIBUTORS.md entry for onboarding")
- [x] Description states problem, approach, and test plan
- [x] I can explain every staged line if a reviewer asks