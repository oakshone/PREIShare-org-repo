import type { ReactNode } from 'react'

export type StatsCardProps = {
  label: string
  value: string
  hint?: string
  /** Optional icon or badge slot for later polish */
  icon?: ReactNode
}

/** Reusable metric tile for the investor dashboard home. */
export function StatsCard({ label, value, hint, icon }: StatsCardProps) {
  return (
    <article className="island-shell rounded-2xl p-5" aria-label={label}>
      <header className="flex items-center justify-between gap-2">
        <p className="island-kicker m-0">{label}</p>
        {icon ? <span>{icon}</span> : null}
      </header>
      <p className="display-title m-0 mt-2 text-3xl font-bold text-(--sea-ink)">
        {value}
      </p>
      {hint ? (
        <p className="m-0 mt-1 text-sm text-(--sea-ink-soft)">{hint}</p>
      ) : null}
    </article>
  )
}
