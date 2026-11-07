# PREIshare Dashboard — Cheat Sheet

One page to keep open while you work. Details live in
[`dashboard-routing-plan.md`](dashboard-routing-plan.md),
[`dashboard-component-architecture.md`](dashboard-component-architecture.md), and `AGENTS.md`.

**You don't need to memorise this page.** Know the one rule below and the
five ideas; look up everything else here when you need it.

## The one rule: every job has exactly one owner

| Job | Owner |
|---|---|
| The frame around every dashboard page | `dashboard/route.tsx` (draws `AppShell`) |
| The list of nav links and page titles | `navConfig.ts` |
| Which page you're on | the URL |
| What data a page shows | the page file (components only display props) |
| Secrets and who may see which rows (later) | the server and the database, never the browser |

When something looks wrong, ask **"who owns this?"**, and that's the file to open.

## The five ideas

1. **Files in `src/routes/` create the pages.**
   A folder becomes part of the address. `route.tsx` (inside the
   `dashboard/` folder) is the **frame** and `dashboard/index.tsx` is the **page**.
   (`dashboard.tsx` next to the folder would mean the same frame, so never have both.) `<Outlet />` in the frame is the
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
src/routes/auth/login.tsx  → /auth/login: sign-in form (browser Supabase client)
src/routes/auth/signup.tsx → /auth/signup: sign-up form (browser Supabase client)
src/routes/dashboard/route.tsx → frame for every /dashboard page: guard + <AppShell><Outlet /></AppShell>
                                 (same route as dashboard.tsx: never have both)

src/routes/dashboard/
  index.tsx        → /dashboard (Home): MetricCards, PortfolioSummary, RecentActivity
  portfolio.tsx    → /dashboard/portfolio: PortfolioTable
  deals.tsx        → /dashboard/deals: DealsList
  profile.tsx      → /dashboard/profile: ProfileCard
  listings/index.tsx → /dashboard/listings: your listings (listMyListings, RLS filters)
  listings/new.tsx   → /dashboard/listings/new: create form (createListing, then back to the list)

src/components/listings/
  ListingCard.tsx  → one listing: title, city, status (props only)
  ListingForm.tsx  → create fields from schema.ts (props only, no Supabase)

src/server/listings.ts      → listMyListings / createListing / updateListing server functions
src/lib/listings/schema.ts  → zod rules for listing input (browser + server)

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

src/components/layout/navConfig.ts → the ONE list of nav links (Home, Portfolio, Deals, Profile, Properties)
src/routeTree.gen.ts               → generated from the routes folder. Never edit by hand.
src/styles.css                     → global styles + breakpoints
src/styles/dashboard.css           → dashboard layout (dash- classes) + accessibility rules

src/lib/supabase/client.ts  → browser client: sign-in / sign-up only (public VITE_ values)
src/lib/supabase/server.ts  → server client: reads the user's cookie from the request
src/lib/supabase/types.ts   → what the tables look like, so TypeScript catches column typos
src/lib/auth/session.ts     → getSessionUser, signOutSession: server-only session helpers
src/lib/auth.functions.ts   → getCurrentUser + signOut server functions (call the helpers above)
supabase/migrations/        → the tables + RLS rules, run in filename order
```

## Where does it go?

| I want to… | Put it in… |
|---|---|
| Add a dashboard page | a new file in `src/routes/dashboard/` (and ask first — only 4 pages are in scope) |
| Add or rename a nav link | `navConfig.ts` (Sidebar and MobileNav both read it) |
| Change something on every dashboard page | `AppShell.tsx` |
| Change only the Home page | `src/routes/dashboard/index.tsx` |
| Show a new kind of number or list | a widget in `src/components/dashboard/`, data passed in as props |
| Load or save real data | a `createServerFn` that uses `getSupabaseServerClient()`, called from the page's loader or form |
| A new signed-in-only page | `src/routes/dashboard/`: the guard in `dashboard/route.tsx` covers it automatically |
| "Who is signed in?" | `getCurrentUser()` (server function) → `getSessionUser()` |
| Change a table | a **new** migration file + update `supabase/types.ts` (never edit an applied migration) |

## Common mistakes to catch (yours or an agent's)

- A page that builds its own header or sidebar → send it back; the shell does that.
- A layout without `<Outlet />` → pages silently show up blank.
- Numbers or names written inside a widget → should come in as props.
- Fake data that looks real → label it mock or sample.
- A link to an address with no route file → TypeScript flags it via `navConfig`.
- Secrets in a component or a `VITE_` variable → the browser can see them.
- Both `dashboard.tsx` and `dashboard/route.tsx` → `/dashboard` defined twice.
- A guard or loader calling `getSupabaseServerClient()` directly → throws in the browser; call a server function.
- Service-role key used to "fix" a query → returns every sponsor's rows.
- `owner_id` taken from the browser → set it on the server from `getUser()`.
- Showing `error.message` from the database → leaks table and policy names; show a plain message.
- Real values in `.env.example` → it's committed. Real values only in `.env` and Vercel.
- Changed a `VITE_` value in Vercel but didn't redeploy → the old value is still baked in.
- `properties.tsx` + `properties.new.tsx` → the form nests inside the list and never shows; use `properties.index.tsx`.

## Screen sizes (breakpoints)

Write styles for the phone first, then add prefixes for bigger screens:

| Tier | Width | Prefix | Example |
|---|---|---|---|
| Mobile | 320px+ | none | `grid gap-4` → one column |
| Tablet | 768px+ | `md:` | `md:grid-cols-3` → three columns from 768px |
| Desktop | 1024px+ | `lg:` | `lg:block` → sidebar appears from 1024px |

A prefix means "from this width **and up**". Only use these three in the dashboard.

## Where code runs: loaders, server functions, RLS

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
  (`WHERE owner_id = auth.uid()`), so it can't be forgotten.

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

## Keeping data private

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

## Sign-in and the guard (Sprint 4)

**If you remember only four things:**
1. **The browser is public.** Anything sent there, anyone can read.
2. **Sign in happens in the browser; the check happens on the server.**
3. **The database decides which rows you get** (RLS = automatic `WHERE owner_id = you`).
4. **The service-role key turns that off,** so it never leaves the server (we don't use it at all).

**Two helpers, same anon key.** They differ in *where they run* and *where
they find the session*, not in power. Neither uses the service-role key.

| | Browser helper | Server helper |
|---|---|---|
| File | `supabase/client.ts` | `supabase/server.ts` |
| Used by | `/auth/login`, `/auth/signup` | the guard, Sign out, the listings pages (all via server functions) |
| Finds the session in | the browser's cookie storage | the cookie sent with the request (`getCookies()`) |
| Why there | the password is typed in the browser | the server builds the page before any browser code runs |

**The flow:** sign in (browser) → Supabase gives back a session cookie →
every later request carries that cookie → the server reads it and asks
Supabase Auth "is this real?" with `getUser()` → let in, or redirect to `/auth/login`.

**Sign-up:** Supabase sends a confirmation email by default, so there's no session
until the link is clicked → the page says "check your email, then sign in".

**Sign-out:** the button calls the `signOut` server function → `signOutSession()` →
Supabase revokes the session and the server clears the cookies → `/auth/login`.

**If the guard used the browser helper instead:**
1. Refreshing `/dashboard` crashes (`createClientOnlyFn` throws on the server).
2. Without that wrapper, the server sees no cookie → signed-in users get kicked to `/auth/login`.
3. A browser-only check is cosmetic: it runs after the page was already sent, and users can edit it.
4. Later, data queries run as `anon` → RLS matches nothing → empty dashboard.

**`getUser()` vs `getSession()`:** `getUser()` asks Supabase to verify the
session; `getSession()` just believes the cookie. Guards use `getUser()`.

**Why the guard calls a server function:** `beforeLoad` also runs in the browser
on link clicks, and the server helper is wrapped in `createServerOnlyFn`: its
code is removed from the browser bundle and it throws if called there.

### What "bypass RLS" means

RLS hides **rows**, not columns. Bypassing it removes the filter completely.
Same query, `select * from property_listings`:

| Who's asking | Rows returned |
|---|---|
| Anon key + Sponsor A's cookie | only A's listings (`owner_id = auth.uid()`) |
| Anon key, no cookie | zero (no policy for `anon`) |
| Service-role key | **every sponsor's rows**: only your own code's filter stands in the way |

**Why anon key + cookie is safe:** the cookie holds a token signed by Supabase
("this is user A"). The server client forwards it, Supabase checks the signature
on every request, and Postgres sets `auth.uid()` from it. The anon key itself
has no power; identity comes from the user's token.

**Two layers:** the guard (`getUser()`) decides *who sees the page*; the token
plus RLS decides *which rows* every request can touch. If the guard had a bug,
RLS still holds. The service-role key is the one thing that switches RLS off.

**In one line:** sign-in happens where the password is (browser); the bouncer
stands where the page is built (server); Postgres guards the rows.

### The service-role key: what it's for if we never use it

Supabase gives every project one automatically. You can't avoid having it; you
choose to keep it locked away.

**Apartment building:** publishable key + sign-in = a **tenant's key** (opens
only your apartment; RLS is the lock on each door). Service-role key = the
**landlord's master key** (opens every door). Tenants never get it.

**It's for your app's server code, not for you as a person.** Example: an
"Approve listing" button for admins (next sprint, risk R1). The admin doesn't
own the listing, so RLS would block them; server code in a `.server.ts` file
uses the service-role key to make the change. Because that code skips RLS,
**it must check for itself that the person is really an admin.**

| Who | How they get past RLS |
|---|---|
| **You** fixing data by hand | Supabase dashboard (Table Editor / SQL Editor, your owner login) |
| **Your app** doing an admin job | Service-role key, server only (`.server.ts`) |
| **A sponsor** | Never. RLS always applies |

**Why it's empty in Sprint 4:** every action is a sponsor touching their own
listings, which sign-in + RLS already covers. A key that doesn't exist can't
leak.

**In one line:** it's the admin key **for your server code**; you use the
dashboard instead.

### Saving a listing: `WITH CHECK`

**Where the owner comes from:** the browser sends only title, address, city,
price, description. The server sets `owner_id: user.id` from `getUser()`. Then
Postgres checks `WITH CHECK (owner_id = auth.uid())`: two sources that must match.

| Clause | Checks | When it says no |
|---|---|---|
| `USING` | which **existing** rows you can see or touch (SELECT, UPDATE, DELETE) | silently: "0 rows" (treat as *not found*) |
| `WITH CHECK` | the **new** row being written (INSERT, UPDATE) | **an error**, and nothing is saved |

**Why the rule lives in the database:** the anon key is public, so anyone signed
in can call Supabase's API directly and skip your app. Your server code is the
bouncer; `WITH CHECK` is the vault lock that works even through a side door.

**Running on the server doesn't bypass RLS.** The database only looks at
*which key* and *whose token*. Anon key + user's token → RLS applies (browser
or server). Service-role key or a direct `DATABASE_URL` → RLS skipped.

**No cookie = 0 rows (not everyone's).** No cookie → the request is role `anon`
and `auth.uid()` is NULL. No policy is `TO anon`, and `owner_id = NULL` is never
true. RLS **denies by default**; Express-style "one powerful DB user" allows by default.

**RLS limits rows, not columns.** On their *own* listings, a sponsor calling
Supabase directly can change any column the policy doesn't mention: `status`
(even to `published`, risk R1), `created_at`, even `id`. Only `owner_id` is
guarded (`WITH CHECK`), and the trigger resets `updated_at`. To lock columns:
a stricter `WITH CHECK`, column `GRANT`s, or a trigger, in a **new** migration.

### Validating input with zod

**What zod is:** a **rule-checker for data** (a package added in Sprint 4). You
write the rules once ("a listing needs a title, price is a number, state is 2
letters"); zod checks incoming data against them.
- Follows the rules → passes through, cleaned up.
- Breaks a rule → zod says which one ("State must be 2 letters"), and the bad
  data never reaches the database.

> Like a bouncer with a checklist: "Got a title? Real price? OK, you're in."

`.validator` on a server function is where the incoming data is handed to zod.

**One schema, two places:** `src/lib/listings/schema.ts` gives instant messages
in the form *and* is re-checked in `src/server/listings.ts` (the browser can be skipped).

| Call | What it does | Use it when |
|---|---|---|
| `schema.safeParse(x)` | returns `{ success, data }` or `{ success: false, error }` | you want **field messages** for a form |
| `schema.parse(x)` | throws on bad input | a crash is fine (not for forms) |
| `z.flattenError(err).fieldErrors` | `{ title: ['Title is required'] }` | showing messages under fields |

**Two traps we hit (both fixed):**
1. **`.partial()` on a schema with defaults refills them.** Updating only the title
   reset `status` to `draft`. Build the update schema from fields *without* defaults.
2. **`z.coerce.number('')` is `0`.** A blank price saved as $0. Treat blank as missing first.

Also: zod drops unknown keys, so an `owner_id` sent by the browser just disappears.
In this TanStack version the server-function method is **`.validator`** (`inputValidator` is deprecated).

### What Supabase runs for you

No auth server, session store, or database to run yourself: Supabase stores
passwords, issues and refreshes signed tokens, sends emails, rate-limits sign-in,
hosts Postgres, and applies RLS on every request. Vercel runs your server
functions. **You still own:** the RLS policies, keeping keys secret, the guard,
and the Supabase project settings.

**The three pieces ("backend-as-a-service" = Supabase runs the machinery):**

| Piece | What it does for you | In your app |
|---|---|---|
| **Auth** | **Authentication** ("who are you?"): sign-up, sign-in, password hashing, email confirmation, issues the session token | `/auth/signup`, `/auth/login`; `getUser()` checks the session |
| **Postgres** | Stores the data; **RLS** enforces who sees which rows | `property_listings`, owner-only policies |
| **Client library** | The code your app uses to **talk to** Auth and Postgres; also keeps the session in cookies | `client.ts` (browser, sign-in only), `server.ts` (server, data) |

**Authentication vs authorization:** Supabase Auth = **who you are** (ID at the
door). **What you're allowed to do** (which rooms) = RLS + the guard + your own
rules. Auth hands Postgres your id (`auth.uid()`); RLS uses it.

**Your app owns the rules:** which pages need sign-in (guard), data shape (zod),
who owns a new listing (server sets `owner_id`), writing the RLS policies,
which key goes where, never committing `.env`, business rules like "only
admins publish" (R1).

**In one line:** Supabase gives you the **tools** (login, database, lock); your
app decides the **rules** (who, what, where).

### Setting up `.env`

```bash
cp .env.example .env          # .env is gitignored; .env.example stays empty
SUPABASE_URL=https://<ref>.supabase.co      # server
SUPABASE_ANON_KEY=sb_publishable_…          # server
VITE_SUPABASE_URL=https://<ref>.supabase.co # browser (same value)
VITE_SUPABASE_ANON_KEY=sb_publishable_…     # browser (same value)
SUPABASE_SERVICE_ROLE_KEY=                  # leave EMPTY: the app doesn't use it
```
- No spaces around `=`, no quotes. Restart `npm run dev` after editing.
- Same four values in Vercel → **redeploy** (`VITE_` values are baked in at build time).
- Never paste real values into chat, docs, or `.env.example`.

### Secret-hygiene audit (record counts, never values)

| Check | Command / idea | Pass means |
|---|---|---|
| `.env` not tracked | `git ls-files \| grep -i env`, `git check-ignore .env` | only `.env.example` tracked; `.env` ignored |
| Never committed | `git log --all --oneline -- .env` | no commits |
| Placeholders only | `grep -E '^[A-Z_]+=.+' .env.example` | no output |
| Names vs values | search for `service_role`, `SUPABASE_SERVICE_ROLE` | names only, no `NAME=value` |
| Browser bundle | `npm run build`, search `.output/public` for `sb_secret_[A-Za-z0-9_-]{10,}`, `DATABASE_URL`, `postgres://…:…@` | nothing (publishable key + URL **are** expected) |

- **Evidence = commands + counts** ("0 lines", "16 name-only mentions"), never the key itself.
- **False alarm we hit:** the bare text `sb_secret_` is inside the Supabase library (it checks
  key prefixes). Search for the prefix *plus* key characters.

## Semantic search (embeddings + pgvector)

**The idea:** keyword search matches **spelling**; semantic search matches **meaning**.
"quiet cabin near water with good rental upside" should find "lakefront retreat with steady
bookings" even though they share no words.

### The words, in one line each

| Word | Plain meaning |
|---|---|
| **Embedding** | A list of numbers that captures what a piece of text **means** (the "vibe score card") |
| **Vector** | Just the name for that list of numbers |
| **Embedding model** | The AI service that turns text into the list. It **learned** where meanings go by reading huge amounts of text |
| **Generation** | Making the list: text → model/API → numbers. **Server only** (secret API key) |
| **Storage** | Saving the list in the database, next to the property |
| **pgvector** | Postgres add-on: a `vector` column type + ways to measure closeness. It **stores and compares**, it doesn't make embeddings |
| **Cosine distance `<=>`** | Our closeness measure. **Smaller = closer** in meaning. Similarity score = `1 − distance` (higher = better) |
| **Top-K** | Keep the K best (closest) matches, sorted best first |
| **Dimension** | How many numbers are in each list. Ours: **1536**, the same for every row and every query |
| **Keyword-only distractor** | A listing that **shares words** but **means something else** (the loft that says "cabin-style kitchen") |

### How a search runs

1. **Listings (once):** text → **generate** → **store** in `properties.embedding`.
2. **Buyer searches:** query → **generate** (same model) → **compare** with the stored ones. The query is **not stored**.
3. Score each listing (`<=>`), sort **smallest distance first**, keep the **top K**.
4. Watch for **low scores**: top-K always fills its slots, even with bad matches (that's what the farmland control query tests).

### Why a cabin and a cottage end up close

Nobody hand-scores the numbers. The **embedding model learned** from huge amounts of text that
"cabin" and "cottage" are used in the same situations (lake, quiet, getaway, rental), so it gives
them nearby lists. Our toy labels ("water", "quiet", "city") were pretend; real numbers aren't labelled.

### Accept or reject agent code

| Agent hands you… | Verdict | Why |
|---|---|---|
| Order by closeness of stored `embedding` to the query embedding (`<=>`, ascending, top-K) | ✅ Accept (after checks) | That *is* vector search |
| "Rank these together, both say *cabin*" | ❌ Reject | Shared word = keyword matching, not meaning |
| Filter `description ILIKE '%sunny%'`, sort newest first | ❌ Reject | Keyword filter + date order; no embeddings, no score |
| Sort by miles to the train station | ❌ Reject | Map distance ≠ meaning distance (and map search is out of scope) |

**Checks before accepting:** same model + 1536 for listings and query · compares the stored
`embedding` column, not description text · sorts the right way (`<=>` smallest first) · has a
top-K limit · returns id, title and score · skips rows with no embedding yet · a meaning match
beats a keyword-only distractor.

### Mix-ups to avoid

| ❌ Don't say | ✅ Say |
|---|---|
| "The embedding is the making of the numbers" | The embedding **is** the list; **generation** makes it |
| "They're close because they share keywords" | They're close because they **mean** the same thing |
| "The buyer's search gets saved" | Listings are stored; the search is only **compared** |
| "0.92 means 92% relevant" | Scores aren't percentages; compare them with each other |
| "pgvector understands meaning" | The **model** does; pgvector stores and measures |
| "Any model's vectors can mix" | One model, one size (1536) for everything |

### Where it lives

`docs/semantic-search-requirements.md` (what we're building) · `docs/embeddings-learner-notes.md`
and `docs/vector-search-learner-notes.md` (your notes) · `docs/embedding-data-model.md` (the
table design) · `docs/pgvector-setup-plan.md` (the migration plan) ·
`supabase/migrations/20261107000000_properties_pgvector.sql` (the migration).

## Quick answers (the tricky quiz ones)

| Question | Honest answer | Why the others are wrong |
|---|---|---|
| What type models "many listings"? | **`Listing[]`** (an array of the listing type) | `string` is the HTML output, `boolean` is "visible?", errors are a separate state |
| What should a negative (invalid) fixture do? | **Fail the type check** (`// @ts-expect-error` above it) | `as any` hides the bug; deploying bad data or keeping it only in a quiz checks nothing |
| A variable the bundler exposes (`VITE_`): its value must be… | **safe for anyone to read** (e.g. the publishable key, safe because RLS is on) | the name is the switch: you can't "hide" a `VITE_` value |
| Create succeeded: which REST pair? | **`POST /properties` → `201 Created`** (+ `Location` header) | `PUT` = client picks the id; `GET` never creates. Supabase does this under the hood; our server function returns 200 with `{ ok: true }` |
| UI only links "your" listings: skip RLS? | **No.** Links control what's *offered*, RLS controls what can be *requested* | the public key lets anyone call Supabase directly |
| An automated quality control is… | **a check that fails the change** when install / typecheck breaks | screenshots, "looks fine", or branch names stop nothing. PREIShare has no CI yet; Vercel only runs the build |

## Sprint 4 in one line per topic (memorise these)

| Topic | One line |
|---|---|
| **Where code runs** | Browser = dining room (public: components, forms, sign-in call). Server = kitchen (private: server functions, session check, all listing queries). Database = locked pantry that checks every order itself (tables + RLS). |
| **Loaders** | Loaders can run in the browser (on link clicks), so they only *call* server functions and never hold keys. Chain: loader → server function → database. |
| **`createServerFn`** | Turns a function into a remote call: its body runs only on the server; calling it from the browser just sends a request and waits for the answer. TanStack writes the request code for you. |
| **Server-only / client-only wrappers** | `createServerOnlyFn` = kitchen only (code removed from the browser bundle, throws there). `createClientOnlyFn` = dining room only (throws on the server). File names like `server.ts` protect nothing; only `x.server.ts` names are blocked automatically. |
| **Sign-in vs the check** | Sign in where the password is typed (browser). Check on the server, because the server builds the page first and browser code can be changed by anyone. |
| **The session** | Lives in a **cookie**, sent automatically with every request. The server reads it **and verifies it** with `getUser()`; `getSession()` only reads and believes it. |
| **The guard** | `beforeLoad` in `dashboard/route.tsx`, the parent layout, so every page in `dashboard/` (including new ones) inherits it. |
| **Sign-up** | Account created, no session yet → confirmation email → "Check your email, then sign in". Signing in before confirming → "Confirm your email address first". |
| **Two clients** | Same publishable key in both. `client.ts` (browser, `VITE_` values) finds the user in the browser; `server.ts` (server, `SUPABASE_` values) finds them in the request's cookie. The secret key is used by **neither**. |
| **`owner_id`** | The owner's account id, pointing to `auth.users`. Set by **the server** from the session; the database default and `WITH CHECK` are backups. Never from the browser, or anyone could use someone else's id. |
| **Migrations** | Dated SQL files in `supabase/migrations/` that change the database's *structure*. Never edit one that has run; add a new one. Update `types.ts` (and `schema.ts` / the form) in the same change. |
| **`ON DELETE RESTRICT`** | Stops deleting an *account* that still owns listings (so listings aren't silently lost). It does **not** stop deleting listings. |
| **RLS** | A filing cabinet that checks your ID on **every** request, wherever it comes from (page, console, script). |
| **Whose ID** | The id inside the signed cookie becomes `auth.uid()`. No cookie → no ID → `auth.uid()` is NULL → default deny → **nothing** comes back. |
| **`USING` vs `WITH CHECK`** | `USING` = which existing rows you can touch → someone else's is skipped silently ("0 rows"). `WITH CHECK` = the new row you're writing → not yours = **error**, nothing saved. |
| **What bypasses RLS** | Only the **service-role key** (or a direct `DATABASE_URL` connection). Server code with the publishable key + the user's cookie is still under RLS. |

## Mix-ups to avoid (from the quiz)

| ❌ Easy to think | ✅ Actually |
|---|---|
| "The server client uses the secret key" | Both clients use the **same publishable key**. The secret key is empty and unused; if the server used it, RLS would be off and every sponsor would see everyone's listings. |
| "Running on the server bypasses RLS" | No. Only the **service-role key** does. |
| "The UI only links my listings, so RLS can be skipped" | No. Links only control what's *offered*; anyone can call Supabase directly with the public key. |
| "`createServerFn` creates a server" | It turns a function into a **remote call** to the server you already have. |
| "A loader runs on the server (or in the database)" | It runs on the server on first load **and in the browser** on link clicks. It never talks to the database itself. |
| "`getUser()` checks the database" | It asks **Supabase Auth** to verify the session. `getSession()` just reads the cookie. |
| "Using the browser client on the server breaks because cookies aren't stored" | The cookie is stored fine. The browser client just **can't read it on the server** (or throws), so the guard can't see you're signed in. |
| "A migration is a data migration" | Here it means a SQL file that changes the database's **structure** (tables, columns, rules). |
| "`ON DELETE RESTRICT` stops deleting listings" | It stops deleting the **account** while it still owns listings. |
| "RLS sees the user's name" | It sees the user's **id** (`auth.uid()`), from the signed token in the cookie. |

## Warnings you might see

- **`A notFoundError was encountered on the route with ID "__root__"…`**: not a bug. The
  browser asked for an address with no route file (often an old link like `/login` or
  `/dashboard/properties`), and there's no custom not-found page yet, so TanStack shows `<p>Not Found</p>`.
- **`'inputValidator' is deprecated` / `'FormEvent' is deprecated`**: editor hints from newer
  library types. Code still works; use `.validator` in new server functions.

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
12. `dashboard.tsx` vs `dashboard/route.tsx`: what's the difference, and why never both?
13. Why does sign-in use the browser helper but the guard use the server helper? Do they use different keys?
14. Name two things that break if the guard used the login form's client.
15. Service-role key runs `select * from property_listings`. Whose rows come back?
16. With the anon key, where does the user's identity actually come from?
17. `getUser()` or `getSession()` in a guard, and why?
18. When you create a listing, where does `owner_id` come from? What double-checks it?
19. B sends an insert with A's `owner_id`. Is it saved? Error or "0 rows"?
20. B tries to update A's listing by id. Error or "0 rows"? Why is that dangerous for the UI?
21. Your server already sets the owner. Why have `WITH CHECK` in the database at all?
22. A server function uses the anon-key server client. Does it skip RLS? What would?
23. Which `.env` line stays empty, and why?
24. You changed `VITE_SUPABASE_URL` in Vercel. Why does the live site still use the old one?
25. A request arrives with no cookie. What's `auth.uid()`, and why does it get 0 rows instead of all of them?
26. On their *own* listing, which columns can a sponsor still change by calling Supabase directly? Which one can't they?
27. `safeParse` or `parse` for a form, and why?
28. Name the two zod traps we hit, and how each was fixed.
29. In a secret audit, what do you write down as evidence, and what do you never write down?
30. A negative fixture compiles without errors. Is that good or bad? What should be above it?
