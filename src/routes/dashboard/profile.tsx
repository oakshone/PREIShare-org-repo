import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <main>
      <h1>Profile</h1>
      <p>Mock content: investor profile details.</p>
    </main>
  )
}
