# Security verification checklist — PREIshare sponsor auth & properties

**Date:** 2026-10-22  
**Verifier:** Jackson Nieporte   
**Build / branch:** `main` at `5bcce1a` ("create flow under RLS"), plus the uncommitted 4.3 fix in `src/routes/dashboard/properties.new.tsx`  
**Related docs:** docs/requirements/sponsor-auth-and-listings-brief.md, docs/env-var-checklist.md, docs/data-model-and-rls-matrix.md

Status values: `pass` | `fail` | `not-run`

Why so many `not-run`: no Supabase project is provisioned yet and the migrations are not applied, so nothing that needs a real sign-in or real rows can be tested. Everything else was checked against a local production build (`npm run build` + `vite preview`) and by reading the code.

File names differ from the template: the browser client is `src/lib/supabase.browser.ts` (the build blocks `*.client.*` files from server-rendered pages), and the list page is `src/routes/dashboard/properties.index.tsx` (so `properties.new.tsx` isn't nested inside it).

---

## 1. Environment and secret hygiene

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 1.1 | Browser-safe client (`src/lib/supabase.browser.ts`) uses only public URL + anon key | Opened file: reads only `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; no service-role import or `process.env`. Searched the built browser bundle for `service_role`, `SERVICE_ROLE`, `process.env`, `createServerClient`, `getCookies`: no matches | pass | Strict env typing (`src/env.d.ts`) makes any other `import.meta.env` name a type error |
| 1.2 | Service-role / secret key used only in server module (`src/lib/supabase.server.ts`) or never used in this topic | Searched `src/` for `SUPABASE_SERVICE_ROLE_KEY`: only the type list in `src/env.d.ts` and a "deliberately does NOT use" comment in `supabase.server.ts` | pass | Never used in this topic. The server client uses the anon key + the user's cookies |
| 1.3 | No raw secrets committed in source or checklist | `git grep` of tracked files for JWT-like keys (`eyJ…`), `sb_secret_` / `sb_publishable_`, real `*.supabase.co` URLs, and `postgres://user:pass@`: no matches. `git ls-files` lists only `.env.example`; `.env`, `.env.local`, `.env.production` are gitignored | pass | Never paste real key values here |
| 1.4 | `.env.example` documents required vars without real values | `grep -nE '^[A-Z_]+=.+' .env.example`: no output (all empty). Names match docs/env-var-checklist.md: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `DATABASE_URL` (commented out) | pass | Each is labelled PUBLIC or SERVER-ONLY |

**Section result:** pass

---

## 2. Login and session-aware routing

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 2.1 | Unauthenticated visit to dashboard (or properties) redirects or blocks access | Signed out, requested `/dashboard`, `/dashboard/portfolio`, `/dashboard/deals`, `/dashboard/profile`, `/dashboard/properties`, `/dashboard/properties/new` from the local build with `curl` (not a browser) | pass | All six: `307` → `/login?redirect=<that page>`. Guard is `beforeLoad` in `src/routes/dashboard.tsx`, calling the `getCurrentUser` server function, which uses `auth.getUser()` (verified) not `getSession()`. Fails closed when Supabase isn't configured |
| 2.2 | Valid sponsor credentials reach an authenticated dashboard session | — | not-run | No Supabase project or test sponsor account yet |
| 2.3 | Invalid credentials do not grant dashboard access | Code review only: `src/routes/login.tsx` navigates only when `signInWithPassword` returns no error; wrong password shows "Email or password is incorrect." | not-run | Needs a real project to try a wrong password. Earlier in Sprint 4, `/login?redirect=https://evil.com` was checked: the outside URL is dropped (`safeRedirectPath`) |
| 2.4 | Logout clears session; protected routes no longer load data as that user | Code review only: `SignOutButton` calls `auth.signOut()`, then reloads route data and goes to `/login` | not-run | Needs a real session to test |

**Section result:** partial (2.1 pass; 2.2–2.4 not-run)

---

## 3. Property list isolation (RLS)

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 3.1 | Signed-in sponsor sees property list UI from `src/routes/dashboard/properties.index.tsx` | — | not-run | Needs sign-in. Page builds; signed-out visits redirect (2.1) |
| 3.2 | List shows only rows owned by the current sponsor (per docs/data-model-and-rls-matrix.md) | Code review only: the query runs in a `createServerFn` with **no owner filter**; filtering is left to RLS policy `listings_select_own` `USING (owner_id = auth.uid())` in `supabase/migrations/20250321000000_property_listings.sql`. No `anon` policy | not-run | Needs two test sponsors with seeded rows to confirm live |
| 3.3 | Empty state is safe (no error that leaks other tenants' data) | Code review only: empty state is fixed text ("No properties yet…"); query errors show the fixed "Could not load properties. Try again." and are logged on the server | not-run | Needs a live empty account to observe |

**Section result:** not-run (code review supports isolation; no live test yet)

---

## 4. Property create under RLS

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 4.1 | Create form on `src/routes/dashboard/properties.new.tsx` requires an authenticated session | Logged out: `/dashboard/properties/new` → `307` to `/login` (2.1). Code review: the `createProperty` server function checks `auth.getUser()` and returns "You must be signed in…" before any insert | pass | The logged-in half (form loads and submits) is not-run |
| 4.2 | Successful create inserts a row owned by the current sponsor | Code review only: `owner_id: user.id`, where `user` comes from `getUser()` on the server; the browser never sends an owner. RLS `listings_insert_own` `WITH CHECK (owner_id = auth.uid())` double-checks it | not-run | Needs a real sign-in to create a row and confirm it appears only for that user |
| 4.3 | Create failure (validation or RLS) does not expose secret keys or raw DB internals in the UI | Code review: first run found raw `error.message` shown in the UI (**fail**, see section 6). After the fix, database errors map to plain messages by error code; raw text goes only to the server log. Re-built; browser bundle contains no error-mapping or query code | pass | Fixed and re-tested by code review + build. Triggering a real RLS rejection is not-run (no database) |

**Section result:** partial (4.1, 4.3 pass; 4.2 not-run)

---

## 5. Cross-sponsor access attempt

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 5.1 | Sponsor B cannot list Sponsor A's properties in the UI | — | not-run | No Supabase project, so no second test user. Planned steps: create a listing as A, sign in as B, compare lists |
| 5.2 | Direct read/update of another sponsor's row is denied by RLS (UI and/or Supabase policy behavior) | Documented policy review against docs/data-model-and-rls-matrix.md: SELECT, UPDATE and DELETE use `USING (owner_id = auth.uid())`; INSERT and UPDATE use `WITH CHECK (owner_id = auth.uid())`; RLS enabled; no `anon` policy; no `USING (true)` | pass | Policy review only, not a live attempt. Live SQL steps are in docs/data-model/rls-policy-review.md, section 5. A blocked update/delete returns 0 rows, not an error |

**Section result:** partial (5.1 not-run; 5.2 pass by policy review)

---

## 6. Gaps found and fixes applied

| Gap (checklist #) | What was wrong | Fix applied (files) | Re-test status |
|-------------------|----------------|---------------------|----------------|
| 4.3 | A failed create showed Postgres's raw message in the UI (e.g. *"new row violates row-level security policy for table…"*), exposing table and policy names | Database errors now map to plain messages by error code (permission, invalid value, missing field, price too large, generic); raw error logged on the server only. `src/routes/dashboard/properties.new.tsx` | pass (code review, typecheck, build, bundle search); live trigger not-run |

---

## 7. Residual risks (honest leftovers)

- **No live verification yet.** No Supabase project, migrations not applied, no test accounts. Sections 2–5 rest mostly on code and policy review until the not-run items are run.
- **Only policy review for cross-sponsor access (5.2).** A live attempt with two sponsors is still needed.
- **Sponsors can publish their own listings (R1).** The update policy doesn't limit `status`, which contradicts the brief. Fix proposed, needs sign-off.
- **Any signed-in account can create listings (R2),** not only sponsors (no `sponsor_profiles` check). Fix proposed, needs sign-off.
- **Hard delete of any own listing (R3),** including published ones. Decision open.
- **Blocked edits look like success (R5).** No edit or delete UI yet; when added, 0 rows must be treated as "not found".
- **Create form can hang on "Saving…"** if the server call itself fails (no connection, no `.env`). It never shows false success, but shows no message. Kept to match the course template.
- **Server functions are public endpoints.** Anyone can call them directly. Mitigated: each checks `getUser()`, and RLS applies to every query.
- **Service-role key unused in app code this topic.** Confirm the deploy keeps it server-only (no `VITE_` prefix in Vercel) and re-run the bundle search on the deployed build.

---

## 8. Stakeholder verdict

**Ready to show stakeholders?** no

**Summary (3–5 sentences):**  
Secret hygiene was verified: secrets stay out of git, and file review of `src/lib/supabase.browser.ts` vs `src/lib/supabase.server.ts`, plus a search of the built browser bundle, confirms only the public URL and anon key reach the client. Logged-out access to every dashboard and property page redirects to `/login`. List isolation and create-as-owner are supported by code and RLS policy review, and one gap (raw database errors in the create form) was found and fixed. Real sign-in, logout, list isolation, create, and the cross-sponsor UI test are all not-run, because no Supabase project exists yet. It becomes "yes" once those run and pass on a development project and R1/R2 are decided.

**Sign-off:** name, date
