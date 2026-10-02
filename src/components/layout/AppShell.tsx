import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

type AppShellProps = {
  title?: string
  children: ReactNode
}

/** Child dashboard routes render inside `children`. */
export function AppShell({
  title = 'Investor Dashboard',
  children,
}: AppShellProps) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:m-2 focus:inline-block focus:rounded-xl focus:bg-(--chip-bg) focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-(--sea-ink)"
      >
        Skip to content
      </a>
      <div className="page-wrap flex flex-col gap-6 px-4 py-8 md:flex-row md:items-start">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Header title={title} />
          <main
            id="main-content"
            className="island-shell min-w-0 rounded-2xl p-5 sm:p-6"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
