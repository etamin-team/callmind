import { createFileRoute } from '@tanstack/react-router'
import { OrganizationProfile } from '@clerk/clerk-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function MembersSettingsPage() {
  const { workspaceId } = Route.useParams()
  const isOrg = workspaceId.startsWith('org_')

  if (!isOrg) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workspace Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Personal accounts do not have workspace members. Create an organization to collaborate with others.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <OrganizationProfile 
        routing="path" 
        path={`/${workspaceId}/settings/members`}
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

export const Route = createFileRoute('/_app/$workspaceId/settings/members')({
  component: MembersSettingsPage,
})