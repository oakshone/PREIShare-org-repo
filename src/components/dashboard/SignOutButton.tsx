import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { signOut } from '../../lib/auth.functions'

/**
 * Signs out through the signOut server function (signOutSession in src/lib/auth/session.ts),
 * which revokes the session and clears the session cookies on the server, then returns to
 * /auth/login. Lives in the Header's actions slot. No Supabase client in the browser here;
 * never the service-role key.
 */
export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  async function handleClick() {
    setPending(true)
    setFailed(false)
    try {
      const result = await signOut()
      if (!result.ok) {
        setFailed(true)
        return
      }
      await router.invalidate()
      await router.navigate({ to: '/auth/login' })
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
