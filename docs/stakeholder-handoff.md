# PREIshare Investor Dashboard — Stakeholder Handoff

**Sprint focus:** Responsive investor dashboard shell (TanStack Start routes + React UI)
**Audience:** PREIshare product stakeholders and the next implementation topic owners
**Date:** 2026-10-10
**Prepared by:** Jackson Nieporte

## 1. Demo today (what investors can click)

- Visit `/dashboard` to open the investor home base inside the app shell. Portfolio (`/dashboard/portfolio`), Deals (`/dashboard/deals`), and Profile (`/dashboard/profile`) open inside the same shell.
- **Desktop (1024px and wider):** persistent sidebar navigation (Home, Portfolio, Deals, Profile, with the current page highlighted), plus a header showing the PREIshare brand, the current page title, and a demo member placeholder ("Demo investor — Not signed in · sample data"). The header has an actions region that is empty for now.
- **Narrow widths (under 1024px, phones and tablets):** the sidebar is hidden, and a full-width "Menu" button opens and closes the same four links. Tapping a link closes the menu. The responsive QA checklist records this passing at 375px and 768px, including keyboard use.
- **Home composition shows:**
  - **Metric cards:** Portfolio value, Active investments, Distributions (YTD). Each shows "—" with a hint such as "Connect data to see live totals".
  - **Portfolio summary region:** "No portfolio holdings to show yet. When your account is linked, summaries will appear here."
  - **Recent activity list:** "No recent activity yet. Distributions, documents, and updates will list here."
  - **Empty-state messaging:** implemented. Home deliberately passes empty lists so stakeholders see what an investor sees before an account is linked. A banner reads "Demo shell — no live data is connected yet".
- **Other pages (sample content):**
  - **Portfolio:** sample holdings table (one card per holding on phones).
  - **Deals:** sample deal cards with name, location and asset class, target raise, minimum, and status; no invest buttons.
  - **Profile:** read-only demo profile card; no form.

**Out of scope for this demo:** live Supabase data, login/auth gates, editing holdings, or production deployment hardening.

## 2. Requirements traceability

| Success criterion (from requirements brief) | Status | Evidence |
| --- | --- | --- |
| An investor can reach Home, Portfolio, Deals, and Profile from persistent navigation | Met | `src/routes/dashboard/route.tsx` wraps every page in `AppShell`; Sidebar (desktop) and MobileNav (under 1024px) share one link list. `docs/responsive-qa-checklist.md`: D1 (every sidebar link opens the right page), M5 (menu opens, closes, and navigates), X1 (keyboard). |
| Header, navigation, and main content are visible on desktop, with metrics and activity on Home | Met | `src/routes/dashboard/index.tsx` (MetricCard ×3, PortfolioSummary, RecentActivity). QA checklist D1–D5 at 1280px: header across the top, sidebar left, main right; metrics 3 across; summary and activity side by side (3/5 + 2/5). |
| On a narrow (mobile) width, navigation remains usable with no broken overlap | Met | QA checklist M1–M5 at 375px (no sideways scroll, sidebar hidden, Menu button 311 × 46px, menu opens and closes) and T1–T2 at 768px. |
| Placeholder content is clearly labeled so stakeholders know data is not live | Met | Home banner "Demo shell — no live data is connected yet"; header "Not signed in · sample data"; sample notes on built-in lists. Minor wording issue noted in section 4 ("sample" notes beside empty lists). |
| Requirements in this brief match what was built (no pages beyond the four above) | Met | Only `route.tsx`, `index.tsx`, `portfolio.tsx`, `deals.tsx`, `profile.tsx` exist under `src/routes/dashboard/`. |
| A teammate can read this brief and understand scope in under 5 minutes | Not yet | Not tested with a teammate. Suggest a 5-minute read-through during the stakeholder review. |

## 3. Decisions made (so the next topic does not re-litigate them)

- **Routing:** Dashboard lives under a TanStack Start file-based route tree: the `src/routes/dashboard/route.tsx` layout plus the `src/routes/dashboard/index.tsx` home, with `portfolio.tsx`, `deals.tsx`, and `profile.tsx` as sibling pages. The folder-style `route.tsx` is used instead of a separate `dashboard.tsx`; having both would define the same route twice.
- **Shell regions:** AppShell composes Header, Sidebar/MobileNav, and the main content outlet per `docs/dashboard-component-architecture.md`. Pages render only their own content and never their own header or navigation.
- **Current page comes from the URL:** the highlighted link and the header title both read the address, so they can't disagree with the page shown.
- **One navigation list:** Home, Portfolio, Deals, and Profile are defined once (`src/components/layout/navConfig.ts`) and shared by Sidebar and MobileNav.
- **Widgets:** MetricCard, PortfolioSummary, and RecentActivity are separate components, so data wiring later does not require a full rewrite of the page. They only display the props they're given. The same applies to PortfolioTable, DealsList, and ProfileCard on the other pages.
- **Responsive approach:** three tiers, mobile 320px+, tablet 768px+ (`md:`), and desktop 1024px+ (`lg:`), defined in `src/styles.css`.
  - The sidebar shows on desktop only.
  - Below 1024px, a "Menu" button opens MobileNav, which gives tablets the full content width.
  - Metric cards stack on phones and sit 3 across from 768px.
  - The portfolio holdings table becomes stacked cards on phones.
- **No investing or account actions:** Deals has no invest or checkout buttons; Profile is read-only.

## 4. Known limitations (honest baseline)

- **Mock data only:** metric values are "—" placeholders, Home's portfolio and activity lists are intentionally empty, and Portfolio, Deals, and Profile show built-in sample content. None of it comes from PostgreSQL/Supabase.
- **Auth not wired:** any investor can open the shell routes; no session or role checks yet. The member shown is a "Demo investor" placeholder.
- **No mutations:** read-only UI shell; no forms that persist changes.
- **QA residual risks** (from `docs/responsive-qa-checklist.md`):
  - **Starter site header and footer still appear around the dashboard.** This also makes "Skip to content" the 6th keyboard stop instead of the first (`src/routes/__root.tsx`; open question in the routing plan).
  - **"Sample" wording next to empty lists:** Portfolio summary and Recent activity show sample-data notes above their "nothing yet" messages.
  - **Very large metric values wrap mid-number** (e.g. "$12,345,678,901") in a metric card. Not visible today because values are "—".
  - **Recent activity timestamps not checked with real rows,** because Home passes an empty list.
  - **Sidebar is not sticky on desktop.** It scrolls with the page, which is fine for these short pages.
  - **Not covered:** a physical phone or tablet, and screen-reader speech.

## 5. Recommended next sprint work

1. Connect loaders/server functions to Supabase for real portfolio and activity reads. Use server functions for anything secret, and put each loader on the page that uses its data.
2. Add authentication and protect `/dashboard` for signed-in investors only.
3. Replace mock props with typed API/DTO shapes; keep presentational components stable. The widgets already accept typed props (for example `HoldingSnapshot`, `ActivityItem`).
4. Re-run the responsive QA checklist against real content lengths (long names, empty vs full lists), including populated Recent activity rows and large metric values.
5. Stakeholder demo script: happy path on mobile + desktop with one real portfolio fixture.
6. Remove the starter site header and footer from dashboard pages, and drop the "sample" notes beside empty lists on Home. Both are small, targeted fixes from the QA residual risks.

## 6. Artifact index (for handoff package)

- Requirements: `docs/preishare-dashboard-requirements.md`
- Routing plan: `docs/dashboard-routing-plan.md`
- Component architecture: `docs/dashboard-component-architecture.md`
- Responsive QA: `docs/responsive-qa-checklist.md`
- Routes: `src/routes/dashboard/route.tsx`, `src/routes/dashboard/index.tsx` (also `portfolio.tsx`, `deals.tsx`, `profile.tsx`)
- Components: `src/components/dashboard/` (AppShell, Header, Sidebar, MobileNav, MetricCard, PortfolioSummary, RecentActivity, PortfolioTable, DealsList, ProfileCard); nav list in `src/components/layout/navConfig.ts`
- Breakpoints: `src/styles.css` (`@theme` block)
