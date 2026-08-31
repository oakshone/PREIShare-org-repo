# Setup Log

## Environment

- **Machine:** ProductName:		macOS
ProductVersion:		26.5.1
BuildVersion:		25F80
- **Shell:** /bin/zsh
- **Git version:** git version 2.54.0
- **Date:** 8/30/26

## Steps Completed

### 1. Clone the repository

**Command:**

git clone https://github.com/oakshone/PREIShare-org-repo


**Output (verified via `git log -1`):**

commit 20d98f9f3f9d29c83ec96787e1bbeb3e5f1662a0 (HEAD -> main, origin/main, origin/HEAD)
Merge: fd91696 c7cb5cf
Author: Thor Anderson ta.anderson@gmail.com
Date: Mon Jul 27 20:22:46 2026 -0600

Merge pull request #1 from thortek/onboarding/first-pr

Onboarding/first pr

**Result:** ✅ Pass

### 2. Add upstream remote

**Command:**

git remote add upstream https://github.com/EdTechForLearning/PREIShare-org-repo.git


**Verification command:**

git remote -v


**Output:**

origin https://github.com/oakshone/PREIShare-org-repo (fetch)
origin https://github.com/oakshone/PREIShare-org-repo (push)
upstream https://github.com/EdTechForLearning/PREIShare-org-repo.git (fetch)
upstream https://github.com/EdTechForLearning/PREIShare-org-repo.git (push)


**Result:** ✅ Pass

### 3. Confirm working tree is clean

**Command:**

git status


**Output:**

On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean


**Result:** ✅ Pass

## Issues Encountered

- Initially ran `git remote add` from the parent `~/projects` folder instead of inside the repo — got "not a git repository" error. Fixed by `cd`-ing into `~/projects/PREIShare-org-repo` first.
- Ran `open` with no argument, which just printed usage help instead of opening Finder. Fixed with `open .`

## Notes

- Assistant used to help draft this log structure: Claude (chat assistant)