import { useEffect } from 'react'
import { useNavigate, useParams, Link } from '@tanstack/react-router'
import { Plus, Bot, Loader2 } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

import { useAgentStore } from '../store'

export default function AgentsPage() {
  const navigate = useNavigate()
  const { workspaceId } = useParams({ from: '/_app/$workspaceId/agents/' })
  const { getToken } = useAuth()
  const { agents, isLoading, fetchAgents } = useAgentStore()

  useEffect(() => {
    const loadAgents = async () => {
      const token = await getToken()
      if (token) {
        fetchAgents(token)
      }
    }
    loadAgents()
  }, [getToken, fetchAgents, workspaceId])

  useEffect(() => {
    document.title = 'AI Agents - Callmind'
  }, [])

  /* Delete functionality can be re-implemented later
  const handleDeleteAgent = (agentId: string) => {
    // setAgents(agents.filter(agent => agent.id !== agentId))
  }
  */

  if (isLoading) {
      return (
          <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
      )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
            <p className="text-muted-foreground">Manage your intelligent workforce</p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link to="/$workspaceId/agents/create" params={{ workspaceId }}>
              <Plus className="h-4 w-4" />
              New AI Agent
            </Link>
          </Button>
        </div>
      </div>  

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card 
            key={agent.id} 
            className="relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate({ to: `/${workspaceId}/agents/${agent.id}` })}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Bot className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{agent.type}</p>
                  </div>
                </div>
                {/* 
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Delete Agent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                */}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {agent.businessDescription || "No description provided."}
              </p>
              <div className='flex gap-2 mt-4'>
                 <div className='px-2 py-1 bg-secondary/50 rounded text-xs font-mono text-muted-foreground'>
                    {agent.language === 'en' ? 'English' : agent.language}
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
           {/* Visual Placeholder for Illustration */}
           <div className="relative w-64 h-40 mb-8">
              <div className="absolute inset-x-8 inset-y-0 bg-orange-400/20 rounded-2xl rotate-[-6deg] backdrop-blur-sm" />
              <div className="absolute inset-x-8 inset-y-0 bg-red-400/20 rounded-2xl rotate-[6deg] backdrop-blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border border-orange-200/50 dark:border-orange-800/30 rounded-2xl shadow-sm flex items-center justify-center">
                 <div className="space-y-3 w-3/4 opacity-50">
                    <div className="h-2 w-1/3 bg-orange-200 dark:bg-orange-800 rounded-full" />
                    <div className="h-2 w-full bg-orange-100 dark:bg-orange-900/50 rounded-full" />
                    <div className="h-2 w-5/6 bg-orange-100 dark:bg-orange-900/50 rounded-full" />
                 </div>
                 <div className="absolute top-4 left-4 p-1.5 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                    <Bot className="w-4 h-4 text-orange-500" />
                 </div>
              </div>
           </div>

          <h3 className="text-xl font-bold tracking-tight mb-3">No agents yet..</h3>
          <p className="text-muted-foreground max-w-md mb-8 text-base">
             Create your first AI Agent to start automating support, generating leads, and answering customer questions.
          </p>
          <Button asChild size="lg" className="h-10 px-6 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-md">
            <Link to="/$workspaceId/agents/create" params={{ workspaceId }}>
            <Plus className="h-4 w-4 mr-2" />
            New AI agent
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}