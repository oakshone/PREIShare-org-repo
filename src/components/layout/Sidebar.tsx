import type { ReactNode } from 'react'
import { NavItems } from './NavItems'

type SidebarProps = {
  children?: ReactNode
}

/** Nav content for AppShell's sidebar region (AppShell supplies the `<aside>`). */
export function Sidebar({ children }: SidebarProps) {
  return (
    <div>
      <p className="island-kicker m-0 mb-4">Investor dashboard</p>
      <nav aria-label="Dashboard">
        <NavItems />
        {children}
      </nav>
    </div>
  )
}
