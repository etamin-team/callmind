import { MessageSquare, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from './StatCard'
import { ActivityListItem } from './ActivityListItem'
import { useDashboardStats, useRecentActivity } from '../queries'
import { useUser } from '@clerk/clerk-react'

export function DashboardOverview() {
  const { user } = useUser()
  const { data: stats } = useDashboardStats()
  const { data: recentActivity } = useRecentActivity()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {user?.firstName}! 
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Here's a look at what's happening with your AI agent today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Interactions"
          value={stats?.totalInteractions || '0'}
          description="+12.5% from last month"
          icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
          trend="↗"
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || '0'}
          description="Currently online"
          icon={<Users className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          title="Response Rate"
          value={stats?.responseRate || '0%'}
          description="Average accuracy"
          icon={<CheckCircle className="h-5 w-5 text-indigo-500" />}
          trend="↗"
        />
        <StatCard
          title="Avg Response Time"
          value={stats?.avgResponseTime || '0s'}
          description="Faster than last week"
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          trend="↘"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>
              A snapshot of your agent's activity over the last 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 italic">Advanced analytics visualization coming soon...</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your session
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              View all
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity?.map((activity) => (
                <ActivityListItem key={activity.id} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
