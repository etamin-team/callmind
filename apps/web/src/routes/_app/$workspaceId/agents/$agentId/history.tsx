import { createFileRoute } from '@tanstack/react-router'
import { Phone, Clock, Calendar, User, Play, Search, Filter } from 'lucide-react'
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
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

// Mock call history data
const mockCalls = [
  {
    id: '1',
    caller: '+998 90 123 4567',
    duration: '3:45',
    status: 'completed',
    direction: 'inbound',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    summary: 'Customer inquired about pricing plans',
    sentiment: 'positive',
  },
  {
    id: '2',
    caller: '+998 91 234 5678',
    duration: '1:20',
    status: 'completed',
    direction: 'outbound',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    summary: 'Follow-up call regarding appointment',
    sentiment: 'neutral',
  },
  {
    id: '3',
    caller: '+998 93 345 6789',
    duration: '0:45',
    status: 'missed',
    direction: 'inbound',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    summary: 'Missed call - no voicemail',
    sentiment: 'neutral',
  },
  {
    id: '4',
    caller: '+998 94 456 7890',
    duration: '5:12',
    status: 'completed',
    direction: 'inbound',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    summary: 'Support request - billing issue resolved',
    sentiment: 'positive',
  },
  {
    id: '5',
    caller: '+998 95 567 8901',
    duration: '2:30',
    status: 'completed',
    direction: 'inbound',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    summary: 'Product inquiry - forwarded to sales',
    sentiment: 'neutral',
  },
]

function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [directionFilter, setDirectionFilter] = useState('all')

  const filteredCalls = mockCalls.filter((call) => {
    const matchesSearch =
      call.caller.includes(searchQuery) ||
      call.summary.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Total Calls</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockCalls.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {mockCalls.filter((c) => c.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Missed</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {mockCalls.filter((c) => c.status === 'missed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Avg Duration</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2:34</p>
          </CardContent>
        </Card>
      </div>

      {/* Call List */}
      <div className="space-y-3">
        {filteredCalls.length === 0 ? (
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
            <Card key={call.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{call.caller}</p>
                        <Badge variant="outline" className={getStatusColor(call.status)}>
                          {call.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getDirectionIcon(call.direction)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{call.summary}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {call.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(call.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Play className="w-4 h-4" />
                      Play
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/$agentId/history')({
  component: HistoryPage,
})
