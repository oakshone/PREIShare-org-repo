# PREIshare Dashboard — Cheat Sheet

One page to keep open while you work. Details live in
[`dashboard-routing-plan.md`](dashboard-routing-plan.md),
[`dashboard-component-architecture.md`](dashboard-component-architecture.md), and `AGENTS.md`.

**You don't need to memorise this page.** Know the one rule below and the
five ideas; look up everything else here when you need it.

## The one rule: every job has exactly one owner

| Job | Owner |
|---|---|
| The frame around every dashboard page | `route.tsx` (draws `AppShell`) |
| The list of nav links and page titles | `navConfig.ts` |
| Which page you're on | the URL |
| What data a page shows | the page file (components only display props) |
| Secrets and who may see which rows (later) | the server and the database, never the browser |

When something looks wrong, ask **"who owns this?"**, and that's the file to open.

## The five ideas

1. **Files in `src/routes/` create the pages.**
   A folder becomes part of the address. In that folder, `route.tsx` is the
   **frame** and `index.tsx` is the **page**. `<Outlet />` in the frame is the
   spot where the page appears.
   *Picture frame on the wall: the frame stays, the picture changes.*
   - **The router** is like a restaurant host. You give it an address (the URL),
     it checks its seating chart (`routeTree.gen.ts`), and seats you at the
     right page. Later it can also be a doorman for signed-in areas.
   - **Imports** are different. The `import` lines at the top of each file
     say what code that file uses, and Vite bundles them. The router never
     touches imports.
   - **`navConfig` is not a parent.** It's the directory sign listing the rooms.
     Remove an entry and the page still exists; it just leaves the menu.

2. **Components, props, state.**
   - **Component** = a reusable piece of the screen; in code, a function that
     returns what to show (`MetricCard`, `Sidebar`). A component is *not* state;
     it may or may not have some.
   - **Props** = what a component is **given** by its parent, as one object
     (`label="Portfolio value"`, `holdings`, `isSampleData`, even `children`).
     Read-only: a component never changes its own props.
   - **State** = what a component **remembers and changes itself**.
     `MobileNav`'s menu open/closed is state; `MetricCard` has none. "Which page
     you're on" isn't stored as state at all; it lives in the URL.

3. **One job per piece.**
   The shell (`AppShell`, `Header`, `Sidebar`, `MobileNav`) holds navigation.
   Pages hold content. Widgets only display the props they're given.

4. **No real data yet.**
   Every page shows sample data, labelled "Sample", and the numbers agree
   across pages. No Supabase, no `fetch`, no loaders. When real data comes, it
   goes through the server with `createServerFn`, never straight from a
   component. Loaders run in the browser too, so they aren't private.

5. **Where instructions go.**
   Rules true for *every* page → `AGENTS.md`.
   Details for *one* page → that page's prompt.

## Map of the files

```text
src/routes/dashboard/
  route.tsx        → frame for every /dashboard page: <AppShell><Outlet /></AppShell>
  index.tsx        → /dashboard (Home): MetricCards, PortfolioSummary, RecentActivity
  portfolio.tsx    → /dashboard/portfolio: PortfolioTable
  deals.tsx        → /dashboard/deals: DealsList
  profile.tsx      → /dashboard/profile: ProfileCard

src/components/dashboard/
  AppShell.tsx     → header on top, nav on the side (or Menu on phones), <main> for the page
  Header.tsx       → PREIshare brand, page title (the only h1), "Demo investor" placeholder
  Sidebar.tsx      → nav links for desktop (1024px+)
  MobileNav.tsx    → "Menu" button + same links for mobile and tablet
  MetricCard.tsx   → one number: label, value, optional hint
  PortfolioSummary.tsx → total + list of holdings
  RecentActivity.tsx   → list of events: timestamp, description, optional type
  PortfolioTable.tsx   → holdings (table on tablet+, cards on phones)
  DealsList.tsx        → deal cards with status badges, no invest buttons
  ProfileCard.tsx      → read-only member details

src/components/layout/navConfig.ts → the ONE list of nav links (Home, Portfolio, Deals, Profile)
src/routeTree.gen.ts               → generated from the routes folder. Never edit by hand.
src/styles.css                     → global styles + breakpoints
src/styles/dashboard.css           → dashboard layout (dash- classes) + accessibility rules
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

## Where code runs: loaders, server functions, RLS (next sprint)

Always ask **"where does this code run?"**

| Place | Who controls it | What runs there |
|---|---|---|
| Browser | the user (public) | components, state, and loaders on link clicks |
| Server | you (private) | `createServerFn` handlers, and loaders on the first page load |
| Database | you (private) | your SQL, plus RLS rules |

- **Loader:** gets a page's data *before* it draws. It runs in the browser
  too, so it's never private. It just calls a server function.
- **Server function (`createServerFn`):** always runs on the server. It looks
  like a normal function call, but it's really a request. This is where queries,
  secrets, and permission checks go.
- **RLS:** works like a `WHERE` clause the database adds to every query
  (`WHERE sponsor_id = auth.uid()`), so it can't be forgotten.

```tsx
const getDeals = createServerFn({ method: 'GET' }).handler(async () => {
  // server only: SELECT public columns FROM listings WHERE status = 'published'
})
export const Route = createFileRoute('/dashboard/deals')({
  loader: () => getDeals(),            // runs before the page draws
  component: () => <DealsList deals={Route.useLoaderData()} />,  // props, as today
})
```

**In one line:** loaders decide *when* data loads, server functions decide
*where* it's safe to load from, and RLS decides *which rows* anyone gets.

## Keeping data private (next sprint)

- **Hiding isn't withholding.** If the browser receives data and React just
  doesn't show it, anyone can still read it in DevTools.
- **The database decides what is sent.** Row Level Security (RLS) rules on the
  tables filter rows by who is signed in, before anything leaves the database.
- **RLS filters rows, not columns.** Private fields (contact emails, notes) go
  in their own owner-only table, or investors read from a public view.
- **Router check = front door, not the vault.** It sends signed-out visitors
  to sign-in. The server and the database still have to check every request.
- **Service-role key** skips RLS entirely → server only, never `VITE_`.

Full list: `docs/requirements/sponsor-auth-and-listings-brief.md`, section 8.

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
7. Is `navConfig` the parent of the dashboard routes? If not, what is?
8. What's the difference between what the router does and what imports do?
9. A component receives a value from its parent. Prop or state? Can it change it?
10. React hides another sponsor's listing on screen. Is that data safe? Why not?
11. A loader and a server function both "get data". Which one is private, and why?
