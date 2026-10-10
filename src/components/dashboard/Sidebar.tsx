import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { navConfig } from '../layout/navConfig'

/** Shared link style for Sidebar and MobileNav; `aria-current="page"` marks the active link. */
export const navLinkClassName =
  'dash-nav-link rounded-xl px-3 py-2.5 text-sm font-semibold text-(--sea-ink-soft) no-underline transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink) aria-[current=page]:bg-(--link-bg-hover) aria-[current=page]:text-(--sea-ink)'

export type SidebarProps = {
  /** Optional extra content shown under the links. */
  children?: ReactNode
}

/**
 * Dashboard navigation for AppShell's sidebar region (AppShell supplies the `<aside>`).
 * Desktop only (AppShell shows it at 1024px and up); MobileNav covers smaller screens.
 * Links always come from `navConfig`, so there is one list to edit.
 */
export function Sidebar({ children }: SidebarProps) {
  return (
    <nav aria-label="Dashboard">
      <p className="island-kicker m-0 mb-4">Investor dashboard</p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {navConfig.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              activeOptions={{ exact: true }}
              className={navLinkClassName}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      {children}
    </nav>
  )
}
