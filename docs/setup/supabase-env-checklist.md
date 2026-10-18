# Supabase environment checklist (PREIshare)

- **Requirements brief:** `docs/requirements/sponsor-auth-and-listings-brief.md`. Section 8, "Server-only boundary", is the source of truth for what may and may not reach the browser.
- **Template file:** `.env.example` (repo root, committed, names only)
- **Conventions:** TanStack Start execution model (environment variables, `createServerFn`, `createServerOnlyFn`, `*.server.ts` import protection) and AGENTS.md "Environment variables"
- **Status (2026-10-18):** Supabase is **not provisioned**. No code reads these variables, and `@supabase/supabase-js` / `@supabase/ssr` aren't in `package.json`; adding them needs team approval. The dashboard still runs on sample data with an empty `.env`.

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
| `SUPABASE_URL` | SERVER-ONLY | No | Server functions | Project address. Not secret, but the browser doesn't need it with server-only access. |
| `SUPABASE_ANON_KEY` | SERVER-ONLY | No (public-safe) | Server functions acting as the signed-in user | Called "anon" or "publishable" in Supabase. Row Level Security still applies to it. |
| `SUPABASE_SERVICE_ROLE_KEY` | SERVER-ONLY | **Yes** | Admin/maintenance server code only | Called "service_role" or "secret". **Bypasses all RLS.** Never used for normal user requests. |
| `DATABASE_URL` (optional) | SERVER-ONLY | **Yes** | Migration tooling only | Contains the database password. Leave commented out unless a tool needs a direct Postgres connection. |
| `VITE_SUPABASE_URL` | PUBLIC | No | Browser | **Not used.** Uncomment only if open question 1 is decided "browser client". |
| `VITE_SUPABASE_ANON_KEY` | PUBLIC | No (public-safe) | Browser | **Not used.** Same condition, and RLS must be on for every table first. |

The brief recommends **server-only access** (open question 1): all Supabase reads and writes go through server functions, so **no `VITE_` Supabase variables are needed at all.**

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
- [ ] Leave the `PUBLIC` block commented out unless the team has decided otherwise.
- [ ] Restart `npm run dev` after changing `.env`. Vite reads env files at startup.

## 5. Vercel setup

- [ ] Add each `SERVER-ONLY` variable in Vercel → Project Settings → Environment Variables.
- [ ] Use **separate Supabase projects or keys** for Preview and Production, so a preview deploy can never touch production data.
- [ ] Don't add any `VITE_` Supabase variable on Vercel unless the browser-client decision has been made.
- [ ] Redeploy after changing variables. Existing deployments keep the old values.

## 6. Code conventions (TanStack Start)

- [ ] **Read secrets inside a server handler,** never at the top of a file:
  ```ts
  const getListings = createServerFn({ method: 'GET' }).handler(async () => {
    const key = process.env.SUPABASE_ANON_KEY // read per request, on the server
    // ...
  })
  ```
  Module-level `process.env` reads can leak into the client bundle, and they can be `undefined` on edge runtimes.
- [ ] **Put Supabase client setup in a server-only file,** for example `src/lib/supabase.server.ts`. The `.server.ts` suffix makes TanStack Start refuse to import it from browser code. Alternatively, wrap helpers in `createServerOnlyFn`.
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
- [ ] Search the diff for `VITE_` and confirm each one is meant to be public.

## 8. If a secret is ever exposed

Committed, pasted in chat, screenshotted, or deployed with `VITE_`:

1. **Rotate it in Supabase immediately.** This is the only real fix; copies in clones and caches can't be recalled.
2. Update `.env` and the Vercel variables with the new value, then redeploy.
3. Stop tracking the file if needed (`git rm --cached .env`, then commit).
4. Check Supabase logs for activity you don't recognise.
5. Optionally rewrite git history to remove it. This is cleanup only, after rotating.
