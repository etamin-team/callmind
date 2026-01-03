import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface UsageData {
  date: string
  calls: number
  minutes: number
  cost: number
}

interface UsageChartProps {
  data: UsageData[]
}

export function UsageChart({ data }: UsageChartProps) {
  const [chartType, setChartType] = useState<'calls' | 'minutes' | 'cost'>('calls')

  const chartConfig = {
    calls: {
      label: 'Calls',
      color: '#3b82f6',
      dataKey: 'calls',
    },
    minutes: {
      label: 'Minutes',
      color: '#10b981',
      dataKey: 'minutes',
    },
    cost: {
      label: 'Cost ($)',
      color: '#f59e0b',
      dataKey: 'cost',
    },
  }

  const currentConfig = chartConfig[chartType]

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Usage Trends</CardTitle>
        <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="calls">Calls</SelectItem>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="cost">Cost</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
              }}
            />
            <Line
              type="monotone"
              dataKey={currentConfig.dataKey}
              stroke={currentConfig.color}
              strokeWidth={2}
              dot={{ fill: currentConfig.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}