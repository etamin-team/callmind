import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function NotificationsSettingsPage() {
  return (
    <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Notification preferences will appear here.</p>
        </CardContent>
    </Card>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/settings/notifications')({
  component: NotificationsSettingsPage,
})