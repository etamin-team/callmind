import { Clock, Phone, TrendingDown, TrendingUp, Users } from 'lucide-react'

import AgentStatusChart from './agent-status-chart'
import AIInsights from './ai-insights'
import CallVolumeChart from './call-volume-chart'
import LiveOperations from './live-operations'
import MetricCard from './metric-card'

export default function CallCenterDashboard() {
  const metrics = [
    {
      title: 'Total Calls Today',
      value: '1,240',
      change: '+12%',
      changeType: 'positive' as const,
      icon: <Phone className="h-4 w-4" />,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Agents',
      value: '42/50',
      change: '95% Available',
      changeType: 'positive' as const,
      icon: <Users className="h-4 w-4" />,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Avg Wait Time',
      value: '1m 45s',
      change: '+5s',
      changeType: 'negative' as const,
      icon: <Clock className="h-4 w-4" />,
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      title: 'AI Sentiment Score',
      value: '8.4/10',
      change: '+0.2',
      changeType: 'positive' as const,
      icon: <TrendingUp className="h-4 w-4" />,
      gradient: 'from-purple-500 to-pink-500'
    }
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Call center operations overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CallVolumeChart />
        <AgentStatusChart />
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LiveOperations />
        <AIInsights />
      </div>
    </div>
  )
}
