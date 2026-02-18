import { createFileRoute } from '@tanstack/react-router'
import { Phone, Clock, Calendar, User, Play, Pause, ArrowLeft, FileText, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from '@tanstack/react-router'
import { getCall } from '@/features/call-history/api'
import { CallHistory } from '@repo/types'

function CallDetailPage() {
  const { agentId, callId } = Route.useParams()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [call, setCall] = useState<CallHistory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const fetchCall = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const token = await getToken()

        if (!token) {
          throw new Error('No authentication token')
        }

        const callData = await getCall(callId, token)
        setCall(callData)
      } catch (err) {
        console.error('Error fetching call:', err)
        setError('Failed to load call details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCall()
  }, [callId, getToken])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

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

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊'
      case 'negative':
        return '😞'
      default:
        return '😐'
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading call details...</p>
        </div>
      </div>
    )
  }

  if (error || !call) {
    return (
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/$workspaceId/agents/$agentId/history', params: { workspaceId: 'default', agentId } })}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-2">{error || 'Call not found'}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/$workspaceId/agents/$agentId/history', params: { workspaceId: 'default', agentId } })}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Call Details</h1>
        </div>
      </div>

      {/* Call Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {call.callerNumber || call.callerName || 'Unknown Caller'}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getStatusColor(call.status)}>
                    {call.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {call.direction === 'inbound' ? '↓ Inbound' : '↑ Outbound'}
                  </Badge>
                  {call.sentiment && (
                    <span className={getSentimentColor(call.sentiment)}>
                      {getSentimentIcon(call.sentiment)} {call.sentiment}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {call.recordingUrl && (
              <div className="flex items-center gap-2">
                <audio
                  ref={audioRef}
                  src={call.recordingUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <Button onClick={handlePlayPause} className="gap-2">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play Recording'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {call.duration ? `${Math.floor(call.duration / 60)}:${String(call.duration % 60).padStart(2, '0')}` : '0:00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Started At</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {call.startedAt ? new Date(call.startedAt).toLocaleString() : 'Unknown'}
              </p>
            </div>
            {call.cost !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cost</p>
                <p className="font-medium">${call.cost.toFixed(2)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {call.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{call.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      {call.transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              <p className="whitespace-pre-wrap text-sm">{call.transcript}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collected Data */}
      {call.collectedData && Object.keys(call.collectedData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              Collected Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              {Object.entries(call.collectedData).map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <dt className="text-sm text-muted-foreground capitalize">{key}</dt>
                  <dd className="font-medium">{value as string}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Topics */}
      {call.topics && call.topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Topics Discussed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {call.topics.map((topic, index) => (
                <Badge key={index} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/$agentId/history/$callId')({
  component: CallDetailPage,
})
