import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Bot, Loader2 } from 'lucide-react'

interface AgentUsage {
  agentId: string
  agentName: string
  calls: number
  minutes: number
  cost: number
  percentage: number
}

interface UsageBreakdownProps {
  agents: AgentUsage[]
  isLoading?: boolean
}

export function UsageBreakdown({ agents, isLoading = false }: UsageBreakdownProps) {
  const totalCalls = agents.reduce((sum, agent) => sum + agent.calls, 0)
  const totalCost = agents.reduce((sum, agent) => sum + agent.cost, 0)

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Usage by Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Usage by Agent</CardTitle>
      </CardHeader>
      <CardContent>
        {agents.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No agent data available
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.agentId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{agent.agentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {agent.calls} calls • {agent.minutes} min • ${agent.cost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{agent.percentage}%</p>
                      <p className="text-xs text-muted-foreground">of total</p>
                    </div>
                  </div>
                  <Progress value={agent.percentage} className="h-2" />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Usage</span>
                <div className="text-right">
                  <p className="text-sm font-bold">{totalCalls.toLocaleString()} calls</p>
                  <p className="text-xs text-muted-foreground">${totalCost.toFixed(2)} total cost</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}