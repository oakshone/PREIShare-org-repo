# Security verification checklist — PREIshare sponsor auth & properties

**Date:** 2026-10-22  
**Verifier:** Jackson Nieporte   
**Build / branch:** `main` at `5bcce1a` ("create flow under RLS"), plus the uncommitted 4.3 fix in `src/routes/dashboard/properties.new.tsx`  
**Related docs:** docs/requirements/sponsor-auth-and-listings-brief.md, docs/env-var-checklist.md, docs/data-model-and-rls-matrix.md

Status values: `pass` | `fail` | `not-run`

**Update 2026-10-23:** a Supabase project now exists, `.env` is filled in (publishable key only; service-role key left empty), and both migrations were applied through the SQL editor without errors. The live checks in sections 2–5 were then run by hand with two test accounts (A and B) and all passed.

Why so many `not-run` (original run, 2026-10-22): no Supabase project was provisioned and the migrations were not applied, so nothing that needs a real sign-in or real rows could be tested. Everything else was checked against a local production build (`npm run build` + `vite preview`) and by reading the code.

File names differ from the template: the browser and server clients are `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts` (moved from `supabase.browser.ts` / `supabase.server.ts` after this checklist was first run; the bundle checks were re-run after the move and still pass), and the list page is `src/routes/dashboard/properties.index.tsx` (so `properties.new.tsx` isn't nested inside it).

---

## 1. Environment and secret hygiene

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 1.1 | Browser-safe client (`src/lib/supabase/client.ts`) uses only public URL + anon key | Opened file: reads only `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; no service-role import or `process.env`. Searched the built browser bundle for `service_role`, `SERVICE_ROLE`, `process.env`, `createServerClient`, `getCookies`: no matches | pass | Strict env typing (`src/env.d.ts`) makes any other `import.meta.env` name a type error |
| 1.2 | Service-role / secret key used only in server module (`src/lib/supabase/server.ts`) or never used in this topic | Searched `src/` for `SUPABASE_SERVICE_ROLE_KEY`: only the type list in `src/env.d.ts` and a "deliberately does NOT use" comment in `src/lib/supabase/server.ts` | pass | Never used in this topic. The server client uses the anon key + the user's cookies |
| 1.3 | No raw secrets committed in source or checklist | `git grep` of tracked files for JWT-like keys (`eyJ…`), `sb_secret_` / `sb_publishable_`, real `*.supabase.co` URLs, and `postgres://user:pass@`: no matches. `git ls-files` lists only `.env.example`; `.env`, `.env.local`, `.env.production` are gitignored | pass | Never paste real key values here |
| 1.4 | `.env.example` documents required vars without real values | `grep -nE '^[A-Z_]+=.+' .env.example`: no output (all empty). Names match docs/env-var-checklist.md: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `DATABASE_URL` (commented out) | pass | Each is labelled PUBLIC or SERVER-ONLY |

**Section result:** pass

---

## 2. Login and session-aware routing

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 2.1 | Unauthenticated visit to dashboard (or properties) redirects or blocks access | Signed out, requested `/dashboard`, `/dashboard/portfolio`, `/dashboard/deals`, `/dashboard/profile`, `/dashboard/properties`, `/dashboard/properties/new` from the local build with `curl` (not a browser) | pass | All six: `307` → `/login?redirect=<that page>` (now `/auth/login?redirect=…` after the login page moved; re-checked 2026-10-23). Guard is `beforeLoad` in `src/routes/dashboard.tsx`, calling the `getCurrentUser` server function, which uses `auth.getUser()` (verified) not `getSession()`. Fails closed when Supabase isn't configured |
| 2.2 | Valid sponsor credentials reach an authenticated dashboard session | 2026-10-23: signed up at `/auth/signup`, confirmed the email when Supabase asked, signed in at `/auth/login` | pass | Landed on the dashboard with the account's email shown in the header |
| 2.3 | Invalid credentials do not grant dashboard access | 2026-10-23: signed out, then signed in at `/auth/login` with a wrong password | pass | Saw "Email or password is incorrect." and stayed on the login page. `/auth/login?redirect=https://evil.com` also re-checked: the outside URL is dropped (`safeRedirectPath`) |
| 2.4 | Logout clears session; protected routes no longer load data as that user | 2026-10-23: clicked Sign out, then typed `/dashboard` in the address bar | pass | Sent to `/auth/login`. Sign-out now runs on the server (`signOut` server function → `signOutSession` in `src/lib/auth/session.ts`), which revokes the session and clears the cookies |

**Section result:** pass

---

## 3. Property list isolation (RLS)

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 3.1 | Signed-in sponsor sees property list UI from `src/routes/dashboard/properties.index.tsx` | 2026-10-23: signed in, opened Properties | pass | |
| 3.2 | List shows only rows owned by the current sponsor (per docs/data-model-and-rls-matrix.md) | 2026-10-23: after creating a listing as sponsor A (4.2), A's list showed only A's listing. Code: the query runs in a `createServerFn` with **no owner filter**; filtering is left to RLS policy `listings_select_own` `USING (owner_id = auth.uid())` | pass | Confirms RLS, not app code, does the filtering (see also 5.1) |
| 3.3 | Empty state is safe (no error that leaks other tenants' data) | 2026-10-23: signed in as a second account (B) with no listings | pass | Showed the fixed "No properties yet" message; nothing from A. Query-error state is still code review only |

**Section result:** pass

---

## 4. Property create under RLS

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 4.1 | Create form on `src/routes/dashboard/properties.new.tsx` requires an authenticated session | Logged out: `/dashboard/properties/new` → `307` to `/login` (2.1). Code review: the `createProperty` server function checks `auth.getUser()` and returns "You must be signed in…" before any insert | pass | Logged-in half also checked 2026-10-23: the form loads and submits (4.2) |
| 4.2 | Successful create inserts a row owned by the current sponsor | 2026-10-23: signed in as A, Properties → Add property, created one | pass | Returned to the list with the new listing shown as `draft`, visible to A only (not to B, 5.1). Owner comes from `getUser()` on the server; RLS `WITH CHECK (owner_id = auth.uid())` double-checks it |
| 4.3 | Create failure (validation or RLS) does not expose secret keys or raw DB internals in the UI | Code review: first run found raw `error.message` shown in the UI (**fail**, see section 6). After the fix, database errors map to plain messages by error code; raw text goes only to the server log. Re-built; browser bundle contains no error-mapping or query code | pass | Fixed and re-tested by code review + build. Triggering a real RLS rejection through the form hasn't been tried |

**Section result:** pass (4.3's live database rejection still not triggered)

---

## 5. Cross-sponsor access attempt

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 5.1 | Sponsor B cannot list Sponsor A's properties in the UI | 2026-10-23: signed up a second account (B), signed in as B, opened Properties | pass | B's list was empty; A's listing was not shown |
| 5.2 | Direct read/update of another sponsor's row is denied by RLS (UI and/or Supabase policy behavior) | Documented policy review against docs/data-model-and-rls-matrix.md: SELECT, UPDATE and DELETE use `USING (owner_id = auth.uid())`; INSERT and UPDATE use `WITH CHECK (owner_id = auth.uid())`; RLS enabled; no `anon` policy; no `USING (true)` | pass | Policy review only, not a live attempt. Live SQL steps are in docs/data-model/rls-policy-review.md, section 5. A blocked update/delete returns 0 rows, not an error |

**Section result:** pass (5.2 by policy review; no direct-API attempt yet)

---

## 6. Gaps found and fixes applied

| Gap (checklist #) | What was wrong | Fix applied (files) | Re-test status |
|-------------------|----------------|---------------------|----------------|
| 4.3 | A failed create showed Postgres's raw message in the UI (e.g. *"new row violates row-level security policy for table…"*), exposing table and policy names | Database errors now map to plain messages by error code (permission, invalid value, missing field, price too large, generic); raw error logged on the server only. `src/routes/dashboard/properties.new.tsx` | pass (code review, typecheck, build, bundle search); live trigger not-run |

---

## 7. Residual risks (honest leftovers)

- **Direct cross-sponsor attempts not tried (5.2).** The UI test passed (5.1), but reading or changing A's row by id through the Supabase API as B has only been checked by policy review. SQL steps: docs/data-model/rls-policy-review.md, section 5.
- **Live checks were run by hand on a development project** (two test accounts), not automated; re-run them after any migration change.
- **Sponsors can publish their own listings (R1).** The update policy doesn't limit `status`, which contradicts the brief. Fix proposed, needs sign-off.
- **Any signed-in account can create listings (R2),** not only sponsors (no `sponsor_profiles` check). Fix proposed, needs sign-off. **More urgent since public sign-up (`/auth/signup`) was added:** anyone can now create an account and then create their own listings (RLS still blocks access to other sponsors' rows). Either add the R2 check or turn off public sign-up in Supabase and invite sponsors.
- **Hard delete of any own listing (R3),** including published ones. Decision open.
- **Blocked edits look like success (R5).** No edit or delete UI yet; when added, 0 rows must be treated as "not found".
- **Create form can hang on "Saving…"** if the server call itself fails (no connection, no `.env`). It never shows false success, but shows no message. Kept to match the course template.
- **Server functions are public endpoints.** Anyone can call them directly. Mitigated: each checks `getUser()`, and RLS applies to every query.
- **Service-role key unused in app code this topic.** Confirm the deploy keeps it server-only (no `VITE_` prefix in Vercel) and re-run the bundle search on the deployed build.

---

## 8. Stakeholder verdict

**Ready to show stakeholders?** yes, with caveats (decided 2026-10-23)

**Caveats (must be said in the demo, and fixed before real sponsors use it):**
- **Development project only:** this is a demo on test accounts, not a launch.
- **R1 open:** a sponsor can set their own listing to `published`, which the brief forbids. Fix proposed, needs sign-off.
- **R2 open:** public sign-up is on, so anyone can create an account and add their own listings. They still can't see or change other sponsors' listings. Before real sponsors: add the R2 sponsor check or turn off public sign-up in Supabase.
- **5.2 is policy review only:** direct-API cross-sponsor attempts haven't been tried.

**Summary (3–5 sentences):**  
Secret hygiene was verified: secrets stay out of git, only the publishable key is in `.env`, and file review of `src/lib/supabase/client.ts` vs `src/lib/supabase/server.ts`, plus a search of the built browser bundle, confirms only the public URL and anon key reach the client. On a live Supabase development project (2026-10-23), sign-up, sign-in, wrong-password rejection, and server-side sign-out all worked, and signed-out visitors are redirected to `/auth/login`. A sponsor's new listing was saved as a draft owned by them, and a second sponsor saw an empty list, so RLS keeps sponsors' listings apart in the UI. One gap (raw database errors in the create form) was found and fixed. Still open: direct-API cross-sponsor attempts (policy review only) and the R1/R2 decisions, which matter more now that anyone can sign up.

**Sign-off:** name, date
