import { Link } from '@tanstack/react-router'
import { navConfig } from './navConfig'

export function NavItems() {
  return (
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
  )
}
