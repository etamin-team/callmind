import { Activity, MessageSquare, TrendingUp, Users, Settings, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DashboardSidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  ]

  const footerItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-72 border-r bg-white dark:bg-slate-900 sticky top-[73px] h-[calc(100vh-73px)]">
      <div className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'secondary' : 'ghost'}
            className={cn(
              "w-full justify-start font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
              activeTab === item.id && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
            )}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className={cn("mr-3 h-5 w-5", activeTab === item.id ? "text-primary" : "text-slate-400")} />
            {item.label}
          </Button>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
        {footerItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className="w-full justify-start font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <item.icon className="mr-3 h-5 w-5 text-slate-400" />
            {item.label}
          </Button>
        ))}
      </div>
    </aside>
  )
}
