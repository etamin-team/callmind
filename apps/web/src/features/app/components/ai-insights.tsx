import { Activity, AlertTriangle, Brain, Lightbulb, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface AIInsight {
  id: string
  type: 'escalation' | 'opportunity' | 'trend'
  title: string
  description: string
  action?: string
  priority: 'high' | 'medium' | 'low'
  timestamp: Date
}

interface AIInsightsProps {
  insights?: Array<AIInsight>
  onViewLog?: () => void
  onIntervene?: (insightId: string) => void
}

export default function AIInsights({ insights, onViewLog, onIntervene }: AIInsightsProps) {
  // Mock data - in real app this would come from AI analysis service
  const mockInsights: Array<AIInsight> = [
    {
      id: '1',
      type: 'escalation',
      title: 'Escalation Risk',
      description: 'High negative sentiment detected on Line 4 (Sarah Jenkins). Customer mentioned "Cancel service".',
      action: 'Intervene',
      priority: 'high',
      timestamp: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Upsell Opportunity',
      description: 'Customer on Line 2 (David Chen) asking about premium features during technical support call.',
      action: 'Notify Agent',
      priority: 'medium',
      timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    },
    {
      id: '3',
      type: 'trend',
      title: 'Call Volume Spike',
      description: 'Unusual increase in billing-related calls in the last hour. 45% above average.',
      priority: 'medium',
      timestamp: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    }
  ]

  const aiInsights = insights || mockInsights

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'escalation': return <AlertTriangle className="h-4 w-4" />
      case 'opportunity': return <Lightbulb className="h-4 w-4" />
      case 'trend': return <TrendingUp className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return {
        bg: 'bg-red-50 dark:bg-red-950',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-100',
        description: 'text-red-800 dark:text-red-200'
      }
    }
    
    switch (type) {
      case 'escalation': return {
        bg: 'bg-orange-50 dark:bg-orange-950',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'text-orange-600 dark:text-orange-400',
        title: 'text-orange-900 dark:text-orange-100',
        description: 'text-orange-800 dark:text-orange-200'
      }
      case 'opportunity': return {
        bg: 'bg-green-50 dark:bg-green-950',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-green-900 dark:text-green-100',
        description: 'text-green-800 dark:text-green-200'
      }
      case 'trend': return {
        bg: 'bg-blue-50 dark:bg-blue-950',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-100',
        description: 'text-blue-800 dark:text-blue-200'
      }
      default: return {
        bg: 'bg-gray-50 dark:bg-gray-950',
        border: 'border-gray-200 dark:border-gray-800',
        icon: 'text-gray-600 dark:text-gray-400',
        title: 'text-gray-900 dark:text-gray-100',
        description: 'text-gray-800 dark:text-gray-200'
      }
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High Priority</Badge>
      case 'medium': return <Badge variant="secondary">Medium</Badge>
      case 'low': return <Badge variant="outline">Low</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatTimestamp = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60))
    if (minutes < 1) return 'Just now'
    if (minutes === 1) return '1 minute ago'
    return `${minutes} minutes ago`
  }

  return (
    <Card className="@container/card from-primary/5 to-card bg-gradient-to-t shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Real-time AI analysis and recommendations</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onViewLog}>
            <Activity className="mr-2 h-4 w-4" />
            View Log
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {aiInsights.map((insight) => {
          const colors = getInsightColor(insight.type, insight.priority)
          
          return (
            <div
              key={insight.id}
              className={`relative overflow-hidden rounded-lg border ${colors.border} ${colors.bg} p-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-0.5 ${colors.icon}`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${colors.title}`}>
                        {insight.title}
                      </h4>
                      {getPriorityBadge(insight.priority)}
                    </div>
                    <p className={`text-sm ${colors.description} leading-relaxed`}>
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      <span>{formatTimestamp(insight.timestamp)}</span>
                    </div>
                  </div>
                </div>
                {insight.action && (
                  <Button
                    size="sm"
                    variant={insight.priority === 'high' ? 'destructive' : 'outline'}
                    onClick={() => onIntervene?.(insight.id)}
                    className="shrink-0"
                  >
                    {insight.action}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Brain className="h-3 w-3" />
          <span>AI Analysis Active</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Last scan: 30 seconds ago
        </div>
      </CardFooter>
    </Card>
  )
}
