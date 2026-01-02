import { TrendingDown, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  gradient?: string
}

export default function MetricCard({ title, value, change, changeType = 'neutral', icon }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="size-4" />
      case 'negative': return <TrendingDown className="size-4" />
      default: return null
    }
  }

  const getFooterText = () => {
    switch (title) {
      case 'Total Calls Today':
        return { text: 'Strong call volume today', icon: getTrendIcon(), description: 'Above daily average' }
      case 'Active Agents':
        return { text: 'High agent availability', icon: getTrendIcon(), description: 'Optimal staffing levels' }
      case 'Avg Wait Time':
        return { text: 'Slight increase in wait time', icon: getTrendIcon(), description: 'Monitor queue length' }
      case 'AI Sentiment Score':
        return { text: 'Positive customer sentiment', icon: getTrendIcon(), description: 'AI performing well' }
      default:
        return { text: 'Performing as expected', icon: null, description: 'Normal operations' }
    }
  }

  const footer = getFooterText()

  return (
    <Card className="@container/card from-primary/5 to-card bg-gradient-to-t shadow-xs">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {change && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {getTrendIcon()}
              {change}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {footer.text} {footer.icon}
        </div>
        <div className="text-muted-foreground">
          {footer.description}
        </div>
      </CardFooter>
    </Card>
  )
}
