import type { ReactNode } from 'react'
import { Header } from './Header'

export type AppShellProps = {
  children: ReactNode
  /** Forwarded to Header; by default Header uses the current page's title. */
  title?: string
  /** Sidebar slot; the dashboard layout route passes the real Sidebar here. */
  sidebar?: ReactNode
}

/**
 * Shared frame for all /dashboard routes: header, sidebar region, main slot.
 */
export function AppShell({ children, title, sidebar }: AppShellProps) {
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

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <aside
            aria-label="Investor navigation"
            className="island-shell w-full shrink-0 rounded-2xl p-5 md:w-60"
          >
            {sidebar ?? (
              <p className="m-0 text-sm text-(--sea-ink-soft)">
                Navigation coming soon
              </p>
            )}
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
