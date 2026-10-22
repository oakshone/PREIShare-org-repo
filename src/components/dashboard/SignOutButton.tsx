import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { getSupabaseBrowserClient } from '../../lib/supabase.browser'

/**
 * Signs out with the browser client (template), which clears the session cookies, then returns
 * to /login. Lives in the Header's actions slot. Anon key only; never the service-role key.
 */
export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  async function handleClick() {
    setPending(true)
    setFailed(false)
    try {
      const { error } = await getSupabaseBrowserClient().auth.signOut()
      if (error) {
        setFailed(true)
        return
      }
      await router.invalidate()
      await router.navigate({ to: '/login' })
    } catch {
      setFailed(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="dash-nav-link rounded-xl border border-(--line) px-3 text-sm font-semibold text-(--sea-ink) hover:bg-(--link-bg-hover) disabled:opacity-60"
      >
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
      {failed ? (
        <p role="alert" className="m-0 text-xs text-(--danger)">
          Couldn't sign out. Try again.
        </p>
      ) : null}
    </div>
  )
}
