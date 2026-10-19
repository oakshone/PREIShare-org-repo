// Server Supabase client that acts AS THE SIGNED-IN USER (SERVER-ONLY).
//
// The `.server.ts` suffix makes TanStack Start refuse to import this file from browser code.
// Reads SUPABASE_URL and SUPABASE_ANON_KEY, the server-only variables in `.env.example`
// (see docs/env-var-checklist.md, section 2), with `process.env` inside the function, per
// request, never at module scope.
//
// The user's session comes from their auth cookies, so every query runs as that user and Row
// Level Security applies (owner_id = auth.uid() in
// supabase/migrations/20250321000000_property_listings.sql).
//
// This client deliberately does NOT use SUPABASE_SERVICE_ROLE_KEY. That key bypasses RLS and
// belongs only in a separate admin module for admin jobs. Never import it into browser code
// or shared React components.
import { createServerClient } from '@supabase/ssr'
import { getCookies, setCookie } from '@tanstack/react-start/server'

/** Reads a server-only variable. Typed by `ServerEnv` in src/env.d.ts, so a misspelled name fails the type-check. */
function readServerEnv(name: keyof ServerEnv): string | undefined {
  return process.env[name]
}

/**
 * Returns a Supabase client for the current request, signed in as the user whose session
 * cookies came with it (or anonymous if there are none, in which case RLS returns nothing).
 * Call it inside a `createServerFn` handler (or route `beforeLoad` via a server function),
 * once per request.
 */
export function getSupabaseServerClient() {
  const url = readServerEnv('SUPABASE_URL')
  const anonKey = readServerEnv('SUPABASE_ANON_KEY')

  if (!url || !anonKey) {
    throw new Error(
      'Supabase server client is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY ' +
        'in .env (see .env.example and docs/env-var-checklist.md).',
    )
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }))
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options)
        }
      },
    },
  })
}
