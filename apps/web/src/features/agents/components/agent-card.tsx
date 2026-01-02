import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreVertical, Pause, Play, Settings } from 'lucide-react'
import type { AIAgent } from '../types'

interface AgentCardProps {
  agent: AIAgent
  onToggleStatus?: (agentId: string) => void
  onEdit?: (agentId: string) => void
}

export default function AgentCard({ agent, onToggleStatus, onEdit }: AgentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-gray-400'
      case 'training': return 'bg-blue-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'inactive': return 'Offline'
      case 'training': return 'Training'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)} animate-pulse`}></div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{agent.name}</h3>
            <p className="text-sm text-muted-foreground">{agent.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {getStatusText(agent.status)}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onEdit?.(agent.id)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
        {agent.description}
      </p>

      {/* Capabilities */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 3).map((capability, index) => (
            <span 
              key={index} 
              className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-md text-slate-700 dark:text-slate-300"
            >
              {capability}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-md text-slate-700 dark:text-slate-300">
              +{agent.capabilities.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Performance */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
          <div className="text-xl font-bold text-foreground">{agent.performance.successRate}%</div>
          <div className="text-xs text-muted-foreground">Success Rate</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
          <div className="text-xl font-bold text-foreground">{agent.performance.totalCalls}</div>
          <div className="text-xs text-muted-foreground">Total Calls</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant={agent.status === 'active' ? 'secondary' : 'default'}
          size="sm"
          onClick={() => onToggleStatus?.(agent.id)}
          className="flex-1"
        >
          {agent.status === 'active' ? (
            <><Pause className="h-3 w-3 mr-1" /> Pause</>
          ) : (
            <><Play className="h-3 w-3 mr-1" /> Start</>
          )}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => onEdit?.(agent.id)}
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
