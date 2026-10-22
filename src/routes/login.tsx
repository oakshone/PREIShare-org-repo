// Sign-in page for sponsors (template: browser sign-in with the public anon key).
// Uses getSupabaseBrowserClient(), which reads only VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
// On success, Supabase stores the session in cookies, which the /dashboard guard checks on the server.
// Never uses the service-role key.
import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { getCurrentUser } from '../lib/auth.functions'
import { getSupabaseBrowserClient } from '../lib/supabase.browser'
import { describeSignInError, safeRedirectPath, validateSignIn } from '../lib/auth-validation'
import type { SignInFieldErrors } from '../lib/auth-validation'

export const Route = createFileRoute('/login')({
  // ?redirect=/dashboard/deals sends the user back where they started, but only to paths in this app.
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: safeRedirectPath(search.redirect),
  }),
  // Already signed in? Skip the form.
  beforeLoad: async ({ search }) => {
    const user = await getCurrentUser()
    if (user) throw redirect({ href: search.redirect ?? '/dashboard' })
  },
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const { redirect: redirectTo } = Route.useSearch()
  const ids = { email: useId(), password: useId(), formError: useId() }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    // Instant feedback; Supabase Auth makes the real check.
    const errors = validateSignIn({ email, password })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      let supabase
      try {
        supabase = getSupabaseBrowserClient()
      } catch {
        setFormError("Sign-in isn't available yet. The site isn't connected to its account service.")
        return
      }

      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        setFormError(describeSignInError(error))
        return
      }
      await router.invalidate()
      await router.navigate({ href: redirectTo ?? '/dashboard' })
    } catch {
      setFormError("We couldn't reach the sign-in service. Check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-(--line) bg-(--surface-strong) px-3 py-2.5 text-sm text-(--sea-ink) aria-[invalid=true]:border-(--danger)'

  return (
    <main className="page-wrap flex justify-center px-4 py-12">
      <section className="island-shell w-full max-w-md rounded-2xl p-6" aria-labelledby="login-heading">
        <p className="island-kicker m-0">PREIshare</p>
        <h1 id="login-heading" className="display-title m-0 mt-1 text-2xl font-bold text-(--sea-ink)">
          Sponsor sign in
        </h1>
        <p className="m-0 mt-2 text-sm text-(--sea-ink-soft)">
          Sign in to manage your property listings.
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
              autoComplete="current-password"
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
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
