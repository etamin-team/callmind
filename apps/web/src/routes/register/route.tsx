import { createFileRoute, redirect } from '@tanstack/react-router'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
  beforeLoad: ({ context }) => {
    if (context.auth?.isLoaded && context.auth?.isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
})