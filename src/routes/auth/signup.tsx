// Sign-up page for sponsors: email + password, using the browser Supabase client.
// Uses getSupabaseBrowserClient(), which reads only VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
// Never uses the service-role key.
//
// If the Supabase project requires email confirmation (the default), signUp returns no session:
// the page asks the sponsor to confirm their email, then sign in. If confirmation is off, it
// returns a session (stored in cookies) and the sponsor goes straight to the dashboard.
import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { getCurrentUser } from '../../lib/auth.functions'
import { getSupabaseBrowserClient } from '../../lib/supabase/client'
import { describeSignUpError, validateSignIn } from '../../lib/auth-validation'
import type { SignInFieldErrors } from '../../lib/auth-validation'

export const Route = createFileRoute('/auth/signup')({
  // Already signed in? Skip the form.
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user) throw redirect({ to: '/dashboard' })
  },
  component: SignUpPage,
})

function SignUpPage() {
  const router = useRouter()
  const ids = { email: useId(), password: useId(), formError: useId() }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    // Instant feedback; Supabase Auth makes the real check (e.g. password strength).
    const errors = validateSignIn({ email, password })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      let supabase
      try {
        supabase = getSupabaseBrowserClient()
      } catch {
        setFormError("Sign-up isn't available yet. The site isn't connected to its account service.")
        return
      }

      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
      if (error) {
        setFormError(describeSignUpError(error))
        return
      }

      if (data.session) {
        // Signed in straight away (email confirmation is off).
        await router.invalidate()
        await router.navigate({ to: '/dashboard' })
        return
      }

      // Email confirmation is on: no session until the sponsor clicks the link.
      setCheckEmail(true)
    } catch {
      setFormError("We couldn't reach the account service. Check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-(--line) bg-(--surface-strong) px-3 py-2.5 text-sm text-(--sea-ink) aria-[invalid=true]:border-(--danger)'

  return (
    <main className="page-wrap flex justify-center px-4 py-12">
      <section className="island-shell w-full max-w-md rounded-2xl p-6" aria-labelledby="signup-heading">
        <p className="island-kicker m-0">PREIshare</p>
        <h1 id="signup-heading" className="display-title m-0 mt-1 text-2xl font-bold text-(--sea-ink)">
          Sponsor sign up
        </h1>

        {checkEmail ? (
          <div role="status" className="mt-4 flex flex-col gap-3">
            <p className="m-0 text-sm text-(--sea-ink)">
              Check your email to confirm your account, then sign in.
            </p>
            <Link to="/auth/login" className="text-sm font-semibold text-(--sea-ink)">
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="m-0 mt-2 text-sm text-(--sea-ink-soft)">
              Create an account to manage your property listings.
            </p>

            {formError ? (
              <p
                id={ids.formError}
                role="alert"
                className="m-0 mt-4 rounded-xl border border-(--danger) px-3 py-2 text-sm font-semibold text-(--sea-ink)"
              >
                {formError}
              </p>
            ) : null}

            <form
              className="mt-5 flex flex-col gap-4"
              noValidate
              onSubmit={handleSubmit}
              aria-describedby={formError ? ids.formError : undefined}
            >
              <div className="flex flex-col gap-1">
                <label htmlFor={ids.email} className="text-sm font-semibold text-(--sea-ink)">
                  Email
                </label>
                <input
                  id={ids.email}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={fieldErrors.email ? true : undefined}
                  aria-describedby={fieldErrors.email ? `${ids.email}-error` : undefined}
                  className={inputClass}
                />
                {fieldErrors.email ? (
                  <p id={`${ids.email}-error`} className="m-0 text-sm text-(--danger)">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={ids.password} className="text-sm font-semibold text-(--sea-ink)">
                  Password
                </label>
                <input
                  id={ids.password}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={fieldErrors.password ? true : undefined}
                  aria-describedby={fieldErrors.password ? `${ids.password}-error` : undefined}
                  className={inputClass}
                />
                {fieldErrors.password ? (
                  <p id={`${ids.password}-error`} className="m-0 text-sm text-(--danger)">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="dash-nav-link justify-center rounded-xl bg-(--sea-ink) px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? 'Creating account…' : 'Sign up'}
              </button>
            </form>

            <p className="m-0 mt-5 text-sm text-(--sea-ink-soft)">
              Already have an account?{' '}
              <Link to="/auth/login" className="font-semibold text-(--sea-ink)">
                Sign in
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  )
}
