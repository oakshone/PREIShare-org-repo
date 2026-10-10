# PREIshare Dashboard — Cheat Sheet

One page to keep open while you work. Details live in
[`dashboard-routing-plan.md`](dashboard-routing-plan.md),
[`dashboard-component-architecture.md`](dashboard-component-architecture.md), and `AGENTS.md`.

## The five ideas

1. **Files in `src/routes/` create the pages.**
   A folder becomes part of the address. In that folder, `route.tsx` is the
   **frame** and `index.tsx` is the **page**. `<Outlet />` in the frame is the
   spot where the page appears.
   *Picture frame on the wall: the frame stays, the picture changes.*

2. **Components, props, state.**
   - **Component** = a reusable building block (`MetricCard`, `Sidebar`).
   - **Prop** = what you hand a component so it knows what to show (`label="Open deals"`).
   - **State** = something that changes while the app runs. Here, the main one is
     *which page you're on*, and that lives in the URL. (`MobileNav` also keeps a
     tiny bit of state: menu open or closed.)

3. **One job per piece.**
   The shell (`AppShell`, `Header`, `Sidebar`, `MobileNav`) holds navigation.
   Pages hold content. Widgets only display the props they're given.

4. **No real data yet.**
   Everything is mock or empty, and labeled that way. No Supabase, no `fetch`,
   no loaders. When real data comes, it goes through the server with
   `createServerFn`, never straight from a component.

5. **Where instructions go.**
   Rules true for *every* page → `AGENTS.md`.
   Details for *one* page → that page's prompt.

## Map of the files

```text
src/routes/dashboard/
  route.tsx        → frame for every /dashboard page: <AppShell><Outlet /></AppShell>
  index.tsx        → /dashboard (Home): MetricCards, PortfolioSummary, RecentActivity
  portfolio.tsx    → /dashboard/portfolio  (stub for now)
  deals.tsx        → /dashboard/deals      (stub for now)
  profile.tsx      → /dashboard/profile    (stub for now)

src/components/dashboard/
  AppShell.tsx     → header on top, nav on the side (or Menu on phones), <main> for the page
  Header.tsx       → PREIshare brand, page title (the only h1), "Demo investor" placeholder
  Sidebar.tsx      → nav links for desktop (1024px+)
  MobileNav.tsx    → "Menu" button + same links for mobile and tablet
  MetricCard.tsx   → one number: label, value, optional hint
  PortfolioSummary.tsx → total + list of holdings
  RecentActivity.tsx   → list of events: timestamp, description, optional type

src/components/layout/navConfig.ts → the ONE list of nav links (Home, Portfolio, Deals, Profile)
src/routeTree.gen.ts               → generated from the routes folder. Never edit by hand.
```

## Where does it go?

| I want to… | Put it in… |
|---|---|
| Add a dashboard page | a new file in `src/routes/dashboard/` (and ask first — only 4 pages are in scope) |
| Add or rename a nav link | `navConfig.ts` (Sidebar and MobileNav both read it) |
| Change something on every dashboard page | `AppShell.tsx` |
| Change only the Home page | `src/routes/dashboard/index.tsx` |
| Show a new kind of number or list | a widget in `src/components/dashboard/`, data passed in as props |
| Load real data (later) | `createServerFn`, called from the loader of the page that uses it |

## Common mistakes to catch (yours or an agent's)

- A page that builds its own header or sidebar → send it back; the shell does that.
- A layout without `<Outlet />` → pages silently show up blank.
- Numbers or names written inside a widget → should come in as props.
- Fake data that looks real → label it mock or sample.
- A link to an address with no route file → TypeScript flags it via `navConfig`.
- Secrets in a component or a `VITE_` variable → the browser can see them.

## Screen sizes (breakpoints)

Write styles for the phone first, then add prefixes for bigger screens:

| Tier | Width | Prefix | Example |
|---|---|---|---|
| Mobile | 320px+ | none | `grid gap-4` → one column |
| Tablet | 768px+ | `md:` | `md:grid-cols-3` → three columns from 768px |
| Desktop | 1024px+ | `lg:` | `lg:block` → sidebar appears from 1024px |

A prefix means "from this width **and up**". Only use these three in the dashboard.

## Before you say "done"

```bash
npm run typecheck   # types are OK
npm run build       # it builds (this is what Vercel runs)
npm run dev         # open /dashboard and check it at 320, 768, and 1024px wide
```

## Test yourself (answer out loud, then check above)

1. Which file decides that `/dashboard/deals` exists?
2. What does `<Outlet />` do, and what happens if it's missing?
3. Is "which page the investor is on" a prop or state? Where does it live?
4. Why does `MetricCard` take `label` and `value` as props instead of having them written inside?
5. Where would a secret API key go once real data arrives — and where must it never go?
6. A rule that should apply to every page: `AGENTS.md` or the page's prompt?
