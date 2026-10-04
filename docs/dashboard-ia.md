# PREIshare Investor Dashboard — Information Architecture

## Purpose

This document describes the proposed information architecture for the Sprint 3
investor dashboard shell. It is a plan, not a report of implemented pages. The
current app still has the starter `/` and `/about` routes; none of the dashboard
routes or components below are implemented yet.

The planned shell uses mock data only. It does not include authentication, admin
tools, or live API contracts.

## URL map and page purposes

| URL path | Route name | Nav label | Page purpose | Primary content |
|----------|------------|-----------|--------------|-----------------|
| `/dashboard` | Dashboard home | Home | Quick scan of portfolio value and activity | Mock stats, portfolio summary, recent activity |
| `/dashboard/portfolio` | Portfolio | Portfolio | Review holdings at a glance | Portfolio table or list with mock rows |
| `/dashboard/deals` | Deals | Deals | See open or featured deals | Mock deal list |
| `/dashboard/profile` | Profile | Profile | View member profile details | Mock profile card with name and contact placeholders |

These paths and contents are planned for the shell; they are not current routes.

## Navigation rules

- Planned shared chrome: left sidebar on desktop, top header, and a main content
	region beside or below the navigation.
- The active navigation item should match the current URL path.
- Keep labels short and investor-friendly: Home, Portfolio, Deals, Profile.
- Nest all four planned pages under `/dashboard` so a parent layout can wrap
	them.
- On narrow screens, navigation should collapse or stack without overlapping
	page content.

## Out of scope for this shell

- Sign-in or sign-up pages
- Live Supabase queries
- Admin or sponsor tools
- Payments or document vaults

## Notes for later route files

- Planned parent layout file: `src/routes/dashboard/route.tsx` (dashboard layout)
- Planned child route files:
  - `src/routes/dashboard.index.tsx` → `/dashboard` (Home)
  - `src/routes/dashboard.portfolio.tsx` → `/dashboard/portfolio`
  - `src/routes/dashboard.deals.tsx` → `/dashboard/deals`
  - `src/routes/dashboard.profile.tsx` → `/dashboard/profile`
- Route files have not been created. When implementation begins, use TanStack
	Start's file-based routing to generate these nested URLs. Regenerate generated
	route definitions through the project script rather than editing generated
	files by hand.

## Planned component responsibilities

The names and responsibilities below are implementation guidance only. These
dashboard components do not exist in the current app yet.

### Layout components (shared chrome)

| Component | Responsibility | Used on | Must NOT do |
|-----------|----------------|---------|-------------|
| `AppShell` | Planned frame combining Sidebar, Header, and the page content area | All planned `/dashboard/*` pages | Own page-specific widgets or fetch data |
| `Sidebar` | Planned branding and primary navigation on larger screens | `AppShell` | Duplicate page-title logic or hardcode deal rows |
| `Header` | Planned top bar with page title and a simple placeholder area | `AppShell` | Define a second copy of the navigation list |
| `NavItems` / `navConfig` | Planned single source for navigation labels and paths | Sidebar and any future mobile navigation | Render stats or tables |

### Dashboard home widgets

| Component | Responsibility | Used on | Must NOT do |
|-----------|----------------|---------|-------------|
| `StatsCard` | Planned display of one metric label and value, with an optional hint | Dashboard home; reusable elsewhere if needed | Fetch data or own page layout |
| `PortfolioSummary` | Planned short snapshot of portfolio value or allocation | Dashboard home | Replace the full Portfolio page |
| `RecentActivity` | Planned simple list of recent mock events | Dashboard home | Own global navigation |

### Page-level content

| Component | Responsibility | Used on | Must NOT do |
|-----------|----------------|---------|-------------|
| `PortfolioTable` | Planned table of mock holdings | Portfolio page | Show live market data |
| `DealsList` | Planned list of mock open deals | Deals page | Add checkout or subscription flows |
| `ProfileCard` | Planned mock member name, contact, and preferences | Profile page | Add password changes or authentication |

### Composition rules

1. Give each component one job; combine or remove overlapping responsibilities.
2. Layout components wrap pages; page content does not rebuild the shared shell.
3. Use clearly labeled mock data only; live Supabase data is out of scope.
4. Keep these names stable in future prompts, or update this plan when names
	 change.

### Page-to-component map

- Home → `StatsCard`, `PortfolioSummary`, and `RecentActivity` inside `AppShell`
- Portfolio → `PortfolioTable` inside `AppShell`
- Deals → `DealsList` inside `AppShell`
- Profile → `ProfileCard` inside `AppShell`