# First contribution plan — PREIshare onboarding

## Author
- Name / GitHub handle: oakshone
- Feature branch: docs/first-contribution-jackson
- Date: 2026-09-07

## One-sentence goal
Add myself as a new contributor in a contributors doc and make one minimal, reviewable docs (or agreed low-risk UI) touch so the team can practice review on a small first PR.

## Why this surface (link to prior artifacts)
- This plan stays in the repo's verified safe-first-touch area: from `docs/onboarding/repo-map.md`, *"`docs/onboarding/` for onboarding documentation."* A new `CONTRIBUTORS.md` and this plan file are both plain-Markdown documentation edits, and neither touches the repo's listed "Do Not Edit Yet" paths (`src/routeTree.gen.ts`, `package-lock.json`, `tsconfig.json`/`tsr.config.json`/`vite.config.ts`, `.vscode/settings.json`, `AGENTS.md`, `.cursorrules`).
- Distinction between repo facts and contributor placeholders:
  - Repo facts: the safe-touch boundaries, generated-file protections, onboarding-doc location, and the rule that this is a docs-only first PR are all grounded in the repo itself.
  - Contributor placeholders: author name, GitHub handle, and branch naming are not repo facts. They are intentionally left as user-specific values to be filled in by the contributor.
- `docs/onboarding/team-orientation-notes.md` **does not exist in this checkout** (confirmed by directory listing and by `setup-log.md`, which references it but doesn't include it). This is a real missing artifact, not a file to invent or assume. Because it is absent, this plan defines the "first-PR definition of done" from the verified repo artifacts instead: `repo-map.md`'s Safe First Touches / Do Not Edit Yet lists and `.cursor/rules/preishare.mdc`'s "Preferred edit surfaces for newcomers" and "Do not" sections.
- From `docs/onboarding/ai-tooling-verification.md`: **Decision: GO** — *"ST2 passed cleanly on first attempt which is important. ST3 originally had no guidance and failed but was fixed with a small addition passed on re-test. ST4 passed..."* The agent's rule files (`.mdc` + `AGENTS.md`) have been smoke-tested for safety, scope, and stack awareness and are verified enough to assist with this small, docs-only implementation.

## In scope (only these)
1. Create or update `CONTRIBUTORS.md` with my name, GitHub handle, and a one-line role (e.g. "Onboarding engineer").
2. Optional second touch: **none** for this first PR. Per `repo-map.md`'s Safe First Touches, a UI copy change in `src/routes/about.tsx` or `src/components/Footer.tsx` would also qualify, but adding a second file isn't needed to meet the one-sentence goal and keeps the diff reviewable in under 10 minutes.
3. Capture implementation notes later in `docs/onboarding/first-contribution-notes.md` (next step—not done here).

## Out of scope (explicitly not this PR)
- Auth, sessions, or environment secrets
- Database schema, migrations, Supabase policies, or pgvector changes
- Dependency upgrades or lockfile churn unrelated to the contribution
- Multi-package refactors, renames, or formatting the whole repo
- CI/CD workflow edits unless a mentor explicitly assigns them

## Likely files to change
| File | Action | Why |
|------|--------|-----|
| CONTRIBUTORS.md | create or update | Add my contributor entry |
| n/a | n/a | No second touch chosen — see "Why this surface" |
| docs/onboarding/first-contribution-notes.md | create (next step) | Record what the agent did and what I verified |

## Acceptance criteria
- [x] I am on feature branch `docs/first-contribution-jackson` (not the default branch).
- [x] `CONTRIBUTORS.md` lists my name and GitHub handle in a consistent format.
- [x] Any second touch is limited to the single file named above and does not change behavior beyond copy/docs.
- [x] No secrets, `.env` files, or generated build artifacts are included.
- [x] A teammate can review the diff in under 10 minutes without product-context deep dives.

## Verification plan (how I will know it worked)
1. `git status` / `git branch` show I am on the feature branch with only expected files modified.
2. Open `CONTRIBUTORS.md` and confirm my row/section renders as plain Markdown.
3. If a UI touch was included: run the app’s normal dev command from the setup log and visually confirm the copy change; otherwise skip.
4. Skim `git diff` and confirm nothing outside the likely-files table appears.

## Risks and mitigations
- Risk: Agent expands scope into app core. Mitigation: refuse diffs that touch files not listed above; re-prompt with the out-of-scope list.
- Risk: Editing default branch by mistake. Mitigation: check `git branch` before every edit session.

## Definition of done for this planning step
- [x] Feature branch created from updated default branch.
- [x] This plan file saved at `docs/onboarding/first-contribution-plan.md` with all sections filled (no angle-bracket placeholders left).
- [x] Ready to implement in the next step without re-deciding scope.
