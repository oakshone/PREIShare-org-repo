// Auth server function: "who is signed in?", used by the /dashboard guard.
//
// The handler runs only on the server; browser code calls it as an RPC, so the Supabase server
// client never ships to the browser. Sign-in and sign-out happen in the browser with the anon
// key (src/routes/login.tsx, SignOutButton), and Supabase stores the session in cookies that
// this function reads.
//
// Uses getSupabaseServerClient() (anon key + the user's session cookies), never the
// service-role key.
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from './supabase/server'

export type CurrentUser = { id: string; email: string | null }

/**
 * The signed-in user, or null. Uses auth.getUser(), which asks Supabase Auth to verify the
 * session, instead of auth.getSession(), which would trust the cookie's contents as-is.
 * Returns null (signed out) if Supabase isn't configured yet, so protected pages fail closed
 * and redirect to /login.
 */
export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CurrentUser | null> => {
    let supabase
    try {
      supabase = getSupabaseServerClient()
    } catch (error) {
      console.error('[auth] Supabase server client not configured:', error)
      return null
    }
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    return { id: data.user.id, email: data.user.email ?? null }
  },
)
