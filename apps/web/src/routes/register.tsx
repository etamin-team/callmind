import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout, RegisterForm, useRedirectIfAuthenticated } from '#/features/auth'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  useRedirectIfAuthenticated()

  return (
    <AuthLayout title="Create your account">
      <RegisterForm />
    </AuthLayout>
  )
}
