// src/routes/search.tsx
// /search: semantic property search page. Sends the buyer's words to
// GET /api/properties/search (src/routes/api/properties/search.ts) and shows what comes back.
//
// Rules for this page:
// - NO client-side re-ranking. Results are shown in exactly the order the server returns
//   (best match first, decided by match_properties). Never sort, filter, or reorder them here.
// - NO fake or computed scores. The score shown is the server's `similarity` field, only
//   rounded for display. Never invent, rescale, or turn it into a percentage.
// - The page itself isn't behind the /dashboard guard; the API route checks sign-in and
//   answers 401, which this page shows as a sign-in prompt.
import { createFileRoute, Link } from '@tanstack/react-router'
import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import type { PropertyMatch } from '../lib/property-search'

export const Route = createFileRoute('/search')({
  component: SearchPage,
})

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string; signInNeeded: boolean }
  | { status: 'done'; query: string; results: PropertyMatch[] }

const SNIPPET_LENGTH = 160

const inputClass =
  'w-full rounded-xl border border-(--line) bg-(--surface-strong) px-3 py-2.5 text-sm text-(--sea-ink)'

/** First part of the description, cut at a word boundary. Shortens text only; never touches order or score. */
function toSnippet(description: string): string {
  if (description.length <= SNIPPET_LENGTH) return description
  const cut = description.slice(0, SNIPPET_LENGTH)
  return `${cut.slice(0, cut.lastIndexOf(' ')) || cut}…`
}

function SearchPage() {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<SearchState>({ status: 'idle' })
  const inputId = useId()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      setState({ status: 'error', message: 'Type what you are looking for.', signInNeeded: false })
      return
    }

    setState({ status: 'loading' })
    try {
      const response = await fetch(`/api/properties/search?q=${encodeURIComponent(trimmed)}`)
      const body: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        const message =
          typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
            ? body.error
            : 'Search failed. Try again.'
        setState({ status: 'error', message, signInNeeded: response.status === 401 })
        return
      }

      const results =
        typeof body === 'object' && body !== null && 'results' in body && Array.isArray(body.results)
          ? (body.results as PropertyMatch[])
          : []
      // Server order is the ranking. Do not sort or filter `results`.
      setState({ status: 'done', query: trimmed, results })
    } catch {
      setState({
        status: 'error',
        message: 'Could not reach the server. Check your connection and try again.',
        signInNeeded: false,
      })
    }
  }

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Property search</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          Describe what you're looking for
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-(--sea-ink-soft)">
          Search by meaning, not exact words. Try “quiet cabin near water with good rental upside”.
        </p>

        <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor={inputId} className="text-sm font-semibold text-(--sea-ink)">
              Search
            </label>
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={500}
              placeholder="quiet cabin near water with good rental upside"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={state.status === 'loading'}
            className="dash-nav-link justify-center rounded-xl bg-(--sea-ink) px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {state.status === 'loading' ? 'Searching…' : 'Search'}
          </button>
        </form>
      </section>

      <section className="mt-6" aria-live="polite" aria-busy={state.status === 'loading'}>
        {state.status === 'idle' ? null : state.status === 'loading' ? (
          <p role="status" className="m-0 text-sm text-(--sea-ink-soft)">
            Searching…
          </p>
        ) : state.status === 'error' ? (
          <div
            role="alert"
            className="flex flex-col items-start gap-2 rounded-xl border border-(--danger) px-4 py-3 text-sm font-semibold text-(--danger)"
          >
            <p className="m-0">{state.message}</p>
            {state.signInNeeded ? (
              <Link to="/auth/login" search={{ redirect: '/search' }} className="text-(--sea-ink) underline">
                Sign in
              </Link>
            ) : null}
          </div>
        ) : state.results.length === 0 ? (
          <p className="m-0 rounded-xl border border-dashed border-(--line) p-6 text-sm text-(--sea-ink-soft)">
            No properties matched “{state.query}”. Try describing it a different way.
          </p>
        ) : (
          <>
            <p className="m-0 mb-3 text-sm text-(--sea-ink-soft)">
              {state.results.length} results for “{state.query}”, best match first. Score = similarity
              from the server (higher is closer; not a percentage).
            </p>
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {state.results.map((match, index) => (
                <li key={match.id} className="island-shell rounded-xl p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="m-0 text-lg font-semibold text-(--sea-ink)">
                      {index + 1}. {match.title}
                    </h2>
                    <span className="text-sm text-(--sea-ink-soft) tabular-nums">
                      Score {match.similarity.toFixed(3)}
                    </span>
                  </div>
                  <p className="m-0 mt-1 text-sm leading-6 text-(--sea-ink-soft)">
                    {toSnippet(match.description)}
                  </p>
                  {match.city ? (
                    <p className="m-0 mt-1 text-xs text-(--sea-ink-soft)">{match.city}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </main>
  )
}
