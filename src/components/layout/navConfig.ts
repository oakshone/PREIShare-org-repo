import type { FileRouteTypes } from '../../routeTree.gen'

export type NavItem = {
  label: string
  to: FileRouteTypes['to']
  title: string
}

export const navConfig = [
  { label: 'Home', to: '/dashboard', title: 'Home overview' },
  { label: 'Portfolio', to: '/dashboard/portfolio', title: 'Portfolio' },
  { label: 'Deals', to: '/dashboard/deals', title: 'Open deals' },
  { label: 'Profile', to: '/dashboard/profile', title: 'Profile' },
] as const satisfies readonly NavItem[]
