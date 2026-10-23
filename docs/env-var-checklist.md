# Environment Variable Checklist (Supabase)

- **Requirements:** `docs/requirements/sponsor-auth-and-listings-brief.md`; section 8 is the server-only boundary.
- **Template file:** `.env.example` (repo root, committed)
- **Related:**
  - `docs/setup/supabase-env-checklist.md`: full setup, Vercel, and code steps
  - `docs/data-model/property-listings-schema.md`: RLS and server-vs-browser map
- **Status (2026-10-19):** Supabase is **not provisioned**. No real values exist yet, and no code reads these variables.

## 1. Placeholders only

- [ ] `.env.example` contains **placeholders only**. Every variable is empty (`NAME=`) or uses an obviously fake value such as `<project-ref>`.
- [ ] **No real values pasted from the Supabase dashboard,** in any committed file: no project URL, anon/publishable key, service-role/secret key, or database password.
- [ ] Docs, screenshots, issues, and chat use placeholders too, e.g. `https://<project-ref>.supabase.co`.
- [ ] Real values go **only** in a local `.env` (gitignored) or Vercel → Project Settings → Environment Variables, once Supabase exists.

Quick check: `grep -nE '^[A-Z_]+=.+' .env.example` should print nothing.

## 2. Supabase variables

**Labels** (`.env.example` writes client-safe as `PUBLIC`):
- **Client-safe** = `VITE_` prefix. Copied into the browser bundle; anyone can read it, so it must never be a secret.
- **Server-only** = no prefix. Read with `process.env` inside a server function handler, never at the top of a file, in a loader, or in a component.

| Variable | Label | Placeholder in `.env.example` | Reason (one line) |
| --- | --- | --- | --- |
| `SUPABASE_URL` | **Server-only** | `SUPABASE_URL=` | Not secret, but only the server's Supabase client needs it under the server-only design, so nothing Supabase-related ships to the browser. |
| `SUPABASE_ANON_KEY` | **Server-only** | `SUPABASE_ANON_KEY=` | Public-safe by design, but kept server-side so the server can act as the signed-in user with RLS applied, without the browser holding any key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** | `SUPABASE_SERVICE_ROLE_KEY=` | Secret: it bypasses every RLS rule, so anyone who reads it can read or change every sponsor's rows. |
| `DATABASE_URL` | **Server-only** | `# DATABASE_URL=` (commented) | Secret: it contains the database password and connects to Postgres directly, also skipping RLS. |
| `VITE_SUPABASE_URL` | **Client-safe** | `VITE_SUPABASE_URL=` | Just the project's public address; safe to expose, needed for browser sign-in (see note). |
| `VITE_SUPABASE_ANON_KEY` | **Client-safe** | `VITE_SUPABASE_ANON_KEY=` | Designed to be public: every request made with it is still checked by RLS against the signed-in user (only once RLS is on for every table). |

- [ ] Every variable in `.env.example` is labelled client-safe (`PUBLIC`) or server-only, and the label matches the prefix.
- [ ] **Forbidden names:** never create `VITE_SUPABASE_SERVICE_ROLE_KEY`, `VITE_DATABASE_URL`, or any `VITE_` secret.
- [ ] **The service-role key is server-only.** It is read only inside a server-only admin module (e.g. `src/lib/supabase-admin.server.ts`, where the `.server.ts` suffix blocks browser imports), and only for admin jobs, never normal sponsor requests.
- [ ] **The service-role key must not be imported into browser code or shared React components.** No component, hook, route `component`, route loader, or shared module used by both server and browser (e.g. a common `src/lib/supabase.ts`) may import the admin module or reference `SUPABASE_SERVICE_ROLE_KEY`. Anything a component imports can end up in the browser bundle.

**Note on the client-safe pair:** browser sign-in is now the decision (login template, 2026-10-22): `src/routes/login.tsx` and the dashboard's Sign out button use `src/lib/supabase/client.ts`. Both variables are **active** in `.env.example` (values still empty). They're public-safe *because* RLS is enabled on every table in `supabase/migrations/` and checks every request made with the anon key.

## 3. Gitignore coverage

- [ ] `.gitignore` contains:
  ```gitignore
  .env
  .env.*
  !.env.example
  *.local
  .vercel
  ```
- [ ] Every real env file is ignored and only the template is not:
  ```bash
  for f in .env .env.local .env.production .env.development .env.example; do
    printf "%-18s " "$f"; git check-ignore -q "$f" && echo ignored || echo NOT-ignored
  done
  ```
  Expected: all `ignored` except `.env.example`.
- [ ] `git ls-files | grep -i '\.env'` lists only `.env.example`.

## 4. Before committing env-related changes

- [ ] `.env.example` still passes the placeholder check (section 1).
- [ ] No `.env` or `.env.*` file (other than `.env.example`) appears in `git status` or `git diff --cached --name-only`.
- [ ] Any new `VITE_` variable is genuinely meant to be public.
- [ ] If a real value was ever committed or pasted: **rotate it in Supabase first**, then remove it (see `docs/setup/supabase-env-checklist.md`, section 8).
