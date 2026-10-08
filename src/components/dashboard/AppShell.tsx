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
 * Navigation: MobileNav below 768px, Sidebar from 768px up.
 */
export function AppShell({ children, title }: AppShellProps) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:m-2 focus:inline-block focus:rounded-xl focus:bg-(--chip-bg) focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-(--sea-ink)"
      >
        Skip to content
      </a>
      <div className="page-wrap flex flex-col gap-6 px-4 py-8">
        <Header title={title} />

        <div className="md:hidden">
          <MobileNav />
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <aside
            aria-label="Investor navigation"
            className="island-shell hidden w-60 shrink-0 rounded-2xl p-5 md:block"
          >
            <Sidebar />
          </aside>

          <main
            id="main-content"
            className="island-shell min-w-0 flex-1 rounded-2xl p-5 sm:p-6"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
