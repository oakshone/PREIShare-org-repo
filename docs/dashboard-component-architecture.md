# PREIshare Dashboard — Component Architecture & Responsive Layout Map

## Purpose
Blueprint for the investor dashboard **shell** only. Implementation agents must
follow these names, regions, and responsive rules. No real portfolio API yet—
all content is mock and labeled as sample data.

Names and file paths below match the code already in the repo
(`src/components/layout/`, `src/components/dashboard/`). Where the original
template used a different name, the project name wins: `StatsCard` (not
`MetricCard`), and shell pieces live in `src/components/layout/`.

## Sources
- docs/preishare-dashboard-requirements.md — scope, screens, layout regions, must-haves, out of scope
- docs/dashboard-routing-plan.md — URLs, route files, layout-vs-page split, nav labels

Also follow `docs/component-plan.md` (component jobs and "must not do" rules)
and the dashboard shell rules in `AGENTS.md`.

## Layout regions
| Region | Role | Typical components |
|--------|------|--------------------|
| Header | Top bar: current page title and a mock member label | Header |
| Sidebar | PREIshare branding and the four nav links; beside the content on tablet/desktop | Sidebar, NavItems |
| Mobile nav | On small screens the same Sidebar stacks above the content and its links wrap into a row | Sidebar, NavItems (no separate MobileNav this sprint) |
| Main | Page content for the active route | Route outlet + page widgets |

AppShell is the frame that places Header, Sidebar, and Main together. The
dashboard layout route (`src/routes/dashboard.tsx`) renders AppShell once, and
each page renders inside Main.

### Diagram in words

**Desktop and tablet (768px and wider):**
```text
┌──────────────────────────────────────────────────────────────┐
│ [Skip to content link — visible only when focused]           │
│ ┌────────────┐  ┌──────────────────────────────────────────┐ │
│ │ Sidebar    │  │ Header: page title · "Mock investor"     │ │
│ │ PREIshare  │  └──────────────────────────────────────────┘ │
│ │ Investor   │  ┌──────────────────────────────────────────┐ │
│ │ dashboard  │  │ Main (#main-content)                     │ │
│ │            │  │   ← the active page renders here →       │ │
│ │ • Home     │  │   Home: sample banner                    │ │
│ │ • Portfolio│  │         [Stats] [Stats] [Stats]          │ │
│ │ • Deals    │  │         [Portfolio summary][Activity]    │ │
│ │ • Profile  │  │                                          │ │
│ └────────────┘  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

In words: the sidebar is a fixed-width column on the left. To its right, the
header sits on top and the main content card fills the rest. Only the inside of
Main changes when the investor picks another page.

**Mobile (under 768px):** everything stacks in one column, top to bottom:
Sidebar (brand, then the four links in a wrapping row) → Header → Main.

## Component inventory

### AppShell
- **Responsibility:** Outer dashboard frame; arranges the sidebar, header, and main area, plus a "Skip to content" link.
- **Parent:** Dashboard layout route (`src/routes/dashboard.tsx`).
- **Children:** Sidebar, Header, main content slot (`<main id="main-content">`).
- **Props (beginner):** `children` (the page content to show in Main); `title` (text, optional — passed to Header to override the page title).

### Header
- **Responsibility:** Top bar showing the current page title and a mock member placeholder.
- **Parent:** AppShell.
- **Children:** none required.
- **Props:** `title` (text, optional — by default it looks up the current page's title in `navConfig` from the URL, falling back to "Investor Dashboard"); `children` (optional — replaces the "Mock investor (demo data)" label).

### Sidebar
- **Responsibility:** PREIshare branding and the dashboard navigation, inside a labelled `<aside>` and `<nav>`.
- **Parent:** AppShell.
- **Children:** NavItems.
- **Props:** `brandLabel` (text, optional — default "PREIshare"); `children` (optional extra content under the links). Nav links are **not** a prop: they always come from `navConfig`, so there is one list to edit.

### NavItems
- **Responsibility:** Renders one link per `navConfig` entry and highlights the link that matches the current URL.
- **Parent:** Sidebar.
- **Children:** router `Link` elements.
- **Props:** none. Reads `navConfig` directly; the router supplies the "current page" highlight.

### navConfig (data, not a component)
- **Responsibility:** The single list of nav destinations: `{ label, to, title }` for Home, Portfolio, Deals, Profile (from the routing plan).
- **Used by:** NavItems (links) and Header (page title).

### MobileNav
- **Not built this sprint.** Decision: on small screens the Sidebar stacks above the content instead of opening as a drawer. This meets the requirement that nav "collapses or stacks" without adding open/close state. If a drawer is wanted later, add it as a new component with the same destinations from `navConfig`, with its open state kept in AppShell.

### StatsCard
- **Responsibility:** One reusable metric tile (label + value + optional hint). Only displays what it's given.
- **Parent:** Dashboard home (`src/routes/dashboard/index.tsx`).
- **Props:** `label` (text), `value` (text, e.g. "$300,000"), `hint` (text, optional — use it to mark the value as sample, e.g. "Sample total"), `icon` (optional small icon or badge).

### PortfolioSummary
- **Responsibility:** Short snapshot of total value and a few sample holdings. A preview, not the full Portfolio page.
- **Parent:** Dashboard home.
- **Props:** `totalLabel` (text, required — the total to show); `holdings` (optional list of `{ id, name, allocationLabel, valueLabel }` — defaults to built-in sample holdings); `title` (text, optional — default "Portfolio summary"); `isSampleData` (true/false, optional — default true, shows the sample-data note).

### RecentActivity
- **Responsibility:** Short list of sample activity events for the investor.
- **Parent:** Dashboard home.
- **Props:** `items` (optional list of `{ id, title, detail, dateLabel }` — defaults to built-in sample events); `title` (text, optional — default "Recent activity"); `isSampleData` (true/false, optional — default true, shows the sample-data note).

### Planned page components (later steps)
One per child route in the routing plan; each renders only inside Main.

| Component | Responsibility | Parent | Must not |
|-----------|----------------|--------|----------|
| PortfolioTable | Mock holdings as a table or list that works on a phone | `/dashboard/portfolio` | Show live market or account data |
| DealsList | Mock open or featured deals as rows or cards | `/dashboard/deals` | Add checkout, subscription, or investment flows |
| ProfileCard | Mock member name, contact placeholders, preferences | `/dashboard/profile` | Add sign-in, password changes, or auth |

## Composition (dashboard home)
Main content on `/dashboard` composes:
1. A page-level sample banner ("Demo shell — all figures are placeholders")
2. Row/grid of StatsCard (3 placeholders: total portfolio value, open deals, contributions YTD)
3. PortfolioSummary
4. RecentActivity

Sample labels: every widget must make clear its content is sample data — the
page banner, plus a sample hint on each StatsCard and the `isSampleData` note on
PortfolioSummary and RecentActivity. No realistic-looking "production" numbers
or names.

## Responsive behavior
Breakpoints are Tailwind's defaults: `sm` 640px, `md` 768px, `lg` 1024px. The
whole shell is centred with a maximum width of 1080px.

| Viewport | Approx width | Nav behavior | Main content |
|----------|--------------|--------------|--------------|
| Mobile | < 768px | Sidebar full width above Header and Main; links wrap into a row. No drawer. | Single column. StatsCards stack under 640px and sit 3 across from 640px. Summary and activity stack. |
| Tablet | 768px–1024px | Sidebar visible as a fixed 15rem (240px) column beside the content; links stack vertically. | 3 StatsCards across; PortfolioSummary and RecentActivity stack. |
| Desktop | > 1024px | Same sidebar column, always visible. It scrolls with the page (not sticky) this sprint. | 3 StatsCards across; PortfolioSummary and RecentActivity side by side. |

Notes for implementers:
- Touch targets on mobile controls should be easy to tap; nav links keep their padded block style (`px-3 py-2.5`).
- Main content must remain scrollable; header should not crowd out content. The page scrolls as a whole; don't trap content in a fixed-height box.
- Do not rely on hover-only actions for anything required on mobile. The active link is shown by `aria-current`, not hover.
- Keep the shell's `gap-6` spacing and the padded Main card so content never sits against the frame.
- `src/routes/__root.tsx` also renders the starter site header and footer on dashboard pages. Resolve this before adding more chrome (routing plan, Open question 1).

## File targets (for later steps—do not create all here)
Already exist (edit, don't recreate):
- src/components/layout/AppShell.tsx
- src/components/layout/Header.tsx
- src/components/layout/Sidebar.tsx
- src/components/layout/NavItems.tsx
- src/components/layout/navConfig.ts
- src/components/dashboard/StatsCard.tsx
- src/components/dashboard/PortfolioSummary.tsx
- src/components/dashboard/RecentActivity.tsx

To create in later steps:
- src/components/dashboard/PortfolioTable.tsx
- src/components/dashboard/DealsList.tsx
- src/components/dashboard/ProfileCard.tsx

Do not create `MobileNav.tsx` or `MetricCard.tsx`, or move the shell into
`src/components/dashboard/`. That would duplicate components that already exist.

## Out of scope (prevent scope creep)
- Real Supabase/PostgreSQL data fetching, loaders, server functions, or API routes
- Sign-in, sign-up, authentication, roles, or permissions
- Payments, subscriptions, checkout or investment flows, document vaults, e-sign
- Admin or sponsor tools
- Charts libraries, map views, PDF export
- Additional routes beyond the four in the routing plan (Home, Portfolio, Deals, Profile)
- Design-system package extraction or animation-heavy UI
- Editing portfolio holdings or any form that changes data
- New npm packages of any kind

## Success criteria for this blueprint
- Every named component has one clear responsibility.
- Props are listed in plain language (no unexplained advanced patterns).
- Mobile / tablet / desktop nav behavior is explicit.
- Widget list matches investor dashboard home needs from requirements.
- Out-of-scope section blocks accidental mega-features.
