# Supabase environment checklist (PREIshare)

- **Requirements brief:** `docs/requirements/sponsor-auth-and-listings-brief.md`. Section 8, "Server-only boundary", is the source of truth for what may and may not reach the browser.
- **Template file:** `.env.example` (repo root, committed, names only)
- **Conventions:** TanStack Start execution model (environment variables, `createServerFn`, `createServerOnlyFn`, `*.server.ts` import protection) and AGENTS.md "Environment variables"
- **Status (2026-10-25):** a Supabase **development** project is provisioned and both migrations are applied. `@supabase/supabase-js` and `@supabase/ssr` are installed. Browser sign-in was chosen (2026-10-22), so the two `VITE_` variables are **used**. The service-role key is not used by any code. Latest audit: section 9.
- **Earlier status (2026-10-18):** not provisioned, no Supabase packages, no code reading these variables.

Work through this list when Supabase is set up, and again before every pull request that touches env or auth code.

---

## 1. Hard rules

- [ ] **No real values in `.env.example`.** Every line is `NAME=` with nothing after `=`. No keys, passwords, project URLs, or "example" keys copied from the dashboard.
- [ ] **No real values in this checklist** or any other doc, issue, screenshot, or chat. Use placeholders like `<project-ref>`.
- [ ] **Real values live in only two places:** a local `.env` (gitignored) and Vercel → Project Settings → Environment Variables.
- [ ] **Every variable is labelled `PUBLIC` or `SERVER-ONLY`** in `.env.example`, and the label matches the prefix:
  - `PUBLIC` ⇔ starts with `VITE_` (ends up in the browser bundle).
  - `SERVER-ONLY` ⇔ no `VITE_` prefix (read with `process.env` on the server).
- [ ] **Never create `VITE_` versions of secrets**, for example `VITE_SUPABASE_SERVICE_ROLE_KEY` or `VITE_DATABASE_URL`.

## 2. Variable inventory

| Variable | Label | Secret? | Read where | Notes |
| --- | --- | --- | --- | --- |
| `SUPABASE_URL` | SERVER-ONLY | No | `src/lib/supabase/server.ts` | Project address. Not secret; the server copy of the same value as `VITE_SUPABASE_URL`. |
| `SUPABASE_ANON_KEY` | SERVER-ONLY | No (public-safe) | `src/lib/supabase/server.ts` (server functions acting as the signed-in user) | Called "anon" or "publishable" in Supabase. Row Level Security still applies to it. |
| `SUPABASE_SERVICE_ROLE_KEY` | SERVER-ONLY | **Yes** | **Nowhere yet** (leave empty) | Called "service_role" or "secret". **Bypasses all RLS.** Only for future admin code; never for normal user requests. |
| `DATABASE_URL` (optional) | SERVER-ONLY | **Yes** | Migration tooling only | Contains the database password. Leave commented out unless a tool needs a direct Postgres connection. |
| `VITE_SUPABASE_URL` | PUBLIC | No | `src/lib/supabase/client.ts` (browser) | **Used** for sign-in and sign-up in the browser (decided 2026-10-22). |
| `VITE_SUPABASE_ANON_KEY` | PUBLIC | No (public-safe) | `src/lib/supabase/client.ts` (browser) | **Used.** The publishable key; safe only because RLS is on for every table. Same value as `SUPABASE_ANON_KEY`. |

**Decision (2026-10-22): browser sign-in.** Sign-in and sign-up run in the browser with the two `VITE_` values; every other Supabase read and write (session checks, sign-out, listings) goes through server functions with the `SUPABASE_` pair. (The brief's original recommendation was server-only access, with no `VITE_` variables.)

## 3. Gitignore coverage

`.gitignore` must ignore every real env file and keep only the template:

```gitignore
.env
.env.*
!.env.example
*.local
.vercel
```

- [ ] Run this from the repo root. Every line except `.env.example` must say `ignored`:
  ```bash
  for f in .env .env.local .env.production .env.development .env.development.local .env.example; do
    printf "%-24s " "$f"; git check-ignore -q "$f" && echo ignored || echo NOT-ignored
  done
  ```
- [ ] `git ls-files | grep -i '\.env'` lists **only** `.env.example`.
- [ ] `git status` doesn't show `.env` or any `.env.*` file as a change to commit. Never `git add -f` an env file.

## 4. Local setup (when Supabase exists)

- [ ] Copy the template: `cp .env.example .env`.
- [ ] Fill in `.env` from the Supabase dashboard (Project Settings → API). Use a **development** project, not production.
- [ ] Fill in **both** blocks: the `SERVER-ONLY` pair and the `PUBLIC` (`VITE_`) pair, with the same URL and **publishable** key. Leave `SUPABASE_SERVICE_ROLE_KEY` empty.
- [ ] No spaces around `=`, no quotes.
- [ ] Restart `npm run dev` after changing `.env`. Vite reads env files at startup.

## 5. Vercel setup

- [ ] Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel → Project Settings → Environment Variables. Don't add `SUPABASE_SERVICE_ROLE_KEY` until admin code needs it.
- [ ] Use **separate Supabase projects or keys** for Preview and Production, so a preview deploy can never touch production data.
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` too (browser sign-in needs them). Never add a `VITE_` version of a secret.
- [ ] Redeploy after changing variables. Existing deployments keep the old values, and `VITE_` values are baked in at build time.

## 6. Code conventions (TanStack Start)

- [ ] **Read secrets inside a server handler,** never at the top of a file:
  ```ts
  const getListings = createServerFn({ method: 'GET' }).handler(async () => {
    const key = process.env.SUPABASE_ANON_KEY // read per request, on the server
    // ...
  })
  ```
  Module-level `process.env` reads can leak into the client bundle, and they can be `undefined` on edge runtimes.
- [ ] **Put Supabase client setup in a server-only file,** `src/lib/supabase/server.ts`, wrapped in `createServerOnlyFn` so its code is stripped from the browser bundle. (A `.server.ts` file-name suffix is the other way to get this protection.)
- [ ] **Never read `process.env` in a route loader.** Loaders run in the browser too, so call a server function from the loader.
- [ ] **Never send a key back to the browser** from a server function, not even "just the anon key".
- [ ] **Use the service-role key only in clearly named admin code.** User-facing requests use the signed-in user's session, so RLS applies.
- [ ] Optional: declare the variable names in `src/env.d.ts` (`ProcessEnv` for server, `ImportMetaEnv` for `VITE_`) so typos fail the type-check.

## 7. Before every pull request that touches env or auth

- [ ] `.env.example` changed? Every new line is `NAME=` (empty) and labelled `PUBLIC` or `SERVER-ONLY`.
- [ ] `git diff --cached --name-only` shows no `.env` / `.env.*` file except `.env.example`.
- [ ] `npm run typecheck` and `npm run build` pass.
- [ ] **Bundle check:** the built browser files don't contain the service-role key. With your local `.env` filled in:
  ```bash
  KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' .env | cut -d= -f2-)
  if [ -z "$KEY" ]; then echo "skipped: no key in .env"
  elif grep -rqF "$KEY" .output/public; then echo "LEAK: key found in browser files"
  else echo "ok: key not in browser files"; fi
  ```
- [ ] **Pattern check** (works even when the service-role key is empty locally): the browser files must contain no secret-key or service-role patterns.
  ```bash
  grep -rlE 'sb_secret_[A-Za-z0-9_-]{10,}|SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|postgres(ql)?://[^ ]+:[^ ]+@' .output/public && echo "CHECK: review these files" || echo "ok: no secret patterns in browser files"
  ```
  (The publishable key and project URL *are* expected in the browser files. The bare text `sb_secret_` also appears inside the Supabase library, which checks key prefixes, so the pattern requires real key characters after it.)
- [ ] Search the diff for `VITE_` and confirm each one is meant to be public.

## 8. If a secret is ever exposed

Committed, pasted in chat, screenshotted, or deployed with `VITE_`:

1. **Rotate it in Supabase immediately.** This is the only real fix; copies in clones and caches can't be recalled.
2. Update `.env` and the Vercel variables with the new value, then redeploy.
3. Stop tracking the file if needed (`git rm --cached .env`, then commit).
4. Check Supabase logs for activity you don't recognise.
5. Optionally rewrite git history to remove it. This is cleanup only, after rotating.

## 9. Audit log

### 2026-10-25: secret-hygiene audit (values never printed)

| Check | Result |
| --- | --- |
| `service_role` / `SUPABASE_SERVICE_ROLE` in tracked + untracked files | Pass: 16 mentions in 8 files, names only (docs, comments, `.env.example`, `src/env.d.ts` type). No line assigns a value to it or to `DATABASE_URL` |
| Key-shaped strings (JWT, `sb_secret_`, `sb_publishable_`, real project URL, `postgres://user:pass@`) in 106 files | Pass: one hit, the placeholder `postgres://user:pass@` in `docs/security-verification-checklist.md` |
| `.env` tracked by git | Pass: not tracked; `.env`, `.env.local`, `.env.production` ignored; only `.env.example` tracked |
| Git history (88 commits, all branches) | Pass: `.env` never committed; no key-shaped string ever added |
| Env names in client-facing code (`src/routes`, `src/components`, `src/lib`) | Pass: only `src/lib/supabase/client.ts` reads env (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); `process.env` only in `src/lib/supabase/server.ts`, inside `createServerOnlyFn` |
| Built browser bundle (with real `.env`) | Pass: 1 publishable key + 1 project URL (public by design); 0 secret keys, 0 service-role tokens, 0 `SUPABASE_SERVICE_ROLE_KEY` / `DATABASE_URL` names, 0 database URLs |
| `.env.example` | Pass: all 6 names empty |
| Local `.env` | Pass: both pairs set with the publishable key; `SUPABASE_SERVICE_ROLE_KEY` empty; no extra `VITE_` names |
| `.output`, `dist`, `.vercel` gitignored | Pass |
| Vercel environment variables | Not checked (no access): confirm no `VITE_` secret and no unneeded service-role key |
| Separate Supabase projects for Preview / Production (section 5) | Open: one development project so far |

