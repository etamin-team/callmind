import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { UsageStats } from '../components/usage-stats'
import { UsageChart } from '../components/usage-chart'
import { UsageBreakdown } from '../components/usage-breakdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { useUsageStore } from '../store'

const PERIOD_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
]

export default function UsagePage() {
  const { getToken } = useAuth()
  const {
    stats,
    trends,
    agentUsage,
    recentActivity,
    billingInfo,
    isLoading,
    error,
    period,
    fetchAll,
    setPeriod,
    exportData,
    clearError,
  } = useUsageStore()

  const [isExporting, setIsExporting] = useState(false)

  // Load data on mount and when period changes
  useEffect(() => {
    const loadData = async () => {
      const token = await getToken()
      if (token) {
        try {
          await fetchAll(token, period)
        } catch (err) {
          console.error('Failed to load usage data:', err)
        }
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  useEffect(() => {
    document.title = 'Usage - Callmind'
  }, [])

  const handlePeriodChange = (value: string) => {
    setPeriod(parseInt(value))
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const token = await getToken()
      if (token) {
        await exportData(token, period)
      }
    } catch (err) {
      console.error('Failed to export usage data:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleRetry = () => {
    clearError()
    const loadData = async () => {
      const token = await getToken()
      if (token) {
        await fetchAll(token, period)
      }
    }
    loadData()
  }

  // Loading state
  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading usage data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load usage data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetry}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usage</h1>
            <p className="text-muted-foreground">
              Monitor your AI agent usage and costs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period.toString()} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-36">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleExport}
              size="sm"
              className="gap-2"
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export
            </Button>
          </div>
        </div>

        {/* Billing Info Banner */}
        {billingInfo && (
          <Card className="mb-4 bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Current Plan: <span className="capitalize">{billingInfo.plan}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {billingInfo.credits} credits remaining
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    This month: {billingInfo.usage.totalCalls} calls • {billingInfo.usage.totalMinutes} min
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${billingInfo.usage.totalCost.toFixed(2)} spent
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <UsageStats
          totalCalls={stats?.totalCalls ?? 0}
          totalMinutes={stats?.totalMinutes ?? 0}
          totalCost={stats?.totalCost ?? 0}
          avgCostPerCall={stats?.avgCostPerCall ?? 0}
          isLoading={isLoading}
        />
      </div>

      {/* Charts and Breakdown */}
      <div className="grid gap-6 md:grid-cols-5">
        <UsageChart data={trends} isLoading={isLoading} />
        <UsageBreakdown agents={agentUsage} isLoading={isLoading} />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Usage Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && recentActivity.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity found. Make some calls to see usage data here.
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={activity.callId || index}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.agentName}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{activity.duration}</p>
                    <p className="text-xs text-muted-foreground">{activity.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error banner (non-blocking) */}
      {error && stats && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm">{error}</p>
              <Button variant="ghost" size="sm" onClick={handleRetry} className="ml-auto">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}