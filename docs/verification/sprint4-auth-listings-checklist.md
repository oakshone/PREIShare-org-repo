# Sprint 4 — Auth & Listings Verification Checklist

**Project:** PREIshare dashboard  
**Date:** 2026-10-25  
**Verifier:** Jackson Nieporte  
**Environment:** local dev (`npm run dev` / `vite preview`) + Supabase development project `atanpnrqajydageytkzv` (ref only, no secrets)

## How to use this doc
Mark each row **PASS** or **FAIL**. Under Evidence, write what you did and what you saw.
If FAIL, note the fix prompt used and re-test before marking PASS.

**Added for honesty:** **NOT RUN** means nobody has observed it yet. Every Evidence cell says who
observed it and when:
- *Verifier, 2026-10-23*: live browser checks reported by Jackson. These ran on the earlier
  `/dashboard/properties` pages, which were replaced by `/dashboard/listings` on 2026-10-25.
- *Agent, 2026-10-25*: commands run by Claude Code against the repo, a production build, or the
  Supabase API with the public key only.

---

## 1. Database & migration

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 1.1 | `property_listings` (or agreed table name) exists in Supabase | PASS | *Agent, 2026-10-25:* `GET /rest/v1/property_listings` with the public key → HTTP 200 (`sponsor_profiles` also 200); a made-up table name → HTTP 404 `PGRST205`. Both migrations ran in the SQL Editor without errors (*Verifier, 2026-10-23*) |
| 1.2 | RLS is **enabled** on the listings table | PASS | Migration line 71: `ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY` (applied without errors). *Agent, 2026-10-25:* the same request with the public key and no sign-in returned **0 rows** (`Content-Range: */0`) although test accounts had created listings. The RLS toggle in the Supabase dashboard was not viewed |
| 1.3 | Policies match `docs/data-model/rls-policy-review.md` (select/insert/update scoped to owner) | PASS | Migration defines `listings_select_own` (USING `owner_id = auth.uid()`), `listings_insert_own` (WITH CHECK), `listings_update_own` (USING + WITH CHECK), `listings_delete_own` (USING), all `TO authenticated`, no `anon` policy, matching the review doc. Compared from the migration file; the live policy list was not pulled (SQL Editor: `select policyname from pg_policies where tablename = 'property_listings'`) |
| 1.4 | Migration file present: `supabase/migrations/20250321000000_property_listings.sql` | PASS | *Agent, 2026-10-25:* file exists in the repo, plus `20250321000100_sponsor_profiles.sql` |

## 2. Authentication & session

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 2.1 | Sponsor can sign up with email/password | PASS | *Verifier, 2026-10-23:* signed up at `/auth/signup`; Supabase asked for email confirmation; confirmed it. User A email: ____ (fill in) |
| 2.2 | Sponsor can log in via `src/routes/auth/login.tsx` | PASS | *Verifier, 2026-10-23:* signed in at `/auth/login`, landed on `/dashboard` with the account's email in the header. Wrong password showed "Email or password is incorrect." and stayed on the login page |
| 2.3 | Signed-out user hitting `/dashboard` (or listings) is redirected to login | PASS | *Agent, 2026-10-25:* `/dashboard/listings` → 307 `/auth/login?redirect=%2Fdashboard%2Flistings`; `/dashboard/listings/new` → 307 `/auth/login?redirect=%2Fdashboard%2Flistings%2Fnew`. *Verifier, 2026-10-23:* typed `/dashboard` after signing out → `/auth/login` |
| 2.4 | Sign-out clears session; protected pages no longer load data | PASS | *Verifier, 2026-10-23:* clicked Sign out (server-side `signOut` → `signOutSession`), then opened `/dashboard` → sent to `/auth/login` |

## 3. Listings happy path (User A)

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 3.1 | Create listing via UI (title, address/fields per schema) succeeds | NOT RUN | The new form (`/dashboard/listings/new`) hasn't been tried live. *Verifier, 2026-10-23:* creating a listing on the earlier `/dashboard/properties/new` page succeeded and returned to the list as `draft` |
| 3.2 | New row visible on `src/routes/dashboard/listings/index.tsx` | NOT RUN | New page not tried live. Earlier list page showed User A's new listing (*Verifier, 2026-10-23*) |
| 3.3 | Data matches Postgres (Supabase Table Editor), not mock arrays in the client | NOT RUN | Table Editor not compared. *Agent, 2026-10-25:* code review: the listings pages and components contain no hard-coded listing arrays; the list comes only from the `listMyListings` loader |
| 3.4 | Server path used: create/read go through `src/server/listings.ts` (or documented server functions) | PASS | *Agent, 2026-10-25:* `listings/index.tsx` loader = `listMyListings()`, `listings/new.tsx` calls `createListing` via `useServerFn`; neither page nor the two components import a Supabase client. The built browser files contain no `property_listings` query or server code. Network tab / server log not inspected |

## 4. Row Level Security (User B)

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 4.1 | Second account User B can sign up / log in | PASS | *Verifier, 2026-10-23:* signed up and signed in as a second account. User B email: ____ (fill in) |
| 4.2 | User B **cannot** see User A's listings in the UI | PASS (earlier page) | *Verifier, 2026-10-23:* User B's list on `/dashboard/properties` was empty; A's listing not shown. Not yet repeated on `/dashboard/listings` |
| 4.3 | Direct read as User B (UI empty list and/or Table Editor filtered by auth) shows no foreign rows | PASS | User B's UI list empty (4.2). *Agent, 2026-10-25:* direct API read with no sign-in returned 0 rows. A direct API read *signed in as User B* was not tried |
| 4.4 | User B can create their own listing and only see their own | NOT RUN | Not tested |

## 5. Secret-hygiene audit

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 5.1 | `.env` with real values is **not** committed (`git status` / `git check-ignore`) | PASS | *Agent, 2026-10-25:* `git check-ignore` → `.env`, `.env.local`, `.env.production` ignored; `git ls-files` lists only `.env.example`; `.env` not in `git status`; `.env` never committed in any of 88 commits (all branches) |
| 5.2 | `.env.example` has placeholder values only (no live keys) | PASS | *Agent, 2026-10-25:* `grep -E '^[A-Z_]+=.+' .env.example` → 0 lines; all 6 names empty |
| 5.3 | Repo search: no `service_role` key material in source, docs, or client bundle config | PASS | *Agent, 2026-10-25:* `service_role` / `SUPABASE_SERVICE_ROLE`: 16 mentions in 8 files, names only, no assigned value. Key-shaped search (JWT, `sb_secret_…`, `sb_publishable_…`, real project URL, `postgres://user:pass@`) over 106 files: 1 hit, the placeholder `postgres://user:pass@` in a doc. Git history: no key-shaped string ever added |
| 5.4 | Browser-exposed env only uses public anon/URL names (e.g. `VITE_` / `PUBLIC_` per project convention)—never service role | PASS | *Agent, 2026-10-25:* only `src/lib/supabase/client.ts` reads browser env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable key). `process.env` only in `src/lib/supabase/server.ts`. Matches `docs/setup/supabase-env-checklist.md` (updated 2026-10-25) |
| 5.5 | Client bundle / Network tab does not send service-role header | PASS (bundle) | *Agent, 2026-10-25:* fresh build with the real `.env`: browser files contain 1 publishable key + 1 project URL (expected), 0 secret keys, 0 service-role tokens, 0 `SUPABASE_SERVICE_ROLE_KEY` names. `SUPABASE_SERVICE_ROLE_KEY` is empty in `.env`, so the app can't send it. Browser Network tab not inspected |

## 6. Gaps fixed this session

| Gap | Agent fix summary | Re-test result |
|-----|-------------------|----------------|
| Create form showed raw Postgres errors (table and policy names) | Database error codes mapped to plain messages; raw error logged on the server only | PASS (code review, build, bundle search) |
| Template update schema refilled defaults (`status` → `draft`, `description` → `''`) on every partial update | Update schema built from fields without defaults | PASS (*Agent, 2026-10-25:* update with only a title returned only `title` + `id`) |
| `z.coerce.number()` turned a blank price into `0` | Blank input → missing; price must be filled, ≥ 0, ≤ 2 decimals, fits `numeric(12,2)` | PASS (*Agent, 2026-10-25:* blank, negative and 3-decimal prices rejected; `0.29` accepted) |
| Create form could hang on "Saving…" if the server call failed | New `listings/new.tsx` wraps the call in try/catch and shows a message | NOT RUN (live network failure not simulated) |
| Bundle pattern check flagged Supabase library text (`startsWith('sb_secret_')`) | Pattern now requires real key characters after the prefix | PASS (*Agent, 2026-10-25:* "ok: no secret patterns in browser files") |

## 7. Sign-off

- [ ] Client story covered: sponsors can log in; listings load from Postgres under RLS; secrets kept out of the client bundle
- [ ] All critical rows above are PASS (or FAIL accepted with written follow-up)
- [x] No real secrets written into this markdown file

**Overall:** NOT COMPLETE. No row failed, but 3.1–3.3 and 4.4 haven't been run on the new `/dashboard/listings` pages, and 4.2 was last run on the earlier page.  
**Notes for handoff (Step 12):**
- To finish: with `npm run dev`, as User A create a listing at `/dashboard/listings/new` (3.1), see it on `/dashboard/listings` (3.2) and in the Table Editor (3.3); as User B, check A's listing is absent (4.2) and create one of B's own (4.4).
- Open risks: R1 (sponsors can set `status` to `published`; left open by decision), R2 (public sign-up lets any account create listings), R3 (hard delete).
- Not inspected: Vercel environment variables; the browser Network tab; the live `pg_policies` list.
- Fill in the User A / User B emails (2.1, 4.1) — emails only, never passwords.
