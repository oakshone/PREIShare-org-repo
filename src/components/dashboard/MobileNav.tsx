import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { navConfig } from '../layout/navConfig'
import { navLinkClassName } from './Sidebar'

/**
 * Small-screen dashboard navigation: a menu button that shows or hides
 * the same links as Sidebar. AppShell shows it on mobile and tablet (below 1024px).
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-dashboard-nav"
        aria-label={open ? 'Close dashboard menu' : 'Open dashboard menu'}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="island-shell flex w-full items-center justify-between rounded-2xl px-5 py-3 text-sm font-semibold text-(--sea-ink)"
      >
        <span>Menu</span>
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
      </button>

      <nav
        id="mobile-dashboard-nav"
        hidden={!open}
        aria-label="Dashboard"
        className="island-shell mt-2 rounded-2xl p-3"
      >
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {navConfig.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: true }}
                onClick={() => setOpen(false)}
                className={navLinkClassName}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
