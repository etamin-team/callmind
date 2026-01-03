import { createFileRoute } from '@tanstack/react-router'
import { ClientRedirect } from '@/lib/client-redirect'

export const Route = createFileRoute('/dashboard')({
  component: () => <ClientRedirect to="/agents" />
})