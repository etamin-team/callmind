import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Clock, DollarSign, TrendingUp, Loader2 } from 'lucide-react'

interface UsageStatsProps {
  totalCalls: number
  totalMinutes: number
  totalCost: number
  avgCostPerCall: number
  isLoading?: boolean
}

function StatCard({
  title,
  value,
  icon: Icon,
  suffix = '',
  isLoading = false,
}: {
  title: string
  value: number | string
  icon: typeof Phone
  suffix?: string
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const displayValue = typeof value === 'number' ? value.toLocaleString() : value

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {displayValue}
          {suffix}
        </div>
      </CardContent>
    </Card>
  )
}

export function UsageStats({
  totalCalls,
  totalMinutes,
  totalCost,
  avgCostPerCall,
  isLoading = false,
}: UsageStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Calls"
        value={totalCalls}
        icon={Phone}
        isLoading={isLoading}
      />
      <StatCard
        title="Minutes Used"
        value={totalMinutes}
        icon={Clock}
        isLoading={isLoading}
      />
      <StatCard
        title="Total Cost"
        value={totalCost}
        suffix=""
        icon={DollarSign}
        isLoading={isLoading}
      />
      <StatCard
        title="Avg Cost/Call"
        value={`$${avgCostPerCall.toFixed(2)}`}
        icon={TrendingUp}
        isLoading={isLoading}
      />
    </div>
  )
}