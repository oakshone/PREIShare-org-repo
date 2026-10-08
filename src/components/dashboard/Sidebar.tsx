import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { navConfig } from '../layout/navConfig'

/** Shared link style for Sidebar and MobileNav; `aria-current="page"` marks the active link. */
export const navLinkClassName =
  'block rounded-xl px-3 py-2.5 text-sm font-semibold text-(--sea-ink-soft) no-underline transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink) aria-[current=page]:bg-(--link-bg-hover) aria-[current=page]:text-(--sea-ink)'

export type SidebarProps = {
  /** Optional extra content shown under the links. */
  children?: ReactNode
}

/**
 * Dashboard navigation for AppShell's sidebar region (AppShell supplies the `<aside>`).
 * Laid out as a vertical list for tablet/desktop; on small screens the links wrap into a row.
 * Links always come from `navConfig`, so there is one list to edit.
 */
export function Sidebar({ children }: SidebarProps) {
  return (
    <nav aria-label="Dashboard">
      <p className="island-kicker m-0 mb-4">Investor dashboard</p>
      <ul className="m-0 flex list-none flex-row flex-wrap gap-2 p-0 md:flex-col">
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
