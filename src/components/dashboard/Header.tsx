import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { navConfig } from '../layout/navConfig'

export type HeaderProps = {
  /** Overrides the page title looked up from the current URL. */
  title?: string
  /** Optional right-side actions (keep empty for now if unused). */
  actions?: ReactNode
  /** Display text for the placeholder member; not a signed-in user. */
  userLabel?: string
}

/**
 * Top chrome for the PREIshare investor dashboard.
 * Shows branding + a demo user placeholder only — not real auth state.
 */
export function Header({
  title,
  actions,
  userLabel = 'Demo investor',
}: HeaderProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const current = navConfig.find(
    (item) => item.to === (pathname.replace(/\/+$/, '') || '/'),
  )

  return (
    <header className="island-shell flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--sea-ink) text-sm font-bold text-white"
        >
          P
        </span>
        <div className="min-w-0">
          <p className="island-kicker m-0">PREIshare</p>
          <h1 className="display-title m-0 mt-1 text-2xl font-bold text-(--sea-ink)">
            {title ?? current?.title ?? 'Investor Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}
        {/* Placeholder only — replace with real session UI in a later auth topic */}
        <div
          className="flex items-center gap-2"
          aria-label="Demo user placeholder"
          role="group"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-(--line) bg-(--chip-bg) text-sm font-bold text-(--sea-ink-soft)"
          >
            ?
          </span>
          <div className="text-sm">
            <p className="m-0 font-semibold text-(--sea-ink)">{userLabel}</p>
            <p className="m-0 text-xs text-(--sea-ink-soft)">
              Not signed in · sample data
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
