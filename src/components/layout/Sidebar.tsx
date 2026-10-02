import type { ReactNode } from 'react'
import { NavItems } from './NavItems'

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
        <NavItems />
        {children}
      </nav>
    </aside>
  )
}
