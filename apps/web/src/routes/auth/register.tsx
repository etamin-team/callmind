import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/register')({
  component: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="text-muted-foreground mt-2">Registration page coming soon</p>
      </div>
    </div>
  ),
})
