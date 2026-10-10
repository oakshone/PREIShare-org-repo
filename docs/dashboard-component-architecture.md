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
| Sidebar | AppShell's `<aside>` region holding the four nav links; beside Main on tablet/desktop | Sidebar |
| Mobile nav | Below 768px a "Menu" button between Header and Main opens and closes the same four links; the sidebar region is hidden | MobileNav |
| Main | Page content for the active route | Route outlet + page widgets |

AppShell is the frame that places Header, Sidebar, and Main together. The
dashboard layout route (`src/routes/dashboard/route.tsx`) renders AppShell once, and
each page renders inside Main.

### Diagram in words

**Desktop and tablet (768px and wider):**
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

**Mobile (under 768px):** everything stacks in one column, top to bottom:
Header → "Menu" button (tapping it shows the four links underneath) → Main.
The sidebar region is hidden.

## Component inventory

### AppShell
- **Responsibility:** Outer dashboard frame; places the header on top, a sidebar region (`<aside>`) and the main area below, plus a "Skip to content" link.
- **Parent:** Dashboard layout route (`src/routes/dashboard/route.tsx`).
- **Children:** Header, MobileNav (below 768px), `<aside>` with Sidebar (768px and up), main content slot (`<main id="main-content">`).
- **Props (beginner):** `children` (the page content to show in Main); `title` (text, optional — passed to Header to override the page title). Navigation isn't a prop: AppShell always renders MobileNav below 768px and Sidebar (inside its `<aside>`) from 768px up.

### Header
- **Responsibility:** Top bar showing a "P" mark and PREIshare brand line, the current page title, and a clearly marked placeholder member (not a signed-in user or session).
- **Parent:** AppShell.
- **Children:** none required.
- **Props:** `title` (text, optional — by default it looks up the current page's title in `navConfig` from the URL, falling back to "Investor Dashboard"); `actions` (optional — buttons or links shown to the left of the user placeholder; empty for now); `userLabel` (text, optional — default "Demo investor", shown with "Not signed in · sample data"). No user or session object is passed in.

### Sidebar
- **Responsibility:** The dashboard navigation: a labelled `<nav>` with a list of router links, one per `navConfig` entry, highlighting the link for the current URL (`aria-current="page"`). Laid out as a vertical list for tablet/desktop; on small screens the links wrap into a row. It renders inside AppShell's `<aside>`, so it doesn't create its own.
- **Parent:** AppShell, inside its `<aside>` (shown from 768px up).
- **Children:** router `Link` elements in a `<ul>`.
- **Props:** `children` (optional extra content under the links). Nav links are **not** a prop: they always come from `navConfig`, so there is one list to edit.

### navConfig (data, not a component)
- **Responsibility:** The single list of nav destinations: `{ label, to, title }` for Home, Portfolio, Deals, Profile (from the routing plan).
- **Used by:** Sidebar (links) and Header (page title).

### MobileNav
- **Responsibility:** Small-screen navigation: a "Menu" toggle button and a panel with the same four links as Sidebar. Tapping a link closes the panel.
- **Parent:** AppShell, which shows it only below 768px.
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
- **Props:** `items` (optional list of `{ id, timestamp, description, type? }` — `timestamp` is display text like "Mar 1, 2026", `type` is one of `distribution`, `capital_call`, `document`, `update` and shows as a small tag; defaults to built-in items marked MOCK); `title` (text, optional — default "Recent activity"); `isSampleData` (true/false, optional — default true, shows the sample-data note); `emptyMessage` (text, optional — default "No recent activity yet.", shown when `items` is an empty list).

### Planned page components (later steps)
One per child route in the routing plan; each renders only inside Main.

| Component | Responsibility | Parent | Must not |
|-----------|----------------|--------|----------|
| PortfolioTable (built) | Mock holdings table: property name, type, invested, current value, status. Props: `holdings?` (list of `{ id, propertyName, propertyType, investedAmount, currentValue, status }`; `propertyType` uses the shared `PropertyType` from `src/types`, `status` is `active`/`pending`/`exited`; defaults to built-in MOCK rows), `title?`, `isSampleData?`, `emptyMessage?`. Scrolls sideways on phones. | `/dashboard/portfolio` | Show live market or account data |
| DealsList (built) | Mock open deals as cards: name, location · asset class, target raise, minimum, status. Props: `deals?` (list of `{ id, dealName, location, propertyType, targetRaise, minimumInvestment, status }`; `propertyType` uses the shared `PropertyType`, `status` is `open`/`closing_soon`/`waitlist`; defaults to built-in MOCK deals), `title?` (default "Current offerings"), `isSampleData?`, `emptyMessage?` (default "No open deals right now."). No invest or checkout actions. | `/dashboard/deals` | Add checkout, subscription, or investment flows |
| ProfileCard (built) | Read-only mock profile card: display name, investor type tag, email, preferred contact, notes line ("No notes added yet." when empty). Props: `profile?` (`{ displayName, email, investorType, preferredContact, bio? }`; `investorType` is `individual`/`accredited`/`institutional`, `preferredContact` is `email`/`phone`; defaults to a built-in MOCK profile named "Demo investor" to match the Header), `isSampleData?`. No form, editing, or account actions. | `/dashboard/profile` | Add sign-in, password changes, or auth |

## Composition (dashboard home)
Main content on `/dashboard` (`src/routes/dashboard/index.tsx`) composes:
1. A short intro line and a page-level banner ("Demo shell — no live data is connected yet")
2. A "Key metrics" grid of 3 MetricCards (Portfolio value, Active investments, Distributions (YTD)), each showing "—" and an empty-state hint until data exists
3. PortfolioSummary (3/5 of the width on desktop) with an empty `holdings` list and its own empty message
4. RecentActivity (2/5 of the width on desktop) with an empty `items` list and its own empty message

Labels: no realistic-looking "production" numbers or names. While nothing is
connected, the page shows empty states ("—", "No portfolio holdings to show
yet…", "No recent activity yet…") plus the demo banner. If built-in MOCK lists
are shown instead (by omitting `holdings` / `items`), the widgets' `isSampleData`
notes and "(sample)" labels mark them as sample data.

## Responsive behavior
Breakpoints are Tailwind's defaults: `sm` 640px, `md` 768px, `lg` 1024px. The
whole shell is centred with a maximum width of 1080px.

| Viewport | Approx width | Nav behavior | Main content |
|----------|--------------|--------------|--------------|
| Mobile | < 768px | Sidebar hidden; a full-width "Menu" button between Header and Main shows or hides the four links. | Single column. MetricCards stack under 640px and sit 2 across from 640px. Summary and activity stack. |
| Tablet | 768px–1024px | Sidebar visible as a fixed 15rem (240px) column beside the content; links stack vertically. | 2 MetricCards across; PortfolioSummary and RecentActivity stack. |
| Desktop | > 1024px | Same sidebar column, always visible. It scrolls with the page (not sticky) this sprint. | 2 MetricCards across up to 1280px, then 3; PortfolioSummary (3/5) and RecentActivity (2/5) side by side. |

Notes for implementers:
- Touch targets on mobile controls should be easy to tap; nav links keep their padded block style (`px-3 py-2.5`).
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
