// Browser Supabase client (CLIENT-SAFE values only).
//
// Browser-only because of createClientOnlyFn below: it throws if called during server rendering.
// The file is named `client.ts`, not `*.client.ts`, on purpose: TanStack Start blocks
// `*.client.*` files from the server build, but the login page and Sign out button that import
// this also render on the server.
//
// Reads only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, the two client-safe variables in
// `.env.example` (see docs/env-var-checklist.md, section 2). Both are public by design: every
// request made with the anon key is still checked by Row Level Security against the signed-in
// user (supabase/migrations/20250321000000_property_listings.sql).
//
// NEVER read the service-role key, the database URL, or any non-VITE_ variable here.
// Anything in this file ships in the browser bundle.
import { createBrowserClient } from '@supabase/ssr'
import { createClientOnlyFn } from '@tanstack/react-start'
import type { Database } from './types'

/**
 * Creates the browser Supabase client (one shared instance per page).
 * Use it for sign-in / sign-out only; listing reads and writes go through server functions
 * that use `getSupabaseServerClient()` from `./server`.
 * Throws if called during server rendering.
 */
export const getSupabaseBrowserClient = createClientOnlyFn(() => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Supabase browser client is not configured. Set VITE_SUPABASE_URL and ' +
        'VITE_SUPABASE_ANON_KEY in .env (see .env.example and docs/env-var-checklist.md).',
    )
  }

  return createBrowserClient<Database>(url, anonKey)
})
