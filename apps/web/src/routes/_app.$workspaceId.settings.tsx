import { createFileRoute, Outlet } from '@tanstack/react-router'

function SettingsLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your workspace settings and preferences</p>
      </div>
      <div className="flex-1 lg:max-w-4xl">
        <Outlet />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/settings')({
  component: SettingsLayout,
})