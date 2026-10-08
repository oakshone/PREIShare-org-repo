# PREIshare Investor Dashboard - Component Inventory

## Scope

This is a plan for the dashboard shell, not a list of components already built.
All content is mock data only; components must not call live APIs or Supabase.
The four planned pages are Home, Portfolio, Deals, and Profile, as mapped in
[`dashboard-ia.md`](dashboard-ia.md).

## Shared layout and navigation

| Component | Responsibility | Used on | Must NOT do |
| --- | --- | --- | --- |
| `AppShell` | Combines the shared sidebar, header, and main content area for dashboard pages. | All four dashboard pages | Fetch data or own page-specific widgets. |
| `Sidebar` | Shows PREIshare branding and the primary navigation on larger screens. | Shared `AppShell` | Duplicate page-title logic or render deal rows. |
| `Header` | Shows the current page title and a simple mock member/placeholder area. | Shared `AppShell` | Define a second copy of the navigation links. |
| `NavItems` / `navConfig` | Provides one shared set of navigation labels and paths for Home, Portfolio, Deals, and Profile. | Sidebar and any future compact navigation | Render page content, stats, or tables. |

## Home content

| Component | Responsibility | Used on | Must NOT do |
| --- | --- | --- | --- |
| `MetricCard` | Displays one mock metric with a label, value, and optional hint. | Home | Fetch or calculate live portfolio data, or arrange the whole page. |
| `PortfolioSummary` | Shows a brief mock snapshot of portfolio value or allocation. | Home | Replace or duplicate the full holdings view on Portfolio. |
| `RecentActivity` | Lists a small set of clearly labeled mock activity items. | Home | Represent live account history or own global navigation. |

## Page content

| Component | Responsibility | Used on | Must NOT do |
| --- | --- | --- | --- |
| `PortfolioTable` | Displays mock holdings in a table or list that is usable on small screens. | Portfolio | Show live market or account data. |
| `DealsList` | Displays mock open or featured deals as a list of rows or cards. | Deals | Add checkout, subscription, or investment flows. |
| `ProfileCard` | Displays mock member name, contact placeholders, and preferences. | Profile | Implement sign-in, password changes, or authentication. |

## Composition rules

1. Give each component one responsibility; avoid duplicating layout or data presentation.
2. `AppShell` wraps page content; page components do not rebuild the shared shell.
3. Label placeholder content as mock so it cannot be mistaken for live member data.
4. Keep the names aligned with `docs/dashboard-ia.md`; update both documents if the plan changes.
