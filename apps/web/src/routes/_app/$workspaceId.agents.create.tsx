import { createFileRoute } from '@tanstack/react-router'
import AgentCreatePage from '@/features/agents/pages/agent-create-page'

export const Route = createFileRoute('/_app/$workspaceId/agents/create')({
  component: AgentCreatePage,
})
