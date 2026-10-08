# PREIshare Investor Dashboard — Requirements Brief

## 1. Product context
PREIshare needs an investor-facing dashboard shell: a clear home base where
investors can scan portfolio value, browse open deals, and review their profile.
This sprint delivers the shell only (layout + clearly labeled mock content
across Home, Portfolio, Deals, and Profile), not live data or account management.

## 2. Primary actor and goals
- **Actor:** Investor (member) viewing their own mock dashboard; no sign-in this sprint
- **Goals on first visit:**
  1. Recognize they are in the PREIshare investor area (branding / header)
  2. Navigate among Home, Portfolio, Deals, and Profile without leaving the shell
  3. See high-level portfolio metrics at a glance
  4. Scan recent activity related to their investments

## 3. Primary screens (this sprint)
| Screen | Purpose | In this sprint? |
|--------|---------|-----------------|
| Dashboard home (`/dashboard`) | Shell + mock metrics, portfolio summary, and activity | Yes |
| Portfolio, Deals, Profile (`/dashboard/portfolio`, `/deals`, `/profile`) | Mock holdings table, deals list, and profile card | Yes (minimal) |
| Login / signup | Authentication | No (later) |
| Live portfolio detail / trades | Deep investment tools | No (later) |

## 4. Dashboard layout regions (must describe in UI work)
1. **Header** — current page title and a simple mock member placeholder
2. **Navigation** — sidebar on desktop; collapses or stacks on small screens without overlapping content
3. **Metrics region** — `MetricCard` tiles on Home (mock values)
4. **Activity region** — `RecentActivity` list on Home (mock items)
5. **Main content area** — where page-specific content renders inside `AppShell`

Metrics and activity are page content, not part of the shell.

## 5. Must-have vs later
### Must-have (demoable shell)
- File-based routes for Home, Portfolio, Deals, and Profile under `/dashboard`
- App shell composing header + nav + main content
- Responsive behavior: usable on phone and desktop widths
- Mock metric cards, portfolio summary, and recent-activity list on the home page
- Mock content labeled as mock/sample so it isn't mistaken for live data
- Clear navigation labels an investor would understand: Home, Portfolio, Deals, Profile

### Later (explicitly out of scope now)
- Live Supabase/PostgreSQL queries or balances
- Authentication, roles, and permissions UI
- Payments, subscriptions, document vaults, or e-sign
- Polished design system beyond a clean functional layout
- Charts that require live time-series data

## 6. Success criteria (how we know the shell is done)
- [ ] An investor can reach Home, Portfolio, Deals, and Profile from persistent navigation
- [ ] Header, navigation, and main content are visible on desktop, with metrics and activity on Home
- [ ] On a narrow (mobile) width, navigation remains usable with no broken overlap
- [ ] Placeholder content is clearly labeled so stakeholders know data is not live
- [ ] Requirements in this brief match what was built (no pages beyond the four above)
- [ ] A teammate can read this brief and understand scope in under 5 minutes

## 7. Notes for AI-assisted build
- Every implementation prompt should reference this file, `docs/dashboard-ia.md`, and `docs/component-plan.md` as scope control.
- Prefer small milestones: routes → shell → nav → widgets → compose → responsive QA.
- Mock data only: no fetching or Supabase calls in dashboard routes or components (see `AGENTS.md` dashboard shell rules).
- Reject agent output that adds out-of-scope features or pages without asking.
