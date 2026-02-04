import { createFileRoute, Outlet, useParams } from '@tanstack/react-router'
import { AgentSidebar } from '@/features/agents/components/agent-sidebar'
import { useAgentStore } from '@/features/agents/store'
import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Loader2 } from 'lucide-react'

function AgentDashboardLayout() {
  const { workspaceId, agentId } = useParams({ from: '/_app/$workspaceId/agents/$agentId' })
  const { agents, fetchAgents, isLoading, setCurrentAgent } = useAgentStore()
  const { getToken, isLoaded } = useAuth()

  const currentAgent = agents.find(a => a.id === agentId)

  useEffect(() => {
    if (isLoaded && !currentAgent && !isLoading) {
      const load = async () => {
        const token = await getToken()
        if (token) fetchAgents(token)
      }
      load()
    }
  }, [agentId, currentAgent, isLoaded, getToken, fetchAgents, isLoading])

  // Set current agent in store when found
  useEffect(() => {
    if (currentAgent) {
      setCurrentAgent(currentAgent)
    }
  }, [currentAgent, setCurrentAgent])

  if (isLoading && !currentAgent) {
     return (
        <div className="flex items-center justify-center h-screen">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
     )
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
       <AgentSidebar />
       <main className="flex-1 overflow-y-auto min-w-0 ml-64">
          <Outlet />
       </main>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/$agentId')({
  component: AgentDashboardLayout,
})
