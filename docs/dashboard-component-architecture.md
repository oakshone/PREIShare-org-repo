# PREIshare Dashboard — Component Architecture & Responsive Layout Map

## Purpose
Blueprint for the investor dashboard **shell** only. Implementation agents must
follow these names, regions, and responsive rules. No real portfolio API yet—
all content is mock and labeled as sample data.

Names and file paths below match the code already in the repo
(`src/components/layout/`, `src/components/dashboard/`). Where the original
template used a different name, the project name wins. `AppShell`, `Header`, and `Sidebar` live in
`src/components/dashboard/`; the shared `navConfig` lives in `src/components/layout/`.

## Sources
- docs/preishare-dashboard-requirements.md — scope, screens, layout regions, must-haves, out of scope
- docs/dashboard-routing-plan.md — URLs, route files, layout-vs-page split, nav labels

Also follow `docs/component-plan.md` (component jobs and "must not do" rules)
and the dashboard shell rules in `AGENTS.md`.

## Layout regions
| Region | Role | Typical components |
|--------|------|--------------------|
| Header | Full-width top bar: PREIshare brand, current page title, demo user placeholder | Header |
| Sidebar | AppShell's `<aside>` region holding the four nav links; beside Main on desktop (1024px and up) | Sidebar |
| Mobile nav | On mobile and tablet (below 1024px) a "Menu" button between Header and Main opens and closes the same four links; the sidebar region is hidden | MobileNav |
| Main | Page content for the active route | Route outlet + page widgets |

AppShell is the frame that places Header, Sidebar, and Main together. The
dashboard layout route (`src/routes/dashboard/route.tsx`) renders AppShell once, and
each page renders inside Main.

### Diagram in words

**Desktop (1024px and wider):**
```text
┌──────────────────────────────────────────────────────────────┐
│ [Skip to content link — visible only when focused]           │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [P] PREIshare               [?] Demo investor            │ │
│ │     Page title (h1)             Not signed in · sample   │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌────────────┐  ┌──────────────────────────────────────────┐ │
│ │ Sidebar    │  │ Main (#main-content)                     │ │
│ │ Investor   │  │   ← the active page renders here →       │ │
│ │ dashboard  │  │   Home: sample banner                    │ │
│ │ • Home     │  │         [Stats] [Stats] [Stats]          │ │
│ │ • Portfolio│  │         [Portfolio summary][Activity]    │ │
│ │ • Deals    │  │                                          │ │
│ │ • Profile  │  │                                          │ │
│ └────────────┘  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

In words: the header runs across the top. Below it, the sidebar is a
fixed-width column on the left and the main content card fills the rest. Only
the inside of Main changes when the investor picks another page.

**Mobile and tablet (under 1024px):** the shell stacks in one column, top to bottom:
Header → "Menu" button (tapping it shows the four links underneath) → Main.
The sidebar region is hidden.

## Component inventory

### AppShell
- **Responsibility:** Outer dashboard frame; places the header on top, a sidebar region (`<aside>`) and the main area below, plus a "Skip to content" link.
- **Parent:** Dashboard layout route (`src/routes/dashboard/route.tsx`).
- **Children:** Header, MobileNav (below 1024px), `<aside>` with Sidebar (1024px and up), main content slot (`<main id="main-content">`).
- **Props (beginner):** `children` (the page content to show in Main); `title` (text, optional — passed to Header to override the page title). Navigation isn't a prop: AppShell always renders MobileNav below 1024px and Sidebar (inside its `<aside>`) from 1024px up.

### Header
- **Responsibility:** Top bar showing a "P" mark and PREIshare brand line, the current page title, and a clearly marked placeholder member (not a signed-in user or session).
- **Parent:** AppShell.
- **Children:** none required.
- **Props:** `title` (text, optional — by default it looks up the current page's title in `navConfig` from the URL, falling back to "Investor Dashboard"); `actions` (optional — buttons or links shown to the left of the user placeholder; empty for now); `userLabel` (text, optional — default "Demo investor", shown with "Not signed in · sample data"). No user or session object is passed in.

### Sidebar
- **Responsibility:** The dashboard navigation: a labelled `<nav>` with a list of router links, one per `navConfig` entry, highlighting the link for the current URL (`aria-current="page"`). A vertical list, shown on desktop only; MobileNav covers mobile and tablet. It renders inside AppShell's `<aside>`, so it doesn't create its own.
- **Parent:** AppShell, inside its `<aside>` (shown from 1024px up).
- **Children:** router `Link` elements in a `<ul>`.
- **Props:** `children` (optional extra content under the links). Nav links are **not** a prop: they always come from `navConfig`, so there is one list to edit.

### navConfig (data, not a component)
- **Responsibility:** The single list of nav destinations: `{ label, to, title }` for Home, Portfolio, Deals, Profile (from the routing plan).
- **Used by:** Sidebar (links) and Header (page title).

### MobileNav
- **Responsibility:** Small-screen navigation: a "Menu" toggle button and a panel with the same four links as Sidebar. Tapping a link closes the panel.
- **Parent:** AppShell, which shows it on mobile and tablet (below 1024px).
- **Children:** a `<button>` and a labelled `<nav>` with router `Link` elements.
- **Props:** none. Open/closed is a single `useState(false)` inside MobileNav. The button has an accessible label ("Open dashboard menu" / "Close dashboard menu"), `aria-expanded`, and `aria-controls` pointing at the panel, which is hidden with the `hidden` attribute while closed. Links come from `navConfig` and share Sidebar's link style (`navLinkClassName`). No animation library.

### MetricCard
- **Responsibility:** One reusable metric tile (label + value + optional helper/change line). Presentational only: displays what it's given, never fetches or calculates.
- **Parent:** Dashboard home (`src/routes/dashboard/index.tsx`).
- **Props:** `label` (text), `value` (text, e.g. "$300,000"), `hint` (text, optional — a helper or change line under the value; on Home it marks the value as sample, e.g. "Sample total"), `icon` (optional small icon or badge).

### PortfolioSummary
- **Responsibility:** Short snapshot of total value and a few sample holdings. A preview, not the full Portfolio page.
- **Parent:** Dashboard home.
- **Props:** `totalLabel` (text, optional — the total to show; "—" when omitted); `holdings` (optional list of `{ id, name, allocationLabel, valueLabel }` — defaults to built-in sample holdings); `title` (text, optional — default "Portfolio summary"); `isSampleData` (true/false, optional — default true, shows the sample-data note); `emptyMessage` (text, optional — default "No holdings to show yet.", shown when `holdings` is an empty list). Presentational only: never fetches data.

### RecentActivity
- **Responsibility:** Short list of sample activity events for the investor. Presentational only: never fetches data.
- **Parent:** Dashboard home.
- **Props:** `items` (optional list of `{ id, timestamp, description, type? }` — `timestamp` is display text like "Oct 1, 2026", `type` is one of `distribution`, `capital_call`, `document`, `update` and shows as a small tag; defaults to built-in items marked MOCK); `title` (text, optional — default "Recent activity"); `isSampleData` (true/false, optional — default true, shows the sample-data note); `emptyMessage` (text, optional — default "No recent activity yet.", shown when `items` is an empty list).

### Planned page components (later steps)
One per child route in the routing plan; each renders only inside Main.

| Component | Responsibility | Parent | Must not |
|-----------|----------------|--------|----------|
| PortfolioTable (built) | Mock holdings table: property name, type, invested, current value, status. Props: `holdings?` (list of `{ id, propertyName, propertyType, investedAmount, currentValue, status }`; `propertyType` uses the shared `PropertyType` from `src/types`, `status` is `active`/`pending`/`exited`; defaults to built-in MOCK rows), `title?`, `isSampleData?`, `emptyMessage?`. Mobile: one stacked card per holding; tablet and up: full table. | `/dashboard/portfolio` | Show live market or account data |
| DealsList (built) | Mock open deals as cards: name, location · asset class, target raise, minimum, status. Props: `deals?` (list of `{ id, dealName, location, propertyType, targetRaise, minimumInvestment, status }`; `propertyType` uses the shared `PropertyType`, `status` is `open`/`closing_soon`/`waitlist`; defaults to built-in MOCK deals), `title?` (default "Current offerings"), `isSampleData?`, `emptyMessage?` (default "No open deals right now."). No invest or checkout actions. | `/dashboard/deals` | Add checkout, subscription, or investment flows |
| ProfileCard (built) | Read-only mock profile card: display name, investor type tag, email, preferred contact, notes line ("No notes added yet." when empty). Props: `profile?` (`{ displayName, email, investorType, preferredContact, bio? }`; `investorType` is `individual`/`accredited`/`institutional`, `preferredContact` is `email`/`phone`; defaults to a built-in MOCK profile named "Demo investor" to match the Header), `isSampleData?`. No form, editing, or account actions. | `/dashboard/profile` | Add sign-in, password changes, or auth |

## Composition (dashboard home)
Main content on `/dashboard` (`src/routes/dashboard/index.tsx`) composes:
1. A short intro line and a page-level banner ("Demo shell — sample figures only, no live data is connected yet")
2. A "Key metrics" grid of 3 MetricCards: Portfolio value "$300,000", Active investments "2", Distributions (YTD) "$6,400", each with a "Sample · …" hint
3. PortfolioSummary (3/5 of the width on desktop) with its built-in MOCK holdings and `totalLabel="$300,000"`
4. RecentActivity (2/5 of the width on desktop) with its built-in MOCK activity

Labels: every figure reads as an investor-facing placeholder: believable
amounts, names starting with "Sample", and a "Sample" hint or note on each
widget. The mock data is consistent across pages: Home's metrics and summary
use the same three holdings as the Portfolio page ($265,000 invested, $300,000
current value, 2 active + 1 pending), and the $6,400 YTD distributions are two
$3,200 quarterly payouts like the one in Recent activity. Each widget's
`emptyMessage` stays in place and shows if its list is ever empty.

## Responsive behavior
Three tiers, mobile-first. The breakpoints are defined in `src/styles.css`
(`@theme`). The dashboard's layout and accessibility rules live in
`src/styles/dashboard.css`, which `src/styles.css` imports, so it shares the
same colour tokens.

| Tier | Width | Tailwind prefix |
|------|-------|-----------------|
| Mobile | 320px and up | none (base styles) |
| Tablet | 768px and up | `md:` |
| Desktop | 1024px and up | `lg:` |

Dashboard code uses only these three; don't add `sm:` (640px) or `xl:` (1280px).
The whole shell is centred with a maximum width of 1080px.

Layout classes in `src/styles/dashboard.css` (plain CSS, in Tailwind's
components layer, so a utility class on the same element still wins):

| Class | Used in | Does |
|-------|---------|------|
| `dash-shell`, `dash-layout`, `dash-main` | AppShell | Page spacing; sidebar and main side by side from 1024px |
| `dash-sidebar`, `dash-mobile-nav` | AppShell | Sidebar shown on desktop only; Menu shown below 1024px |
| `dash-header` | Header | Brand left, demo user right; wraps on small screens |
| `dash-nav-link` | Sidebar, MobileNav (`navLinkClassName`) | 44px-tall links; bar on the current page's link |
| `dash-grid-metrics` | Home | Metric cards: 1 column, 3 across from 768px |
| `dash-grid-split` | Home | PortfolioSummary + RecentActivity: stacked, 3/5 + 2/5 from 1024px |
| `dash-grid-cards` | DealsList | Deal cards: 1 column, 2 across from 768px |
| `dash-skip-link` | AppShell | "Skip to content", shown when focused |

Smaller layouts inside a widget (for example the `dl` grids in cards) still
use Tailwind classes in the component.

| Viewport | Approx width | Nav behavior | Main content |
|----------|--------------|--------------|--------------|
| Mobile | 320–767px | Sidebar hidden; a full-width "Menu" button between Header and Main shows or hides the four links. | Single column. MetricCards stack; deal cards stack with the status badge on its own line; PortfolioTable shows one card per holding; profile details stack. |
| Tablet | 768–1023px | Same "Menu" button; sidebar still hidden, so content gets the full width. | 3 MetricCards across; 2 deal cards across; PortfolioTable as a full table; profile details in 2 columns; PortfolioSummary and RecentActivity stack. |
| Desktop | 1024px and up | Sidebar visible as a fixed 15rem (240px) column beside the content; "Menu" button hidden. It scrolls with the page (not sticky) this sprint. | Same as tablet, plus PortfolioSummary (3/5) and RecentActivity (2/5) side by side. |

Notes for implementers:
- Touch targets on mobile controls should be easy to tap; nav links are at least 44px tall (`dash-nav-link`).
- Accessibility rules in `src/styles/dashboard.css`: a visible keyboard focus ring on every dashboard link and button; the current page's link has a bar on its left edge, not just a colour change; animations and transitions turn off when the system asks for reduced motion; focus and current page stay visible in Windows high-contrast mode.
- Main content must remain scrollable; header should not crowd out content. The page scrolls as a whole; don't trap content in a fixed-height box.
- Do not rely on hover-only actions for anything required on mobile. The active link is shown by `aria-current`, not hover.
- Keep the shell's `gap-6` spacing and the padded Main card so content never sits against the frame.
- `src/routes/__root.tsx` also renders the starter site header and footer on dashboard pages. Resolve this before adding more chrome (routing plan, Open question 1).

## File targets (for later steps—do not create all here)
Already exist (edit, don't recreate):
- src/components/dashboard/AppShell.tsx
- src/components/dashboard/Header.tsx
- src/components/dashboard/Sidebar.tsx
- src/components/dashboard/MobileNav.tsx
- src/components/layout/navConfig.ts
- src/components/dashboard/MetricCard.tsx
- src/components/dashboard/PortfolioSummary.tsx
- src/components/dashboard/RecentActivity.tsx
- src/components/dashboard/PortfolioTable.tsx
- src/components/dashboard/DealsList.tsx
- src/components/dashboard/ProfileCard.tsx

To create in later steps: none — all planned dashboard components now exist.

Do not create `StatsCard.tsx` (renamed to `MetricCard.tsx`), a second `MobileNav`, or a second `AppShell`,
`Header`, `Sidebar`, or `NavItems` under `src/components/layout/`. That would duplicate components that
already exist.

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
