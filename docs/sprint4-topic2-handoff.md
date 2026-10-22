# Sprint 4, Topic 2 Handoff: Sponsor Sign-in and Property Listings

**Audience:** PREIshare stakeholders, the next topic's owners, and course reviewers  
**Status:** Code complete for sign-in, the guarded dashboard, the property list, and property create. **Not live yet:** no Supabase project is provisioned and the migrations are not applied, so nobody can actually sign in.  
**Date:** 2026-10-22  
**Prepared by:** Jackson Nieporte  
**Build:** `main` @ `053a7b8` ("security checklist")  
**Inputs:**
- `docs/requirements/sponsor-auth-and-listings-brief.md`: what this topic was asked to deliver
- `docs/data-model-and-rls-matrix.md`: tables and who can do what to each
- `docs/env-var-checklist.md`: which keys are public and which are server-only
- `docs/security-verification-checklist.md`: what was verified, and the stakeholder verdict

---

## 1. Client outcomes

**In one sentence:** sponsors can now sign in, see only their own property listings, add a new listing as a draft, and sign out, with the database (not the web page) enforcing who sees what.

What a sponsor gets, once Supabase is set up:

| Outcome | Where | Status |
|---|---|---|
| Sign in with email and password; clear messages for wrong password, unconfirmed email, or too many attempts | `/login` | Built; live test not run |
| Every dashboard page requires sign-in; signed-out visitors go to `/login` and come back after signing in | `/dashboard/*` | **Verified** (all six pages redirect) |
| Sign out from the dashboard header | every dashboard page | Built; live test not run |
| See a list of **only your own** listings (title, city, status, newest first), with a clear empty state and error state | `/dashboard/properties` | Built; live test not run |
| Add a listing (title, address, city, price, optional description); it is saved as a **draft** owned by you | `/dashboard/properties/new` | Built; live test not run |
| A failed save shows a plain message and keeps you on the form; it never pretends to succeed | `/dashboard/properties/new` | **Verified** by code review (a gap was found and fixed) |
| No secret key can reach the browser | whole app | **Verified** (bundle and repository searches) |

**Stakeholder verdict** (`docs/security-verification-checklist.md`, section 8): **not ready to show yet.** Secret hygiene and signed-out protection pass. Everything that needs a real sign-in or real rows is `not-run` until a Supabase development project exists.

**What to say in a demo today:** "Sign-in and listings are built and the security rules are written into the database design. The next step is connecting a real Supabase project and running the live checks."

---

## 2. Architecture decisions

| # | Decision | Why | Trade-off |
|---|---|---|---|
| D1 | **Use Supabase** for sign-in, sessions, and the Postgres database, instead of running our own auth server and session store | No password storage, session store, signing keys, or database server to run ourselves; the database can enforce access per user | Depends on Supabase's availability and session model; some vendor lock-in |
| D2 | **Row Level Security (RLS) is the security boundary.** Every policy on `property_listings` is `owner_id = auth.uid()`; logged-out (`anon`) users have no policy, so they get nothing | Access is enforced by Postgres on every query, so a bug in a page can't leak another sponsor's rows | Policies must be right; they can't be tested until the project exists |
| D3 | **Reads have no owner filter in code.** The list query relies on RLS alone | Proves RLS is doing the filtering; no false sense of security from a React filter | None in practice; an extra server-side filter would also be acceptable, never a browser-only one |
| D4 | **Writes take the owner from the verified session on the server** (`owner_id: user.id` from `getUser()`), and the `WITH CHECK` policy confirms it | The browser never chooses who owns a row | — |
| D5 | **Sign-in happens in the browser; the access check happens on the server.** The `/dashboard` layout's `beforeLoad` calls the `getCurrentUser` server function, which uses `auth.getUser()` (verified) rather than `getSession()` (trusts the cookie) | The password is typed in the browser; the decision to show a page must be made where the page is built | One extra call to Supabase Auth per page load |
| D6 | **Two Supabase helpers, no shared one:** `supabase.browser.ts` (public URL + anon key, sign-in/out only) and `supabase.server.ts` (anon key + the user's cookies). Both use the **anon** key | A shared module could pull server code into the browser bundle. The build blocks `*.server.*` files from the browser and `*.client.*` files from the server, hence the `.browser.ts` name | Differs from `.cursorrules` ("use `lib/supabase.ts`"); `AGENTS.md` records the override |
| D7 | **Database work only in server functions** (`createServerFn`), called from loaders or form handlers | Loaders also run in the browser on link clicks; server functions always run on the server | — |
| D8 | **The service-role key is not used** this topic | It bypasses RLS; nothing in this topic needs admin power | Admin jobs (creating sponsor profiles, publishing) still need a separate server-only module later |
| D9 | **Database errors are shown as plain messages;** raw text goes to the server log | Raw Postgres messages exposed table and policy names (checklist 4.3) | Users see less detail; developers must check the logs |
| D10 | **Route files:** the `/dashboard` layout is `src/routes/dashboard.tsx`; the list is `properties.index.tsx` and the form is `properties.new.tsx` | Sprint 4 requires `dashboard.tsx`. The `index` name stops the form from nesting inside the list page (which has no `<Outlet />`) | `dashboard/route.tsx` must never be re-added (it would define `/dashboard` twice) |
| D11 | **Schema changes only as migrations** in `supabase/migrations/`, each with a unique timestamp; never edit one that may have been applied | Repeatable, reviewable database changes | Supabase CLI not set up yet; first apply is via the SQL editor plus `migration repair` |

---

## 3. File map

**Routes**

| File | URL | What it does |
|---|---|---|
| `src/routes/login.tsx` | `/login` | Sign-in form; browser Supabase client; safe `?redirect=` handling |
| `src/routes/dashboard.tsx` | `/dashboard` (layout) | Server-side guard (`getCurrentUser`) + `AppShell` with the Sign out button |
| `src/routes/dashboard/properties.index.tsx` | `/dashboard/properties` | Lists the sponsor's listings via a server function; empty and error states; "Add property" link |
| `src/routes/dashboard/properties.new.tsx` | `/dashboard/properties/new` | Create form + `createProperty` server function (session check, insert, plain error messages) |
| `src/routes/dashboard/index.tsx`, `portfolio.tsx`, `deals.tsx`, `profile.tsx` | `/dashboard/...` | Sprint 3 pages, still sample data, now behind the guard |

**Supabase and auth helpers**

| File | Runs | What it does |
|---|---|---|
| `src/lib/supabase.server.ts` | server only | `getSupabaseServerClient()`: anon key + the request's cookies, so RLS sees the user |
| `src/lib/supabase.browser.ts` | browser only | `getSupabaseBrowserClient()`: public `VITE_` values, for sign-in and sign-out |
| `src/lib/auth.functions.ts` | server function | `getCurrentUser()`: verified user or `null` (fails closed) |
| `src/lib/auth-validation.ts` | both | Sign-in field checks, error wording, `safeRedirectPath` |
| `src/env.d.ts` | types | Lists allowed env names; a typo is a type error |
| `src/components/dashboard/SignOutButton.tsx` | browser | Signs out, then goes to `/login` |
| `src/components/layout/navConfig.ts` | both | Now includes the "Properties" link |

**Database**

| File | What it does |
|---|---|
| `supabase/migrations/20250321000000_property_listings.sql` | `property_listings` table, indexes, `updated_at` trigger, RLS on, four owner-only policies |
| `supabase/migrations/20250321000100_sponsor_profiles.sql` | `sponsor_profiles` table (who is a sponsor), RLS on, read/update own profile |

**Config and docs**

| File | What it covers |
|---|---|
| `.env.example` | Variable names with empty values, labelled PUBLIC or SERVER-ONLY |
| `.gitignore` | Ignores `.env` and `.env.*` (except `.env.example`) and `.vercel` |
| `AGENTS.md` | Auth and data rules for agents, including the D6 and D10 overrides |
| `docs/data-model/property-listings-schema.md`, `docs/data-model/rls-policy-review.md` | Schema design; policy-by-policy review, how to apply migrations, risks R1–R9 |
| `docs/setup/supabase-env-checklist.md` | Step-by-step Supabase and Vercel setup |
| `docs/dashboard-cheat-sheet.md` | Plain-language notes for the team, incl. "Sign-in and the guard" |

---

## 4. Known limitations

**Not live yet**
- No Supabase project, no `.env`, migrations not applied. Sign-in can't succeed, so every dashboard page currently redirects to `/login`.
- Verification items that need a real database are `not-run`: real sign-in and sign-out (2.2–2.4), list isolation (3.1–3.3), create as owner (4.2), and the cross-sponsor UI test (5.1). Cross-sponsor access (5.2) passed by **policy review only**.

**Security risks still open** (`docs/data-model/rls-policy-review.md`, section 6)
- **R1:** a sponsor can set their own listing to `published`, which the brief forbids. Fix proposed; needs sign-off.
- **R2:** any signed-in account can sign in and create listings, not only sponsors. Neither the guard nor the insert policy checks for a `sponsor_profiles` row.
- **R3:** hard delete of any own listing, including published ones. Decision open.
- **R5:** a blocked edit or delete returns "0 rows", not an error. Not reachable yet (no edit or delete UI), but must be handled when added.

**Brief items not covered this topic** (`docs/data-model-and-rls-matrix.md`, section 3)
- No edit-draft screen, no submit-for-review, no contacts table, no `property_type` or `currency` columns (prices are shown as USD).
- Only 3 of the 5 lifecycle statuses (`under_offer` and `sold` are out of scope).
- No investor read path, so `/dashboard/deals` still shows sample deals.
- The brief planned `/sign-in` and `/sponsor/...` routes; this topic built `/login` and `/dashboard/properties`.

**Smaller issues**
- If the create form's server call fails outright (no connection), the button stays on "Saving…" with no message. It never shows false success. Kept to match the course template.
- The dashboard header still says "Signed in · sample data" on the live-data properties pages, and shows "Investor Dashboard" as the title on the create form.
- `src/lib/user.ts` is an old placeholder, replaced by `getCurrentUser`.
- Supabase CLI is not installed or configured.

---

## 5. Recommended next work

In order; each step unblocks the next.

1. **Provision a Supabase development project.** Set the env values locally and in Vercel (`docs/setup/supabase-env-checklist.md`), then apply both migrations (`docs/data-model/rls-policy-review.md`, section 4; run `migration repair` if using the SQL editor).
2. **Run every `not-run` check** in `docs/security-verification-checklist.md`, especially the cross-sponsor attempts with two test sponsors, and re-run the bundle search on the deployed build. Update the verdict.
3. **Decide R1 and R2** with the product owner, then add a **new** migration for the approved tightenings (sponsor-only insert; sponsors can set status only to `draft` or `archived`).
4. **Edit-draft flow,** treating "0 rows updated" as not found (R5), and decide delete behaviour (R3).
5. **Close schema gaps** from the brief: `property_type`, `currency`, a contacts table, and submission tracking.
6. **Investor read path** for `/dashboard/deals`: a separate public-columns view, if approved (brief open question 2).
7. **Tidy-ups:** header status and title on the properties pages, a message when the create call fails outright, removing `src/lib/user.ts`, and a decision on adopting the Supabase CLI.
