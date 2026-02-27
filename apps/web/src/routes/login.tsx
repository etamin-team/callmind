import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout, LoginForm, useRedirectIfAuthenticated } from '#/features/auth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  useRedirectIfAuthenticated()

  return (
    <AuthLayout title="Welcome back">
      <LoginForm />
    </AuthLayout>
  )
}
