import { createFileRoute } from '@tanstack/react-router'
import { OrganizationProfile, UserProfile } from '@clerk/clerk-react'

function GeneralSettingsPage() {
  const { workspaceId } = Route.useParams()
  const isOrg = workspaceId.startsWith('org_')

  return (
    <div className="w-full">
      {isOrg ? (
        <OrganizationProfile 
          routing="path" 
          path={`/${workspaceId}/settings/general`}
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border border-zinc-200 dark:border-zinc-800 bg-transparent w-full max-w-none",
              navbar: "hidden", // We use our own routing
              scrollBox: "p-0",
              pageScrollBox: "p-6",
            }
          }}
        />
      ) : (
        <UserProfile 
          routing="path"
          path={`/${workspaceId}/settings/general`}
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
      )}
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/settings/general')({
  component: GeneralSettingsPage,
})
