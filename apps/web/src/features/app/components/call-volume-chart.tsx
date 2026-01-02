import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CallVolumeChartProps {
  data?: Array<{
    hour: string
    actual: number
    forecast: number
  }>
}

export default function CallVolumeChart({ data }: CallVolumeChartProps) {
  // Mock data - in real app this would come from API
  const mockData = [
    { hour: '08:00', actual: 45, forecast: 50 },
    { hour: '09:00', actual: 78, forecast: 75 },
    { hour: '10:00', actual: 92, forecast: 85 },
    { hour: '11:00', actual: 88, forecast: 90 },
    { hour: '12:00', actual: 65, forecast: 70 },
    { hour: '13:00', actual: 72, forecast: 68 },
    { hour: '14:00', actual: 95, forecast: 92 },
    { hour: '15:00', actual: 108, forecast: 100 },
    { hour: '16:00', actual: 98, forecast: 95 },
    { hour: '17:00', actual: 85, forecast: 88 },
    { hour: '18:00', actual: 62, forecast: 65 }
  ]

  const chartData = data || mockData

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Call Volume vs Forecast</CardTitle>
          <Button variant="outline" size="sm">
            Last 24 Hours
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Actual Volume"
              />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#9ca3af" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#9ca3af', r: 4 }}
                activeDot={{ r: 6 }}
                name="Forecast"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
