import { createFileRoute } from '@tanstack/react-router'
import { ClientRedirect } from '@/lib/client-redirect'

export const Route = createFileRoute('/agents')({
  component: () => <ClientRedirect to="/agents" />
})