import type { ReactNode } from 'react'

type HeaderProps = {
  title?: string
  children?: ReactNode
}

export function Header({ title = 'Investor Dashboard', children }: HeaderProps) {
  return (
    <header className="island-shell flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4">
      <h1 className="display-title m-0 text-2xl font-bold text-(--sea-ink)">
        {title}
      </h1>
      <div className="text-sm text-(--sea-ink-soft)">
        {children ?? <p className="m-0">Mock investor (demo data)</p>}
      </div>
    </header>
  )
}
