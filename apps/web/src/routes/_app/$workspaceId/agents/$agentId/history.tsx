import { createFileRoute } from '@tanstack/react-router'
import { Phone, Clock, Calendar, User, Play, Search, Filter, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from '@tanstack/react-router'
import { getCallHistory, getCallHistoryStats } from '@/features/call-history/api'
import { CallHistory } from '@repo/types'

function HistoryPage() {
  const { agentId } = Route.useParams()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [directionFilter, setDirectionFilter] = useState('all')
  const [calls, setCalls] = useState<CallHistory[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch call history and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const token = await getToken()

        if (!token) {
          throw new Error('No authentication token')
        }

        const [historyData, statsData] = await Promise.all([
          getCallHistory(agentId, token),
          getCallHistoryStats(agentId, token)
        ])

        setCalls(historyData.calls)
        setStats(statsData)
      } catch (err) {
        console.error('Error fetching call history:', err)
        setError('Failed to load call history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [agentId, getToken])

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      (call.callerNumber && call.callerNumber.includes(searchQuery)) ||
      (call.summary && call.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter
    const matchesDirection = directionFilter === 'all' || call.direction === directionFilter
    return matchesSearch && matchesStatus && matchesDirection
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'missed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'failed':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getDirectionIcon = (direction: string) => {
    return direction === 'inbound' ? '↓ Inbound' : '↑ Outbound'
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Call History</h1>
          <p className="text-sm text-muted-foreground">
            View and analyze all calls handled by your agent
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search by phone number or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={directionFilter} onValueChange={setDirectionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Directions</SelectItem>
            <SelectItem value="inbound">Inbound</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-center h-24">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <p className="text-xs text-muted-foreground">Total Calls</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalCalls || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {stats.completedCalls || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <p className="text-xs text-muted-foreground">Missed</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {stats.missedCalls || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {Math.floor((stats.averageDuration || 0) / 60)}:
                {String(Math.floor((stats.averageDuration || 0) % 60)).padStart(2, '0')}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Call List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-2">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredCalls.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No calls found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        filteredCalls.map((call) => (
          <Card
            key={call.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate({ to: '/$workspaceId/agents/$agentId/history/$callId', params: { workspaceId: 'default', agentId, callId: call.id! } })}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{call.callerNumber || call.callerName || 'Unknown'}</p>
                      <Badge variant="outline" className={getStatusColor(call.status)}>
                        {call.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getDirectionIcon(call.direction)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{call.summary || 'No summary available'}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {call.duration ? `${Math.floor(call.duration / 60)}:${String(call.duration % 60).padStart(2, '0')}` : '0:00'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {call.startedAt ? formatDistanceToNow(new Date(call.startedAt), { addSuffix: true }) : 'Unknown time'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {call.recordingUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle play button click
                      }}
                    >
                      <Play className="w-4 h-4" />
                      Play
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/$agentId/history')({
  component: HistoryPage,
})
