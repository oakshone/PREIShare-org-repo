**Learner:** Jackson Nieporte
**Date:** 2026-08-30
**OS:** macOS ProductName:		macOS
ProductVersion:		26.5.1
BuildVersion:		25F80
**Team repo (upstream):** https://github.com/EdTechForLearning/PREIShare-org-repo
**Orientation notes used:** `docs/onboarding/team-orientation-notes.md`

## 1. Accounts and fork

| Check | Result | Notes |
| --- | --- | --- |
| GitHub sign-in works | PASS | Account username: @oakshone |
| Can view team repo https://github.com/EdTechForLearning/PREIShare-org-repo | PASS | |
| Fork created in my account | PASS | My fork URL: https://github.com/oakshone/PREIShare-org-repo |

## 2. Git install and identity

```text
# git --version
git version 2.54.0

# git config --global user.name
Jackson Nieporte

# git config --global user.email
jacksonlibre@gmail.com
```

Identity configured: PASS

## 3. Clone (of MY fork)

- Parent directory used: `~/projects`
- Clone command used: `git clone https://github.com/oakshone/PREIShare-org-repo`
- Cloned my fork (not the team repo): PASS
- Clone completed without error: PASS
- Local project path: `~/projects/PREIShare-org-repo`

## 4. Remotes (run inside the repo)

- `git remote add upstream https://github.com/EdTechForLearning/PREIShare-org-repo.git` run: PASS

### git remote -v

```text
origin    https://github.com/oakshone/PREIShare-org-repo (fetch)
origin    https://github.com/oakshone/PREIShare-org-repo (push)
upstream  https://github.com/EdTechForLearning/PREIShare-org-repo.git (fetch)
upstream  https://github.com/EdTechForLearning/PREIShare-org-repo.git (push)
```

origin points at MY fork: PASS
upstream points at the team repo: PASS

## 5. Post-clone verification

### git status

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

### Default branch

```text
main
```

Default branch name: `main`
Working tree clean after clone: PASS

## 6. Auth notes (no secrets)

- Clone method: HTTPS
- Auth method used (if prompted): credential helper
- Auth succeeded: PASS

## 7. Issues and fixes

| Issue | What I tried | Outcome |
| --- | --- | --- |
| Ran `git remote add upstream` from the parent `~/projects` folder instead of inside the cloned repo, got "fatal: not a git repository" | Used `find` to locate the actual clone path, then `cd`'d into `~/projects/PREIShare-org-repo` before retrying | Resolved — remote added successfully |
| Ran `open` with no argument, got usage help instead of opening Finder | Used `open .` to open the current directory | Resolved |

## 8. Ready for next step

I have a fork I own, a local clone of it with origin and upstream set, and a setup log another teammate could audit: YES