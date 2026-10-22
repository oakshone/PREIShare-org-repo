// Sign-in validation shared by the login form (instant feedback) and the signIn server
// function (the real check). Plain functions only: no Supabase, no env, safe in the browser.

export type SignInInput = { email: string; password: string }
export type SignInFieldErrors = Partial<Record<keyof SignInInput, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Returns a message per invalid field; an empty object means the input is valid. */
export function validateSignIn({ email, password }: SignInInput): SignInFieldErrors {
  const errors: SignInFieldErrors = {}
  if (!email.trim()) errors.email = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address, like name@example.com.'
  if (!password) errors.password = 'Enter your password.'
  return errors
}

/**
 * Turns a Supabase sign-in error into a plain message for the form. Never shows raw
 * Supabase text, so wording stays consistent and nothing internal leaks.
 */
export function describeSignInError(error: { code?: string; status?: number }): string {
  if (error.code === 'invalid_credentials') return 'Email or password is incorrect.'
  if (error.code === 'email_not_confirmed') {
    return 'Confirm your email address first, using the link we sent you.'
  }
  if (error.status === 429) return 'Too many sign-in attempts. Wait a minute, then try again.'
  return "We couldn't sign you in. Try again in a moment."
}

/**
 * Only allow redirects to paths inside this app (e.g. "/dashboard/deals").
 * Blocks "https://…", "//evil.com" and "/\evil.com", so the login page can't be used to
 * send people to another site.
 */
export function safeRedirectPath(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return undefined
  return value
}
