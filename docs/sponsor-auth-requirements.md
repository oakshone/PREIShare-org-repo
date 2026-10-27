# PREIshare Sponsor Auth & Property Listings — Security Requirements

*Written 2026-10-26, after the Sprint 4 build, as the short security contract. The full product
brief is `docs/requirements/sponsor-auth-and-listings-brief.md`. "Property" and "listing" mean the
same thing here; the table is `property_listings`.*

## 1. Context
PREIshare sponsors need a dashboard where they can sign in, view property listings they are allowed to manage, and add new properties. Data lives in Postgres via Supabase. Secret keys must never ship to the browser.

## 2. Actors
| Actor | Description | Signed in? |
| --- | --- | --- |
| Anonymous visitor | Anyone not logged in | No |
| Sponsor | Partner who manages their own listings | Yes (sponsor account) |
| Admin | Internal operator (out of scope this topic) | N/A this sprint topic |

## 3. User stories (in scope)
1. As a **sponsor**, I can sign in with my credentials so the app knows who I am.
2. As a **sponsor**, I can see a list of **only my** properties after sign-in.
3. As a **sponsor**, I can create a new property that is owned by my account.
4. As an **anonymous visitor**, I can reach the login page but I cannot open the dashboard or change listings.

## 4. Non-goals (out of scope this topic)
- Public (anonymous) create/update/delete of properties
- Full admin console or cross-sponsor moderation UI
- Putting the Supabase **service-role** (secret) key in any client/browser bundle
- Password-reset email polish, OAuth social login, or multi-factor auth (unless already provided by the starter)

## 5. Success criteria
Ticked from `docs/verification/sprint4-auth-listings-checklist.md` (overall PASS, 2026-10-25); row numbers in brackets.

- [x] Sponsor can complete login and land on a protected dashboard route (2.1, 2.2)
- [x] Unauthenticated users are blocked from dashboard/property routes (2.3: `/dashboard/listings` and `/dashboard/listings/new` → `/auth/login`)
- [x] Property list returns only rows the signed-in sponsor is allowed to see (3.2, 4.2, 4.3)
- [x] Property create associates the new row with the signed-in sponsor (3.1, 4.4: `owner_id` set from the verified session)
- [x] Browser-exposed config uses only public keys; secret keys stay server-only / env (5.1–5.5)
- [x] Database access for listings is enforced with Row-Level Security, not only UI hiding (1.2, 1.3: owner-only policies on `property_listings`)

## 6. Simple threat list
| Threat | What goes wrong | Requirement to mitigate |
| --- | --- | --- |
| Stolen or reused session | Attacker acts as the sponsor | Prefer server-checked session on protected routes; sign-out clears session |
| Guessing another sponsor's property id | Attacker reads/edits someone else's listing by id | RLS (and queries) must deny cross-sponsor access even if the id is known |
| Leaked service-role key | Attacker bypasses RLS with elevated API access | Never put service-role key in client code, git commits, or screenshots; use env on server only |
| "Security by hiding buttons" | UI hides edit controls but API still allows writes | Enforce rules in Postgres RLS + server paths, not only in React components |

**How each is met today:**
- **Stolen or reused session:** the `/dashboard` guard verifies the session on the server with `auth.getUser()`; Sign out runs on the server and clears the cookies.
- **Guessing an id:** every policy is `owner_id = auth.uid()`; another sponsor's row returns nothing (read) or 0 rows (update/delete), and a forged owner is rejected (`WITH CHECK`).
- **Leaked service-role key:** the key is unused and left empty; audit found it in no file, commit, or browser bundle.
- **Hiding buttons:** all listing reads and writes go through server functions (`src/server/listings.ts`), and RLS applies even to direct API calls.

**Known gap:** RLS limits *rows*, not *columns*. A sponsor calling Supabase directly can still change other columns on their *own* listings, including `status` (risk R1 in `docs/data-model/rls-policy-review.md`).

## 7. Environment & secret hygiene notes (requirements only)
- Document which env vars are **public** (safe in browser) vs **secret** (server only).
- Do not write real key values into this markdown file—names and purpose only.
- Later steps will create `.env.example` and server/browser Supabase clients to match these rules.

| Variable | Public or secret | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Public | Project address for the browser client (sign-in / sign-up) |
| `VITE_SUPABASE_ANON_KEY` | Public | Publishable key for the browser client; safe only because RLS is on |
| `SUPABASE_URL` | Server-only (not secret) | Project address for the server client |
| `SUPABASE_ANON_KEY` | Server-only (public-safe) | Publishable key for the server client, which acts as the signed-in user |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Bypasses RLS. Not used this sprint; leave empty |
| `DATABASE_URL` | **Secret** | Direct Postgres connection with password. Not used |

## 8. Open questions for the team
- Exact login method for sponsors in this sprint (email/password vs magic link) — pick one default and note it here.
  **Decision:** email + password, with Supabase's email confirmation. Sign-up is open (`/auth/signup`); invite-only is still a stakeholder question (risk R2).
- Whether a `sponsors` profile table is separate from `auth.users` — decide in the data-model step; record the assumption you need for stories above.
  **Decision:** separate. `sponsor_profiles` (`id` = the `auth.users` id) marks who is a sponsor. **Assumption used for the stories above:** any signed-in account acts as a sponsor; listings link directly to `auth.users` through `owner_id`, and nothing checks `sponsor_profiles` yet.

## 9. How later steps use this brief
This file is the contract for env separation, RLS policy design, login/dashboard routes, property list/create flows, and the end-to-end security verification checklist.

| Contract area | Where it was implemented |
| --- | --- |
| Env separation | `.env.example`, `docs/setup/supabase-env-checklist.md`, `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server) |
| RLS policy design | `supabase/migrations/20250321000000_property_listings.sql`, `docs/data-model/rls-policy-review.md` |
| Login / dashboard routes | `src/routes/auth/login.tsx`, `src/routes/auth/signup.tsx`, `src/routes/dashboard/route.tsx` (guard) |
| Property list / create | `src/routes/dashboard/listings/index.tsx`, `listings/new.tsx`, `src/server/listings.ts` |
| Security verification | `docs/verification/sprint4-auth-listings-checklist.md` |
