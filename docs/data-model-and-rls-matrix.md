# Data Model and RLS Matrix: Sponsor Profiles and Property Listings

- **Status:** Design draft for Sprint 4. Supabase isn't provisioned and no migration exists. The SQL draft (`docs/data-model/draft-tables.sql`) hasn't been run anywhere.
- **Date:** 2026-10-19
- **Prepared by:** Jackson Nieporte (with Claude Code)
- **Audience:** next sprint's developers writing the migration, and reviewers checking access rules
- **Inputs:**
  - Requirements: `docs/sponsor-auth-requirements.md`. The brief currently lives at `docs/requirements/sponsor-auth-and-listings-brief.md`, and all quotes below come from it.
  - `docs/data-model/property-listings-schema.md`: the template-based table design this builds on
  - `docs/env-var-checklist.md`: which keys are client-safe or server-only

This document adds what the schema doc doesn't yet have:
- a table that says **who is a sponsor**
- a **full RLS matrix** for both tables
- a **mapping from each requirement to the design element that meets it**, including the gaps

---

## 1. Tables

### 1.1 `sponsor_profiles`: who is a sponsor

One row = one sponsor. The row's `id` **is** the sponsor's Supabase Auth account id.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `uuid` | no | Primary key **and** foreign key → `auth.users(id)` `ON DELETE CASCADE`; same value as the account id |
| `display_name` | `text` | no | 1–120 characters |
| `company_name` | `text` | yes | Sponsor's firm |
| `created_at` | `timestamptz` | no | Default `now()` |
| `updated_at` | `timestamptz` | no | Default `now()`; a trigger sets it on every update |

- **Being a sponsor means a row exists here.** An account without one can sign in but isn't a sponsor.
- **An admin creates rows,** using the service role on the server (brief assumption: invite-only). The app has no way to create one.
- **`ON DELETE CASCADE` is safe here,** because a profile means nothing without its account. Listings are protected separately: `property_listings.owner_id` uses `ON DELETE RESTRICT`, so an account that still owns listings can't be deleted.

### 1.2 `property_listings`: one sponsor's listings

Columns unchanged from the schema doc's template. This is the table the request calls "properties".

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `uuid` | no | Primary key; default `gen_random_uuid()` |
| `owner_id` | `uuid` | no | Foreign key → `auth.users(id)` `ON DELETE RESTRICT`; default `auth.uid()` |
| `title` | `text` | no | Short display name |
| `description` | `text` | yes | Longer listing copy |
| `address_line1` | `text` | no | Street address |
| `city` | `text` | no | |
| `region` | `text` | yes | State / province |
| `postal_code` | `text` | yes | |
| `country` | `text` | no | Default `'US'` |
| `price` | `numeric(12,2)` | no | Always `>= 0` |
| `status` | `text` | no | Default `'draft'`; one of `draft`, `published`, `archived` |
| `created_at` | `timestamptz` | no | Default `now()` |
| `updated_at` | `timestamptz` | no | Default `now()`; trigger sets it on every update |

Indexes: primary key on `id`; `owner_id` (my listings); `status` (filter by draft/published).

### 1.3 How the link works

```text
auth.users.id ──1:1──────► sponsor_profiles.id         "this account is a sponsor"
auth.users.id ──1:many───► property_listings.owner_id  "this account owns these listings"
```

- Both tables point at the **same account id**, so "my profile" and "my listings" are matched the same way: `= auth.uid()`.
- `owner_id` is filled in by the database from the verified session (`default auth.uid()`). The browser never supplies it.

---

## 2. RLS policy matrix

**Decision: unauthenticated (logged-out) users can read nothing in either table this sprint.**
- This is a private sponsor dashboard.
- Investor and visitor browsing is still an open question in the brief (open question 2).
- If browsing is approved, it will be a separate view exposing only public columns, never a policy on these tables. RLS filters rows, not columns, so a "read all published" policy would also expose street addresses.

RLS is enabled on both tables. **No matching policy means no access:** the query returns nothing, and a change affects nothing.

| Table | Operation | Who | Rule in plain English | Notes |
|---|---|---|---|---|
| `sponsor_profiles` | SELECT | authenticated | You can read only your own profile (`id = auth.uid()`). | Lets the header show the real sponsor name. |
| `sponsor_profiles` | INSERT | nobody (app) | No one can create a profile from the app. | An admin creates profiles with the service role, server-side (invite-only). |
| `sponsor_profiles` | UPDATE | authenticated | You can edit only your own profile, and you can't change its `id`. | `USING` and `WITH CHECK` both `id = auth.uid()`. |
| `sponsor_profiles` | DELETE | nobody (app) | No one can delete a profile from the app. | Removed only when an admin deletes the account (cascade). |
| `sponsor_profiles` | any | anon | Logged-out visitors see and change nothing. | No anon policy exists. |
| `property_listings` | SELECT | authenticated | You can read only listings you own. Anyone else's, even by exact `id`, returns nothing. | Template `listings_select_own`. |
| `property_listings` | INSERT | authenticated sponsor | You can create a listing only as yourself, and (proposed) only if you have a sponsor profile. | Template `listings_insert_own`. Profile check is **proposed, needs sign-off**. |
| `property_listings` | UPDATE | authenticated | You can change only your own listings, can't hand one to another account, and (proposed) can set status only to `draft` or `archived`. | Template `listings_update_own` (USING + WITH CHECK). Status limit is **proposed, needs sign-off**, so only admins publish. |
| `property_listings` | DELETE | authenticated | You can delete only your own listings. | Template `listings_delete_own`. Limiting it to drafts, or soft-delete, is open. |
| `property_listings` | any | anon | Logged-out visitors see and change nothing. | No "read all published" policy (template rule). |
| both | any | service role | Bypasses every rule above. | Server-only admin jobs (creating profiles, publishing). Never in browser code or shared React components (`docs/env-var-checklist.md`). |

---

## 3. Requirement → design mapping

Each row quotes the brief, points to what satisfies it, and says honestly whether it's covered.

| Requirement (quoted from the brief) | Design element | Status |
|---|---|---|
| Goal 1: "A sponsor can sign in, see only their own listings, and sign out." | `property_listings` SELECT row (`owner_id = auth.uid()`) | **Covered** (sign-in and sign-out are app work) |
| Criterion: "Requesting another sponsor's listing by URL returns 'not found', enforced by the server and Row Level Security, not just hidden in the UI." | SELECT row returns zero rows; RLS on the table | **Covered** (the server turns zero rows into 404) |
| Scope: "Sponsor-only area: Guarded layout; signed-out or non-sponsor users are redirected" | `sponsor_profiles` (defines "sponsor") + proposed INSERT profile check | **Partly** (the redirect itself is route work) |
| Scope: "Create draft: Form for the required fields; saves as `draft`" | `status` default `'draft'`; INSERT row | **Covered** |
| Scope: "Edit draft: Edit a draft the sponsor owns; read-only view for other statuses" | UPDATE row (`owner_id = auth.uid()`) | **Partly** (template rule also allows editing non-drafts) |
| Criterion: "A sponsor can withdraw (`published` → `archived`) but cannot publish their own listing." | UPDATE row, proposed `status IN ('draft','archived')` | **Covered only if** the tightening is adopted |
| Scope: "Submit for review: Marks a complete draft as submitted (recorded in the `review` group)" | — | **Not yet** (no submission column or review table) |
| Goal 3: "Listing status always follows the closed lifecycle (`draft` → `published` → `under_offer` → `sold` → `archived`)" | `status` check constraint (3 of the 5 values) | **Partly** (`under_offer` and `sold` are out of scope this sprint) |
| Criterion: "Saving rejects invalid data… missing title, `propertyType` not in the fixed list, an incomplete address, or a missing asking price or currency" | `title`, `address_line1`, `city`, `country`, `price` are NOT NULL; `price >= 0` | **Partly** (no `property_type` or `currency` column) |
| Criterion: "A listing cannot reach `published` without a financial summary and at least one contact" | — | **Not yet** (no contacts table) |
| Scope: "Database: Supabase PostgreSQL tables for listings, contacts, and sponsor profiles; Row Level Security on every table" | `property_listings`, `sponsor_profiles`; RLS on both | **Partly** (contacts table missing) |
| Criterion: "`/dashboard/deals` shows only `published`… listings from the database." | Anon and investor access: none; no public read policy | **Not yet** (deferred, brief open question 2) |
| Criterion: "A search of the production client bundle finds no service-role key, database URL, or other secret" | Service-role row; `docs/env-var-checklist.md` | **Covered** (process rule, verified by the bundle check) |

**Summary:** 5 covered (one only if a proposed tightening is adopted), 5 partly, 3 not yet. The gaps all need columns or tables beyond this draft (section 4).

---

## 4. Open questions

From `docs/data-model/property-listings-schema.md` section 7:
- Default `country` if sponsors are multi-country.
- `status` as a Postgres enum or text with a check (draft uses text + check).
- Soft-delete (`deleted_at`) or hard DELETE.

New in this document:
- **Adopt the two proposed tightenings?**
  - INSERT requires a sponsor profile.
  - UPDATE limits status to `draft` / `archived`.
- **Profile creation:** admin invite only (assumed), or self sign-up?
- **Close the "Partly / Not yet" rows** by adding:
  - `property_type`
  - `currency`
  - a contacts table
  - submission tracking (`submitted_at` or a review-events table)
- **Investor read path for Deals:** a public-columns view for signed-in investors, or deferred to a later sprint?
