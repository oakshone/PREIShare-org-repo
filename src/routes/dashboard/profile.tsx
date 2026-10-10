import { createFileRoute } from '@tanstack/react-router'
import { ProfileCard } from '../../components/dashboard/ProfileCard'

export const Route = createFileRoute('/dashboard/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <section
      aria-labelledby="dashboard-profile-heading"
      className="flex flex-col gap-6"
    >
      <h2 id="dashboard-profile-heading" className="sr-only">
        Profile
      </h2>
      <p className="m-0 text-sm text-(--sea-ink-soft)">
        Your member details at a glance.
      </p>
      {/* No profile prop: ProfileCard uses its built-in MOCK profile. */}
      <ProfileCard />
    </section>
  )
}
