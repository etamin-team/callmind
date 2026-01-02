import { AlertCircle, Clock, Eye, Frown, Meh, Phone, Smile } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface LiveCall {
  agent: string
  status: 'On Call' | 'Wrap Up' | 'Available'
  duration: string
  topic: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

interface LiveOperationsProps {
  calls?: Array<LiveCall>
  onViewAll?: () => void
}

export default function LiveOperations({ calls, onViewAll }: LiveOperationsProps) {
  // Mock data - in real app this would come from API/websockets
  const mockCalls: Array<LiveCall> = [
    {
      agent: 'Sarah Jenkins',
      status: 'On Call',
      duration: '04:22',
      topic: 'Billing Dispute',
      sentiment: 'negative'
    },
    {
      agent: 'David Chen',
      status: 'Wrap Up',
      duration: '00:45',
      topic: 'Technical Support',
      sentiment: 'positive'
    },
    {
      agent: 'Emily Rodriguez',
      status: 'On Call',
      duration: '01:12',
      topic: 'Upgrade',
      sentiment: 'neutral'
    },
    {
      agent: 'Michael Brown',
      status: 'Wrap Up',
      duration: '00:23',
      topic: 'Account Inquiry',
      sentiment: 'positive'
    },
    {
      agent: 'Lisa Wang',
      status: 'On Call',
      duration: '02:55',
      topic: 'Service Complaint',
      sentiment: 'negative'
    }
  ]

  const liveCalls = calls || mockCalls

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'On Call': return 'destructive'
      case 'Wrap Up': return 'secondary'
      case 'Available': return 'default'
      default: return 'outline'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="h-4 w-4 text-green-500" />
      case 'negative': return <Frown className="h-4 w-4 text-red-500" />
      case 'neutral': return <Meh className="h-4 w-4 text-yellow-500" />
      default: return <Meh className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="@container/card from-primary/5 to-card bg-gradient-to-t shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Operations</CardTitle>
            <CardDescription>Real-time call center activity</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onViewAll}>
            <Eye className="mr-2 h-4 w-4" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Active Calls</span>
            </div>
            <div className="text-2xl font-bold">{liveCalls.length}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium uppercase tracking-wide">On Call</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {liveCalls.filter(c => c.status === 'On Call').length}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-yellow-600">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Wrap Up</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {liveCalls.filter(c => c.status === 'Wrap Up').length}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Need Attention</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {liveCalls.filter(c => c.sentiment === 'negative').length}
            </div>
          </div>
        </div>

        <Separator />

        {/* Live Calls List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Active Calls</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {liveCalls.slice(0, 3).map((call, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{call.agent}</p>
                    <p className="text-xs text-muted-foreground">{call.topic}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right space-y-1">
                    <Badge variant={getStatusVariant(call.status)} className="text-xs">
                      {call.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground font-mono">{call.duration}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {getSentimentIcon(call.sentiment)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time updates</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View all calls
        </Button>
      </CardFooter>
    </Card>
  )
}
