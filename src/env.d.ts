/// <reference types="vite/client" />

// Typed environment variable names. Must match `.env.example` and
// docs/env-var-checklist.md, section 2. Values never go in this file.

// Make unknown `import.meta.env.*` names a type error, so a typo fails `npm run typecheck`.
interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

// CLIENT-SAFE: `VITE_` prefix, copied into the browser bundle. Never a secret.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// SERVER-ONLY: read with `process.env` inside server handlers only. Node's `process.env`
// accepts any name, so server code reads these through a helper typed with `keyof ServerEnv`
// (see `readServerEnv` in src/lib/supabase.server.ts) to catch typos.
interface ServerEnv {
  readonly SUPABASE_URL?: string
  readonly SUPABASE_ANON_KEY?: string
  readonly SUPABASE_SERVICE_ROLE_KEY?: string
  readonly DATABASE_URL?: string
}
