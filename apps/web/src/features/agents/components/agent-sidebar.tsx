import { Link, useParams, useLocation } from '@tanstack/react-router'
import { Settings, Phone, History, Users, BarChart3, FileText, ChevronLeft, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { useUserStore } from '@/features/users/store'

const menuItems = [
  { icon: Phone, label: 'Make Call', to: '/$workspaceId/agents/$agentId' },
  { icon: History, label: 'Call History', to: '/$workspaceId/agents/$agentId/history' },
  { icon: Users, label: 'Contacts', to: '/$workspaceId/agents/$agentId/contacts' },
  { icon: FileText, label: 'Knowledge Base', to: '/$workspaceId/agents/$agentId/knowledge', disabled: true },
  { icon: BarChart3, label: 'Analytics', to: '/$workspaceId/agents/$agentId/analytics', disabled: true },
  { icon: Settings, label: 'Settings', to: '/$workspaceId/agents/$agentId/settings' },
]

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  starter: 50,
  professional: 125,
  enterprise: 500,
}

export function AgentSidebar() {
  const { workspaceId, agentId } = useParams({ from: '/_app/$workspaceId/agents/$agentId' })
  const location = useLocation()
  const { credits, plan } = useUserStore()
  const maxCredits = PLAN_LIMITS[plan] || 10
  const percentage = (credits / maxCredits) * 100

  return (
    <div className="w-64 border-r h-screen bg-card/50 backdrop-blur-xl flex flex-col fixed left-0 top-0">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Link 
            to="/$workspaceId/agents" 
            params={{ workspaceId }}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Agent</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === `/${workspaceId}/agents/${agentId}` 
            ? item.to === '/$workspaceId/agents/$agentId'
            : location.pathname.includes(item.to.replace('/$workspaceId/agents/$agentId', ''))
          
          return (
            <div key={item.label}>
              {item.disabled ? (
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg",
                    "text-muted-foreground/50 cursor-not-allowed"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-muted">Soon</span>
                </div>
              ) : (
                <Link
                  to={item.to}
                  params={{ workspaceId, agentId }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                    "hover:bg-accent hover:text-foreground",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-sm" 
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive && "text-primary")} />
                  {item.label}
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      {/* Credits Section */}
      <div className="p-4 border-t">
        <div className="rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium capitalize">{plan} Plan</span>
            <span className="text-xs text-muted-foreground">{credits} left</span>
          </div>
          <div className="flex items-end gap-1.5 mb-3">
            <span className="text-2xl font-bold">{credits}</span>
            <span className="text-muted-foreground text-sm mb-1">/ {maxCredits}</span>
          </div>
          <Progress value={percentage} className="h-1.5" />
        </div>
      </div>
    </div>
  )
}
