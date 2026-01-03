import { useEffect, useState } from 'react'
import { UsageStats } from '../components/usage-stats'
import { UsageChart } from '../components/usage-chart'
import { UsageBreakdown } from '../components/usage-breakdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Calendar } from 'lucide-react'

// Mock data for the usage page
const mockUsageData = [
  { date: 'Jan 1', calls: 45, minutes: 120, cost: 12.50 },
  { date: 'Jan 2', calls: 52, minutes: 145, cost: 15.20 },
  { date: 'Jan 3', calls: 48, minutes: 132, cost: 13.80 },
  { date: 'Jan 4', calls: 61, minutes: 168, cost: 17.60 },
  { date: 'Jan 5', calls: 55, minutes: 152, cost: 15.90 },
  { date: 'Jan 6', calls: 67, minutes: 185, cost: 19.40 },
  { date: 'Jan 7', calls: 73, minutes: 201, cost: 21.10 },
]

const mockAgentUsage = [
  {
    agentId: '1',
    agentName: 'Customer Support Bot',
    calls: 234,
    minutes: 485,
    cost: 48.50,
    percentage: 35,
  },
  {
    agentId: '2',
    agentName: 'Sales Assistant',
    calls: 189,
    minutes: 378,
    cost: 37.80,
    percentage: 28,
  },
  {
    agentId: '3',
    agentName: 'Technical Support',
    calls: 156,
    minutes: 312,
    cost: 31.20,
    percentage: 23,
  },
  {
    agentId: '4',
    agentName: 'Billing Assistant',
    calls: 89,
    minutes: 178,
    cost: 17.80,
    percentage: 14,
  },
]

export default function UsagePage() {
  useEffect(() => {
    document.title = 'Usage - Callmind'
  }, [])

  const handleExport = () => {
    // In a real app, this would export usage data
    console.log('Exporting usage data...')
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
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Last 30 days
            </Button>
            <Button onClick={handleExport} size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <UsageStats
          totalCalls={668}
          totalMinutes={1453}
          totalCost={145.30}
          avgCostPerCall={0.22}
        />
      </div>

      {/* Charts and Breakdown */}
      <div className="grid gap-6 md:grid-cols-5">
        <UsageChart data={mockUsageData} />
        <UsageBreakdown agents={mockAgentUsage} />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Usage Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { agent: 'Customer Support Bot', time: '2 minutes ago', duration: '3m 24s', cost: '$0.34' },
              { agent: 'Sales Assistant', time: '5 minutes ago', duration: '2m 18s', cost: '$0.23' },
              { agent: 'Technical Support', time: '8 minutes ago', duration: '4m 45s', cost: '$0.48' },
              { agent: 'Customer Support Bot', time: '12 minutes ago', duration: '1m 52s', cost: '$0.19' },
              { agent: 'Billing Assistant', time: '15 minutes ago', duration: '2m 33s', cost: '$0.25' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{activity.agent}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{activity.duration}</p>
                  <p className="text-xs text-muted-foreground">{activity.cost}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}