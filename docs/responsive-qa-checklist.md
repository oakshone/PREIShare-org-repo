# PREIshare dashboard — responsive QA checklist

**Tester:** Jackson Nieporte (checks run with Claude Code: in-browser measurements, simulated taps/keys, and screenshots reviewed by eye)
**Date:** 2026-10-10
**App URL tested:** http://localhost:4173/dashboard (plus `/portfolio`, `/deals`, `/profile`) — production build via `npm run build` + `vite preview`; same routes as the dev server on :3000
**Build / branch:** `main` @ `1f4ce6a`, plus uncommitted breakpoint changes (three-tier breakpoints, desktop-only sidebar)

## Breakpoints used

| Name    | Width  | How to set                          |
|---------|--------|-------------------------------------|
| Mobile  | 375px  | Chrome device emulation (375 × 812) |
| Tablet  | 768px  | Chrome device emulation (768 × 1024) |
| Desktop | 1280px | Chrome device emulation (1280 × 1024) |

Design tiers in code (`src/styles.css`): mobile = no prefix (320px+), tablet = `md:` (768px+), desktop = `lg:` (1024px+). Shell and grid layout rules: `src/styles/dashboard.css` (same breakpoints).

## How to use this sheet

1. Load the dashboard route with the dev server running.
2. For each row, set the width, perform the check, mark **Pass** or **Fail**.
3. On Fail, write a short **Symptom** and which **file** you will ask the agent to touch.
4. After a targeted fix, re-test and update **Status** and **Fix notes**.
5. Critical rows must Pass (or be listed under Known limitations with stakeholder-safe wording).

---

## Mobile (~375px)

| ID | Check | Status (Pass/Fail) | Symptom / notes | Fix notes (prompt + files) |
|----|--------|--------------------|-----------------|----------------------------|
| M1 | No horizontal page scroll | Pass | Page is exactly 375px wide on all four pages. Only the "Skip to content" link sits off-screen, on purpose until focused. | — |
| M2 | Header remains visible and usable | Pass | Fully on screen (32–343px); page title and "Demo investor / Not signed in · sample data" visible; long titles wrap cleanly. | — |
| M3 | Desktop sidebar is hidden or off-canvas (not permanently covering content) | Pass | Sidebar is hidden (`display: none`) on all four pages; it only appears at 1024px+. | Earlier fix, see cycle 1 |
| M4 | MobileNav or menu control is visible | Pass | "Menu" button on every page, 311 × 46px, labelled "Open dashboard menu". | — |
| M5 | Menu opens and closes navigation links | Pass | Tap opens (all four links, Home highlighted, ☰ → ✕); tap again closes; tapping "Deals" goes to `/dashboard/deals` and closes the menu. | — |
| M6 | Main content readable without pinched text | Pass | Nothing extends past the screen; body text 14px+. Smallest text is the ~11px uppercase labels (readable). | — |
| M7 | Metric cards stack in a single column (or intentional narrow grid) | Pass | Three cards, same left edge, one below another. | — |
| M8 | PortfolioSummary does not overflow or clip | Pass | Content width equals its box (267px); no child sticks out. | — |
| M9 | RecentActivity list wraps; no cut-off timestamps/labels | Pass | No overflow; the sample note and empty message wrap at word boundaries. Home currently passes an empty list, so no timestamps are shown — see Known limitations. | — |
| M10 | Empty-state messaging (if shown) is fully visible | Pass | Metric hints, "No portfolio holdings to show yet…" and "No recent activity yet…" all fully visible, 2–4 lines each. | — |

## Tablet (~768px)

| ID | Check | Status (Pass/Fail) | Symptom / notes | Fix notes (prompt + files) |
|----|--------|--------------------|-----------------|----------------------------|
| T1 | No horizontal page scroll | Pass | Page is exactly 768px wide on all four pages. | — |
| T2 | Navigation pattern matches plan (sidebar, rail, or menu—not both fighting) | Pass | Planned tablet pattern is the menu only: sidebar hidden, "Menu" button shown. Never both at once. | Earlier fix, see cycle 1 |
| T3 | Header + content spacing not cramped | Pass | 24px padding inside the main card; 16px between cards; 24px between the summary and activity sections. | — |
| T4 | Metric cards use a sensible 2-column (or planned) layout | Pass | Planned layout is 3 across: one row, 207px each, 16px gaps. | Earlier fix, see cycle 1 |
| T5 | PortfolioSummary and RecentActivity share space without overlap | Pass | Planned to stack at tablet: each full width (654px), 24px apart, no overlap. (They sit side by side from 1024px.) | — |
| T6 | Touch targets / click targets large enough to use | Pass | Menu button 704 × 46px; menu links 678 × 40px each. Cycle 4 made nav links 44px tall (shared link style; measured on desktop, not re-measured here). | — |

## Desktop (~1280px)

| ID | Check | Status (Pass/Fail) | Symptom / notes | Fix notes (prompt + files) |
|----|--------|--------------------|-----------------|----------------------------|
| D1 | Sidebar visible and usable per architecture | Pass | 240px column on the left of main, tops aligned. Clicked Portfolio → Deals → Profile → Home: right page each time, header title updated, only the current link highlighted. Links 198 × 40px (44px after cycle 4). | — |
| D2 | MobileNav hidden or not duplicating full sidebar awkwardly | Pass | Menu button hidden at 1024px+; only the sidebar shows. | — |
| D3 | Main region has comfortable padding/margins | Pass | 24px inside the main card; 24px gap from the sidebar; shell centred at its maximum width with even side margins. | — |
| D4 | Metric cards align in a multi-column row as planned | Pass | 3 across in one row, 234px each, 16px gaps. | — |
| D5 | PortfolioSummary + RecentActivity sit in intended regions | Pass | Side by side below the metrics: summary 431px (≈ 3/5), activity 279px (≈ 2/5), as in the architecture doc. | — |
| D6 | Long labels/numbers do not break the header or sidebar width | Pass | Tested by temporarily injecting long text (a 70-character page title, a long user name, a long sidebar link). Header stayed 1048px and sidebar 240px, with no overflow; the user name and sidebar link wrapped neatly. | — |

## Cross-cutting issues

| ID | Check | Status | Notes |
|----|--------|--------|-------|
| X1 | Focus order / keyboard: menu and links reachable | Pass | At 375px: Tab reaches "Skip to content" and then the Menu button, and every stop shows a focus ring. Enter opens the menu, Tab moves through Home / Portfolio / Deals / Profile, and Enter on Profile opens it and closes the menu. "Skip to content" is the **6th** Tab stop, after the starter site's header links — see Known limitations. |
| X2 | No layout jump when opening/closing mobile menu | Pass | Header and Menu button don't move, and nothing shifts sideways (page width unchanged). Content below is pushed down while the menu is open (206px at 375 and 768), as expected for an inline menu, and returns to exactly the same position on close. |
| X3 | Stacking order: important metrics appear before low-priority lists on small screens | Pass | On mobile, order is: intro, demo banner, 3 metric cards, Portfolio summary, Recent activity. |

## Targeted fix log (one row per prompt cycle)

| Cycle | Breakpoint | File(s) touched | Prompt summary (one sentence) | Result after re-test |
|-------|------------|-----------------|-------------------------------|----------------------|
| 1 | Tablet (and desktop) | `src/styles.css`, `AppShell.tsx`, `Sidebar.tsx`, `MobileNav.tsx`, `routes/dashboard/index.tsx`, `DealsList.tsx`, `ProfileCard.tsx` | Use exactly three tiers (base / `md:` 768 / `lg:` 1024), show the sidebar only on desktop so tablets get full width with the Menu button, and remove `sm:`/`xl:` classes. | Pass: no more mid-word breaks on deal cards at 768px; metric cards 3 across at 768 and 1024 (no orphan card). |
| 2 | Mobile | `DealsList.tsx`, `PortfolioTable.tsx` | Put the deal status badge on its own line on phones, and show portfolio holdings as stacked cards below 768px instead of a sideways-scrolling table. | Pass: deal names no longer break mid-word; every holding field visible at 320–375px. |
| 3 | — | — | No changes made during this checklist run; all rows passed on first test. | — |
| 4 | All three | `src/styles/dashboard.css` (new), `src/styles.css` (import), `AppShell.tsx`, `Header.tsx`, `Sidebar.tsx`, `routes/dashboard/index.tsx`, `DealsList.tsx` | Move shell, header, and card-grid layout into `src/styles/dashboard.css`, and add accessibility rules (focus ring, 44px nav links, current-page bar, reduced motion, high-contrast mode, skip link shown on focus). | Pass: re-measured at 375 / 768 / 1280px against this run. Same layout, no sideways scroll, menu and sidebar navigation still work. Intended changes only: sidebar links 198 × 44px (were 40px), Home summary/activity exactly 3:2, skip link no longer sits past the page edge. One slip caught by the re-test: the shell's side padding was dropped (16px instead of 32px from the edge) and restored. |

Cycles 1–2 were found from screenshots at 320 / 768 / 1024px before this sheet was filled in. This run re-tested everything after those fixes.

## Known limitations (optional)

List anything still imperfect that you are **not** fixing in this sprint, with a reason (e.g. “Chart library deferred to next topic”).

- **Starter site header and footer still appear around the dashboard.** This also makes "Skip to content" the 6th keyboard stop instead of the first. Removing the starter chrome from dashboard pages is an open question in the routing plan (`src/routes/__root.tsx`).
- **"Sample" wording next to empty lists.** Portfolio summary and Recent activity show "Sample data…" and "Total (sample) —" above their "nothing yet" messages. One-line follow-up: pass `isSampleData={false}` on Home.
- **Very large metric values wrap mid-number.** For example, "$12,345,678,901" breaks after the last comma in a 234px card. Current values are "—", so it isn't visible today; revisit when real figures arrive (`MetricCard.tsx`).
- **Recent activity timestamps not checked with real rows.** Home passes an empty list on purpose, so the populated layout (type tag, description, date) was not tested at these widths.
- **Sidebar is not sticky on desktop.** It scrolls with the page, which is fine for these short pages.
- **Not covered:** a physical phone or tablet, and screen-reader speech. These are worth a quick check before the stakeholder demo.

## Sign-off

- [x] Critical mobile checks M1–M7 pass
- [x] Critical tablet checks T1–T5 pass
- [x] Critical desktop checks D1–D5 pass
- [x] Fix log filled for every change made during QA
- [x] Touched components still match the architecture (no accidental full rewrite)

**Ready for stakeholder handoff draft:** Yes
