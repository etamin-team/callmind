import { createFileRoute, Link } from "@tanstack/react-router"
import {
  Bell,
  Home,
  Settings,
  Users,
  BarChart3,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  MoreVertical,
  type LucideIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "#/components/ui/sidebar"

const menuItems: {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
}[] = [
  { title: "Home", url: "/dashboard", icon: Home, isActive: true },
  { title: "Calls", url: "/dashboard/calls", icon: Phone },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Team", url: "/dashboard/team", icon: Users },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
]

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
})

function useDashboardData() {
  const stats = [
    { title: "Total Calls", value: "1,234", change: "+12.5%", trend: "up", icon: PhoneCall },
    { title: "Avg Duration", value: "4m 32s", change: "-2.4%", trend: "down", icon: Clock },
    { title: "Success Rate", value: "94.2%", change: "+1.2%", trend: "up", icon: Target },
    { title: "Active Users", value: "89", change: "+14.0%", trend: "up", icon: Users },
  ];

  const recentCalls = [
    { id: 1, name: "John Smith", number: "+1 (555) 123-4567", type: "inbound", duration: "5m 23s", status: "completed", time: "2 min ago", avatar: "JS" },
    { id: 2, name: "Sarah Johnson", number: "+1 (555) 987-6543", type: "outbound", duration: "3m 45s", status: "completed", time: "15 min ago", avatar: "SJ" },
    { id: 3, name: "Mike Brown", number: "+1 (555) 456-7890", type: "inbound", duration: "0s", status: "missed", time: "1 hour ago", avatar: "MB" },
    { id: 4, name: "Emily Davis", number: "+1 (555) 234-5678", type: "outbound", duration: "8m 01s", status: "completed", time: "2 hours ago", avatar: "ED" },
    { id: 5, name: "Alex Wilson", number: "+1 (555) 876-5432", type: "inbound", duration: "12m 45s", status: "completed", time: "3 hours ago", avatar: "AW" },
  ];

  return { stats, recentCalls };
}

function DashboardComponent() {
  const { stats, recentCalls } = useDashboardData();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1 mt-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
              <Phone className="size-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">Callmind</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4">Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="size-4" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button type="button" className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="size-4" />
                    <span className="font-medium">Notifications</span>
                  </div>
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-muted/10">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md px-4 sticky top-0 z-10 transition-colors">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
          <div className="flex flex-1 items-center justify-between ml-2">
            <div className="text-sm font-semibold tracking-tight">Dashboard</div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search calls..."
                  className="rounded-full bg-muted/50 pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background border border-transparent focus:border-border transition-all w-64"
                />
              </div>
              <button
                type="button"
                className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
              </button>
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 text-primary border border-primary/20 shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
                <span className="text-xs font-bold">JD</span>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-8 animate-appear">
            
            {/* Welcome Section */}
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-border/50 pb-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, John 👋</h2>
                <p className="text-muted-foreground mt-1">
                  Here's an overview of your call center performance today.
                </p>
              </div>
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 bg-background border px-3 py-1.5 rounded-full mt-4 md:mt-0 shadow-sm">
                <Clock className="h-4 w-4 text-primary" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="relative flex items-center justify-between mb-4">
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground shadow-sm transition-all duration-300 ease-out">
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <span 
                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${
                        stat.trend === 'up' 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900' 
                          : 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900'
                      }`}
                    >
                      {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.change}
                    </span>
                  </div>
                  <div className="relative">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b px-6 py-5 bg-muted/30">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold tracking-tight">Recent Calls</h3>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full border border-primary/20 shadow-sm">{recentCalls.length}</span>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
              <div className="divide-y divide-border/50">
                {recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-muted/40 transition-colors gap-4 sm:gap-0"
                  >
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="relative flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/10 font-bold shadow-sm">
                        {call.avatar}
                        <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-card bg-card p-[1px]">
                          {call.type === 'inbound' ? 
                            <PhoneIncoming className="h-3 w-3 text-blue-500" /> : 
                            <PhoneOutgoing className="h-3 w-3 text-emerald-500" />
                          }
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">{call.name}</p>
                        <p className="text-xs text-muted-foreground font-medium font-mono mt-0.5">
                          {call.number}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground min-w-[120px]">
                      <Clock className="h-4 w-4 opacity-70" />
                      {call.duration}
                    </div>

                    <div className="text-sm text-muted-foreground font-medium min-w-[100px]">
                      {call.time}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[140px]">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          call.status === "completed"
                            ? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                            : "bg-red-100/80 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                        }`}
                      >
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${call.status === "completed" ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"}`}></span>
                        {call.status}
                      </span>
                      <button className="text-muted-foreground/50 hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted ml-2 focus:outline-none focus:ring-2 focus:ring-primary/20 opacity-0 group-hover:opacity-100">
                         <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

