import { useEffect, useState } from 'react'

import { Activity, Bot, MoreVertical, Pause, Play, Plus, Search, Star, Zap } from 'lucide-react'

import AgentCard from '../components/agent-card'
import CreateAgentOnboarding from '../components/create-agent-onboarding'
import { mockAgents } from '../utils/mock-data'
import type { AIAgent } from '../types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Array<AIAgent>>(mockAgents)
  const [showCreateOnboarding, setShowCreateOnboarding] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    document.title = 'AI Agents - Callmind'
  }, [])

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateAgent = (agentData: any) => {
    const newAgent: AIAgent = {
      ...agentData,
      id: `agent-${Date.now()}`,
      status: 'training',
      createdAt: new Date(),
      updatedAt: new Date(),
      performance: {
        totalCalls: 0,
        successRate: 0,
        avgResponseTime: 0,
        customerSatisfaction: 0
      }
    }
    setAgents([...agents, newAgent])
    setShowCreateOnboarding(false)
  }

  const handleToggleStatus = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
        : agent
    ))
  }

  const activeCount = agents.filter(a => a.status === 'active').length
  const totalCount = agents.length

  if (showCreateOnboarding) {
    return (
      <CreateAgentOnboarding 
        onComplete={handleCreateAgent}
        onCancel={() => setShowCreateOnboarding(false)}
      />
    )
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
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
              Create Agent
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                    <div className="text-3xl font-bold">{totalCount}</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Activity className="h-3 w-3" />
                      <span>All systems operational</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Bot className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500/20"></div>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                    <div className="text-3xl font-bold text-green-600">{activeCount}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live and responding</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500/20"></div>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                    <div className="text-3xl font-bold text-purple-600">
                      {agents.reduce((sum, agent) => sum + agent.performance.totalCalls, 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      <span>Across all agents</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Zap className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500/20"></div>
            </Card>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="training">Training</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Agents Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{agent.model}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {agent.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{agent.capabilities.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{agent.performance.successRate}%</span>
                      <span className="text-xs text-muted-foreground">success rate</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {agent.performance.totalCalls} calls handled
                    </div>
                  </div>
                  
                  <Button
                    variant={agent.status === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleStatus(agent.id)}
                    className="gap-1"
                  >
                    {agent.status === 'active' ? (
                      <>
                        <Pause className="h-3 w-3" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAgents.length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No agents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first AI agent to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateOnboarding(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Agent
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
  )
}
