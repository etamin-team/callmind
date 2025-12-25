import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <section className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Welcome to Callmind
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A modern full-stack application built with TanStack Start, Fastify, and MongoDB
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/app"
              className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </a>
            <a
              href="/auth/login"
              className="inline-flex items-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Sign In
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
