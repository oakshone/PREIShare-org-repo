import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

export const navConfig = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Portfolio', to: '/dashboard/portfolio' },
  { label: 'Deals', to: '/dashboard/deals' },
  { label: 'Profile', to: '/dashboard/profile' },
] as const

type SidebarProps = {
  brandLabel?: string
  children?: ReactNode
}

export function Sidebar({ brandLabel = 'PREIshare', children }: SidebarProps) {
  return (
    <aside
      aria-label="Investor navigation"
      className="island-shell w-full shrink-0 rounded-2xl p-5 md:w-60"
    >
      <div className="mb-4">
        <p className="display-title m-0 text-xl font-bold text-(--sea-ink)">
          {brandLabel}
        </p>
        <p className="island-kicker m-0 mt-1">Investor dashboard</p>
      </div>
      <nav aria-label="Dashboard">
        <ul className="m-0 flex list-none flex-row flex-wrap gap-2 p-0 md:flex-col">
          {navConfig.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: true }}
                className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-(--sea-ink-soft) no-underline transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink) aria-[current=page]:bg-(--link-bg-hover) aria-[current=page]:text-(--sea-ink)"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        {children}
      </nav>
    </aside>
  )
}
