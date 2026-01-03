import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/$workspaceId/agents/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/$workspaceId/agents/create"!</div>
}
