// Auth server functions: "who is signed in?" (the /dashboard guard and the /auth pages) and
// "sign out" (SignOutButton).
//
// The handlers run only on the server; browser code calls them as RPCs. The logic lives in
// src/lib/auth/session.ts, which uses only the server Supabase client (anon key + the user's
// session cookies), never the service-role key.
// Sign-up and sign-in happen in the browser (src/routes/auth/signup.tsx, src/routes/auth/login.tsx),
// and Supabase stores the session in cookies that these functions read and clear.
import { createServerFn } from '@tanstack/react-start'
import { getSessionUser, signOutSession } from './auth/session'
import type { SessionUser, SignOutResult } from './auth/session'

export type CurrentUser = SessionUser

/**
 * The signed-in user, or null (verified with auth.getUser(); fails closed if Supabase isn't
 * configured, so protected pages redirect to /auth/login).
 */
export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CurrentUser | null> => getSessionUser(),
)

/**
 * Signs the current user out on the server: revokes the session and clears the auth cookies
 * on this response. POST, because it changes state.
 */
export const signOut = createServerFn({ method: 'POST' }).handler(
  async (): Promise<SignOutResult> => signOutSession(),
)
