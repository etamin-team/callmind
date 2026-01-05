import { useEffect } from 'react'
import { useNavigate, useParams, Link } from '@tanstack/react-router'
import { MoreVertical, Plus, Bot, Loader2 } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  }, [getToken, fetchAgents])

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
          <Card key={agent.id} className="relative overflow-hidden group hover:shadow-md transition-shadow">
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
        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first AI agent to get started
            </p>
            <Button asChild className="gap-2">
              <Link to="/$workspaceId/agents/create" params={{ workspaceId }}>
              <Plus className="h-4 w-4" />
              Create Your First Agent
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}