import { createFileRoute } from '@tanstack/react-router'
import { UserProfile } from '@clerk/clerk-react'

function SecuritySettingsPage() {
  const { workspaceId } = Route.useParams()

  return (
    <div className="w-full">
      <UserProfile 
        routing="path" 
        path={`/${workspaceId}/settings/security`}
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border border-zinc-200 dark:border-zinc-800 bg-transparent w-full max-w-none",
            navbar: "hidden",
            scrollBox: "p-0",
            pageScrollBox: "p-6",
          }
        }}
      />
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/settings/security')({
  component: SecuritySettingsPage,
})