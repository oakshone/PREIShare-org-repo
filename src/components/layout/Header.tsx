import { useRouterState } from '@tanstack/react-router'
import { navConfig } from './navConfig'

type HeaderProps = {
  /** Brand line shown above the title. */
  brandLabel?: string
  /** Overrides the page title looked up from the current URL. */
  title?: string
  /** Display text for the placeholder member; not a signed-in user. */
  userLabel?: string
}

export function Header({
  brandLabel = 'PREIshare',
  title,
  userLabel = 'Demo investor',
}: HeaderProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const current = navConfig.find(
    (item) => item.to === (pathname.replace(/\/+$/, '') || '/'),
  )

  return (
    <header className="island-shell flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4">
      <div>
        <p className="island-kicker m-0">{brandLabel}</p>
        <h1 className="display-title m-0 mt-1 text-2xl font-bold text-(--sea-ink)">
          {title ?? current?.title ?? 'Investor Dashboard'}
        </h1>
      </div>
      <div className="flex items-center gap-3">
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
    </header>
  )
}
