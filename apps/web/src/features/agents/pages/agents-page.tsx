import { useEffect, useState } from 'react'

import { MoreVertical, Plus, Bot } from 'lucide-react'


import { resetOnboarding } from '../store/onboarding-store'
import { mockAgents } from '../utils/mock-data'
import type { AIAgent } from '../types'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Array<AIAgent>>(mockAgents)
  const [showCreateOnboarding, setShowCreateOnboarding] = useState(false)

  useEffect(() => {
    document.title = 'AI Agents - Callmind'
  }, [])

  const handleCreateAgent = (agentData: any) => {
    const newAgent: AIAgent = {
      id: `agent-${Date.now()}`,
      name: agentData.name,
      description: agentData.description,
      status: 'active',
      capabilities: agentData.capabilities,
      model: agentData.model,
      temperature: agentData.temperature,
      maxTokens: agentData.maxTokens,
      createdAt: new Date(),
      updatedAt: new Date(),
      performance: {
        totalCalls: 0,
        successRate: 0,
        avgResponseTime: 0,
        customerSatisfaction: 0
      },
      configuration: {
        language: agentData.language,
        voice: agentData.voice,
        personality: agentData.personality,
        knowledgeBase: agentData.knowledgeBase,
        escalationThreshold: agentData.escalationThreshold
      }
    }
    setAgents([newAgent, ...agents])
    setShowCreateOnboarding(false)
    resetOnboarding()
  }

  const handleDeleteAgent = (agentId: string) => {
    setAgents(agents.filter(agent => agent.id !== agentId))
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
          <Button 
            size="lg" 
            onClick={() => setShowCreateOnboarding(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New AI Agent
          </Button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Bot className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground">{agent.model}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteAgent(agent.id)}>
                      Delete Agent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {agent.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {agents.length === 0 && (
        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first AI agent to get started
            </p>
            <Button onClick={() => setShowCreateOnboarding(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Agent
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}