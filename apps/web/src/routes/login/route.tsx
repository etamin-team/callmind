import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/pages/LoginPage'

export const Route = createFileRoute('/login')({
  component: LoginPage,
  ssr: false,
  beforeLoad: ({ context }) => {
    if (context.auth?.isLoaded && context.auth?.isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
})