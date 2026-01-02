import { Plus, Search, Bell, ChevronDown, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MonthlyLimit {
  name: string
  current: number | string
  total: number | string
  unit?: string
  status?: 'locked' | 'lifetime'
}

interface RecentQuery {
  id: string
  query: string
  age: string
  duration: string
}

export default function Overview() {
  const monthlyLimits: MonthlyLimit[] = [
    { name: 'Queries', current: 50, total: 100 },
    { name: 'Indexing', current: 2, total: 5 },
    { name: 'Research', current: '—', total: 10, status: 'locked' },
    { name: 'Web Search', current: 20, total: 50 },
    { name: 'Packages', current: 50, total: 100 },
    { name: 'Oracle', current: '—', total: 10, status: 'locked' },
    { name: 'Contexts', current: 5, total: 10 },
  ]

  const recentQueries: RecentQuery[] = [
    { id: '1', query: 'React useState hook examples', age: '2 minutes ago', duration: '0.8s' },
    { id: '2', query: 'Python pandas dataframe filtering', age: '15 minutes ago', duration: '1.2s' },
    { id: '3', query: 'Express.js middleware patterns', age: '1 hour ago', duration: '0.6s' },
    { id: '4', query: 'Next.js partial prerendering configuration', age: '2 hours ago', duration: '1.5s' },
    { id: '5', query: 'TypeScript generic types tutorial', age: '3 hours ago', duration: '0.9s' },
  ]

  const getProgressPercentage = (current: number | string, total: number | string) => {
    if (typeof current !== 'number' || typeof total !== 'number') return 0
    return (current / total) * 100
  }

  const getUsageTrend = (name: string) => {
    // Mock trend data
    const trends: Record<string, 'up' | 'down' | 'neutral'> = {
      'Queries': 'up',
      'Indexing': 'neutral',
      'Web Search': 'down',
      'Packages': 'up',
      'Contexts': 'neutral'
    }
    return trends[name] || 'neutral'
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />
      default: return <Minus className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground">Welcome back, Abror Free</p>
        </div>

        {/* Monthly Limits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Limits (Remaining)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {monthlyLimits.map((limit, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{limit.name}</span>
                    <div className="flex items-center gap-2">
                      {limit.status === 'locked' && (
                        <Badge variant="outline" className="text-xs">
                          Upgrade to unlock
                        </Badge>
                      )}
                      {limit.unit === 'lifetime' && (
                        <Badge variant="secondary" className="text-xs">
                          lifetime
                        </Badge>
                      )}
                      {getTrendIcon(getUsageTrend(limit.name))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{limit.current}</span>
                    <span className="text-muted-foreground">/ {limit.total}</span>
                  </div>
                  {typeof limit.current === 'number' && typeof limit.total === 'number' && (
                    <Progress 
                      value={getProgressPercentage(limit.current, limit.total)} 
                      className="h-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Usage and Recent Queries */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* API Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>API usage (7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Total queries</div>
                  <div className="text-xs text-red-500">-100% from last period</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground">
                  3 queries, Sun, Dec 28
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Queries */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Queries</CardTitle>
                <Button variant="link" size="sm" className="text-blue-600">
                  View all
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentQueries.map((query) => (
                  <div key={query.id} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{query.query}</p>
                      <p className="text-xs text-muted-foreground">{query.age}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{query.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="codebases" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="codebases">Codebases</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
                <TabsTrigger value="contexts">Contexts</TabsTrigger>
              </TabsList>

              <TabsContent value="codebases" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    0 repositories
                  </div>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Email notification when indexing completes</span>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search repositories" 
                      className="pl-10"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="indexed">Indexed</SelectItem>
                      <SelectItem value="indexing">Indexing</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <p>No repositories found</p>
                  <p className="text-sm">Add your first repository to get started</p>
                </div>
              </TabsContent>

              <TabsContent value="documentation" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    0 documentation sources
                  </div>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <p>No documentation sources found</p>
                  <p className="text-sm">Add documentation to enhance search results</p>
                </div>
              </TabsContent>

              <TabsContent value="contexts" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    0 contexts
                  </div>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <p>No contexts found</p>
                  <p className="text-sm">Create contexts to organize your knowledge</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
