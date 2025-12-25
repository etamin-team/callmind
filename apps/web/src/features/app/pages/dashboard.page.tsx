import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Welcome to Your App</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This is your protected dashboard area
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
