import { createFileRoute } from '@tanstack/react-router'
import AgentsPage from '@/features/agents/pages/agents-page'

export const Route = createFileRoute('/_app/$workspaceId/agents/')({
  component: AgentsPage,
})