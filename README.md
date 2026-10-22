# PREIshare Investor Dashboard Shell

A responsive investor dashboard shell for PREIshare (Home, Portfolio, Deals, and Profile), built with TanStack Start, React 19, and Tailwind CSS v4, using clearly labelled mock data only. There's no live data, sign-in, or payments yet.

## Prerequisites

- **Node.js 22.12.0 or newer.** TanStack Start requires it (`node -v` to check).
- **npm**, which comes with Node. The project uses `package-lock.json`, so use npm rather than pnpm or yarn.
- No `.env` file or accounts are needed. The dashboard runs entirely on built-in sample data.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on port 3000. Open **http://localhost:3000/dashboard** for the investor dashboard; `http://localhost:3000/` is the starter home page. Press `Ctrl+C` in the terminal to stop the server.

## Scripts

These are the only scripts in `package.json`. There are no `test`, `lint`, or `format` scripts yet.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 (`vite dev --port 3000`) |
| `npm run build` | Production build (`vite build`) |
| `npm run preview` | Serve the production build locally (`vite preview`) |
| `npm run typecheck` | Check TypeScript types without building (`tsc --noEmit`) |
| `npm run generate-routes` | Regenerate `src/routeTree.gen.ts` (`tsr generate`). It's also regenerated automatically by the dev server and build, so don't edit it by hand. |

## Project docs

- **[Sprint 3 handoff](docs/sprint3-handoff.md):**
  - what shipped, with the route list and component inventory
  - how to run it, plus a 5-minute demo script
  - known limitations and next-sprint work
- **[Architecture decisions](docs/architecture-decisions.md):**
  - the decisions: routing, AppShell layout, mock data boundary, and the responsive/accessibility baseline
  - next-sprint foundations: Supabase auth, live data, pgvector search, and GitHub Actions CI
- More: [client brief](docs/investor-dashboard-brief.md), [verification checklist](docs/verification-checklist.md), and the [repo map](docs/onboarding/repo-map.md) for new contributors. Guidance for AI coding agents is in [AGENTS.md](AGENTS.md).

## Where things live

- `src/routes/dashboard.tsx`: the shared dashboard layout (sign-in guard + `AppShell`).
- `src/routes/dashboard/`: dashboard pages: Home (`index.tsx`), `portfolio.tsx`, `deals.tsx`, and `profile.tsx`.
- `src/components/dashboard/`: AppShell, Header, Sidebar, MobileNav, and the page widgets.
- `src/components/layout/navConfig.ts`: the one list of dashboard links and page titles.
- `src/styles.css` (global styles, Tailwind entry, breakpoints) and `src/styles/dashboard.css` (dashboard layout and accessibility rules).

---

The sections below are general TanStack reference notes from the starter template.

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).


# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
