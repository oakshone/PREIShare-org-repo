import type { ReactNode } from 'react'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'

export type AppShellProps = {
  children: ReactNode
  /** Forwarded to Header; by default Header uses the current page's title. */
  title?: string
}

/**
 * Shared frame for all /dashboard routes: header, navigation, main slot.
 * Navigation: MobileNav on mobile and tablet, Sidebar on desktop (1024px and up).
 */
export function AppShell({ children, title }: AppShellProps) {
  return (
    <>
      <a href="#main-content" className="dash-skip-link">
        Skip to content
      </a>
      <div className="page-wrap dash-shell">
        <Header title={title} />

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
