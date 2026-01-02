import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AgentStatusData {
  status: string
  count: number
  color: string
  [key: string]: any // Add index signature for Recharts compatibility
}

interface AgentStatusChartProps {
  data?: Array<AgentStatusData>
  total?: number
}

export default function AgentStatusChart({ data, total }: AgentStatusChartProps) {
  // Mock data - in real app this would come from API
  const mockData: Array<AgentStatusData> = [
    { status: 'Available', count: 32, color: '#10b981' },
    { status: 'Busy/On Call', count: 5, color: '#ef4444' },
    { status: 'Away/Break', count: 5, color: '#f59e0b' },
    { status: 'Offline', count: 8, color: '#6b7280' }
  ]

  const chartData = data || mockData
  const totalAgents = total || chartData.reduce((sum, item) => sum + item.count, 0)

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Don't show label for small segments

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
                formatter={(value: any, name?: string) => [
                  `${value} agents`,
                  chartData.find(d => d.count === value)?.status || name || ''
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend with details */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {chartData.map((segment, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{segment.status}</span>
                  <span className="text-sm font-medium">{segment.count}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {((segment.count / totalAgents) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
