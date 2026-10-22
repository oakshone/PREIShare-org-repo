import type { ReactNode } from 'react'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'

export type AppShellProps = {
  children: ReactNode
  /** Forwarded to Header; by default Header uses the current page's title. */
  title?: string
  /** Forwarded to Header's right-side actions slot (e.g. the sign-out button). */
  actions?: ReactNode
  /** Forwarded to Header: who is shown as the member. */
  userLabel?: string
  /** Forwarded to Header: the line under the member name. */
  statusLabel?: string
}

/**
 * Shared frame for all /dashboard routes: header, navigation, main slot.
 * Navigation: MobileNav on mobile and tablet, Sidebar on desktop (1024px and up).
 */
export function AppShell({ children, title, actions, userLabel, statusLabel }: AppShellProps) {
  return (
    <>
      <a href="#main-content" className="dash-skip-link">
        Skip to content
      </a>
      <div className="page-wrap dash-shell">
        <Header title={title} actions={actions} userLabel={userLabel} statusLabel={statusLabel} />

        <div className="dash-mobile-nav">
          <MobileNav />
        </div>

        <div className="dash-layout">
          <aside
            aria-label="Investor navigation"
            className="island-shell dash-sidebar"
          >
            <Sidebar />
          </aside>

          <main
            id="main-content"
            className="island-shell dash-main"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
