// Session helpers: "who is signed in?" and "sign out" (SERVER-ONLY).
//
// Uses ONLY the server Supabase client (anon key + the user's session cookies). Never the
// browser client, the service-role key, or any VITE_ value.
//
// Server-only because of createServerOnlyFn: the build strips these bodies from the browser
// bundle, and calling them in the browser throws. (The name `session.ts` isn't a protected
// `*.server.*` file name, so the wrapper is what keeps it on the server.)
//
// These are plain helpers, not server functions. Pages reach them through server functions,
// e.g. getCurrentUser in src/lib/auth.functions.ts.
import { createServerOnlyFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '../supabase/server'

/** The signed-in user: only what pages need, never tokens. */
export type SessionUser = { id: string; email: string | null }

export type SignOutResult = { ok: true } | { ok: false; error: string }

/**
 * The verified signed-in user, or null.
 * Uses auth.getUser(), which asks Supabase Auth to verify the session, instead of
 * auth.getSession(), which would trust the cookie's contents as-is.
 * Returns null if there's no session, it's invalid, or Supabase isn't configured yet, so
 * protected pages fail closed.
 */
export const getSessionUser = createServerOnlyFn(async (): Promise<SessionUser | null> => {
  let supabase
  try {
    supabase = getSupabaseServerClient()
  } catch (error) {
    console.error('[auth/session] Supabase server client not configured:', error)
    return null
  }

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return { id: data.user.id, email: data.user.email ?? null }
})

/**
 * Signs the current user out on the server.
 * auth.signOut() revokes the session with Supabase and clears the auth cookies through the
 * server client's cookie handler (setAll → setCookie on this response).
 * Raw errors stay in the server log; the caller gets a plain message.
 */
export const signOutSession = createServerOnlyFn(async (): Promise<SignOutResult> => {
  let supabase
  try {
    supabase = getSupabaseServerClient()
  } catch (error) {
    console.error('[auth/session] Supabase server client not configured:', error)
    return { ok: false, error: "Sign-out isn't available right now." }
  }

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('[auth/session] Sign-out failed:', error)
    return { ok: false, error: 'Could not sign out. Try again.' }
  }
  return { ok: true }
})
