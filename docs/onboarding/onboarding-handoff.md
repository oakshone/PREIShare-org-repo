# PREIshare onboarding handoff

**Author:** oakshone  
**Date:** 2026-09-07  
**Branch / PR:** docs/first-contribution-jackson-clean — https://github.com/EdTechForLearning/PREIShare-org-repo/pull/7  
**Audience:** mentor, future self, sprint lead

## 1. Stakeholder summary (plain language)

I completed PREIshare engineering onboarding for Sprint 1 (dev environment and AI tooling). I forked the team repository, cloned my fork, wired up origin and upstream, verified my local Git identity and remotes, configured project rules and agent memory, mapped the repo well enough to choose a safe first contribution, and prepared a small pull request that follows the team’s Git and review habits. PREIshare remains a real-estate intelligence product; this work does not ship a product feature—it proves I can join the team workflow safely.

**Definition of done met:**
- [x] Fork created, local clone of my fork, both remotes and toolchain verified (see setup log)
- [x] AI rules / project memory in place and smoke-tested
- [x] First contribution implemented and committed on a feature branch
- [x] PR opened (or description ready) and review feedback addressed

## 2. Deliverables index (what exists and where)

| Artifact | Path | Why it matters |
| --- | --- | --- |
| Team orientation notes | docs/onboarding/team-orientation-notes.md | Referenced by setup log but not present in this checkout; do not assume its contents |
| Setup log | docs/onboarding/setup-log.md | Auditable proof of accounts, fork, Git identity, clone, remotes |
| Repo map | docs/onboarding/repo-map.md | Verified app layout, safe contribution surfaces, and toolchain boundaries |
| AI tooling verification | docs/onboarding/ai-tooling-verification.md | Evidence that the agent correctly respects the repo’s stack and guardrails |
| Project rules | .cursor/rules/preishare.mdc | Persistent IDE-agent constraints and do-not rules |
| Agent memory entrypoint | AGENTS.md | Cross-tool project context for coding-agents |
| First contribution plan | docs/onboarding/first-contribution-plan.md | Scoped plan before code |
| Contribution notes | docs/onboarding/first-contribution-notes.md | What changed and why |
| Contributors credit | CONTRIBUTORS.md | Visible first contribution surface |
| PR description | docs/onboarding/pr-description.md | Reviewer-facing summary |
| Review response notes | docs/onboarding/review-response-notes.md | How feedback was handled |
| This handoff | docs/onboarding/onboarding-handoff.md | Single entry point for mentors |

## 3. Environment and toolchain snapshot

Only facts verified in the setup log and repo files are included below.

- OS: macOS 26.5.1
- Git user.name / user.email configured: yes
- Node / package manager versions: not recorded in the setup log; package manager is npm, as verified in package.json
- origin (my fork) URL: https://github.com/oakshone/PREIShare-org-repo
- upstream (team repo) URL: https://github.com/EdTechForLearning/PREIShare-org-repo
- Install/build/test commands run and result:
  - `git --version` → PASS (`git version 2.54.0`)
  - `git remote -v` → PASS
  - `git status` after clone → PASS (`working tree clean`)
  - `npm install` / `npm run dev` / `npm run build` were not recorded in the setup log; the repo does declare `dev`, `build`, `preview`, and `generate-routes` scripts in package.json, but no test script is present.
- Blockers hit and how resolved:
  - Ran `git remote add upstream` from the parent folder instead of inside the repo → fixed by moving into the cloned repo and re-running it.
  - Ran `open` with no argument and hit usage help → fixed by using `open .`.

## 4. AI tooling posture

- Rules file purpose (one sentence): from .cursor/rules/preishare.mdc: it defines the project identity, stack, preferred edit surfaces, and explicit do-not rules to keep AI-assisted editing grounded in the real repo.
- AGENTS.md purpose (one sentence): it gives the repo-specific context for agent workflow: plan, small diff, verify, and do not widen the scope without reason.
- Smoke-test prompt used and whether the agent correctly named stack pieces (TypeScript, TanStack Start, React, Supabase, PostgreSQL, pgvector): the verification file ran smoke tests ST1–ST4 and they passed after a correction; the agent correctly described the repo as a single-package TanStack Start app, correctly refused invented secret or env values, and correctly did not assume a real Supabase client/schema existed.
- Context gaps found and fixes applied (link to ai-tooling-verification.md): ST3 originally lacked scope guidance and failed; ST4 had an inaccurate assumption about Supabase being present. The fixes were added to AGENTS.md and .cursor/rules/preishare.mdc, and the checks were re-run successfully.

## 5. First contribution and review outcome

- Plan goal (from first-contribution-plan.md): add myself as a new contributor in a contributors doc and make one minimal, reviewable docs touch so the team can practice a small first PR.
- Files touched (e.g. CONTRIBUTORS.md, notes): main first-PR file was `CONTRIBUTORS.md`; support and review artifacts were created in `docs/onboarding/` for planning and review tracking.
- PR title and link: “Add CONTRIBUTORS.md entry for onboarding” — https://github.com/EdTechForLearning/PREIShare-org-repo/pull/7
- Review-style feedback received (summary): scope, PR clarity, verification evidence, and commit/message hygiene were the main review themes.
- Changes made in response: the PR description was tightened to state the exact scope, the verification steps were made explicit, and the commit/message guidance was addressed by making the change description specific.
- Merge readiness: ready with follow-ups — this is a low-risk documentation PR that is aligned with the repo map and safe-first-touch guidance, but a human mentor should still confirm the roster naming convention and final diff before merge.

## 6. Open risks and environment gaps

List anything a mentor should know before assigning feature work:

1. `docs/onboarding/team-orientation-notes.md` is referenced by setup-log.md but is not present in this checkout, so that team document is still an unknown.
2. The repo has no implemented backend/data layer yet: no Supabase client, schema, SQL migrations, or credential config is in-tree.
3. No test script or lint/format runner is declared in package.json; the current verification is documentation and smoke-check based, not a full test suite.
4. No local `.env` or secret values were created or committed in this onboarding flow.

If none, write "None known" and state what you would re-verify on day one of the next sprint. Here, the main follow-up is to verify team conventions for contributor naming and whether a fuller onboarding document should be added later.

## 7. Decisions log (for stakeholders)

| Decision | Choice | Rationale |
| --- | --- | --- |
| First contribution surface | CONTRIBUTORS.md | Low risk, visible, aligns with the verified onboarding plan and repo map |
| Branch naming | docs/first-contribution-jackson-clean | Matches the feature-branch pattern used for the first PR |
| AI tool category used most | chat-assistant / coding-agent | These were used to verify repo structure, rules, scope, and review feedback |

## 8. Next-sprint preview (what this unlocks)

The next sprint topic can assume:

1. **Trusted local environment** — clone + toolchain documented in setup-log.md; re-run only if OS or versions change.
2. **AI alignment** — .cursor/rules/preishare.mdc and AGENTS.md exist; extend rules when new packages appear, do not start from zero.
3. **Git habit** — feature branch → small commits → PR → respond to review is practiced once end-to-end.
4. **First PR path** — merge-ready or merged onboarding contribution; feature work should use the same PR quality bar.

**Explicitly out of scope until later:** large product features, production deployments, and database migrations you have not been trained on yet.

## 9. Ask for mentor

- Questions still open: Should the missing team-orientation doc be created later as a companion artifact, or should we leave it intentionally absent until the team supplies the actual content?
- Review of this handoff requested: yes
- Preferred follow-up time or channel: next available mentor review, ideally in the team’s normal PR or onboarding channel

---

*End of handoff. Keep this file updated if merge status or env gaps change before the next sprint starts.*