import { Link, useLocation, useParams } from '@tanstack/react-router'
import {
  BarChart3,
  ChevronLeft,
  ChevronDown,
  FileText,
  History,
  Phone,
  Settings,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAgentStore } from '../store'

const menuItems = [
  { icon: Phone, label: 'Make Call', to: '/$workspaceId/agents/$agentId' },
  {
    icon: History,
    label: 'Call History',
    to: '/$workspaceId/agents/$agentId/history',
  },
  {
    icon: Users,
    label: 'Contacts',
    to: '/$workspaceId/agents/$agentId/contacts',
  },
  {
    icon: FileText,
    label: 'Knowledge Base',
    to: '/$workspaceId/agents/$agentId/knowledge',
    disabled: true,
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    to: '/$workspaceId/agents/$agentId/analytics',
    disabled: true,
  },
  {
    icon: Settings,
    label: 'Settings',
    to: '/$workspaceId/agents/$agentId/settings',
  },
]

export function AgentSidebar() {
  const { workspaceId, agentId } = useParams({
    from: '/_app/$workspaceId/agents/$agentId',
  })
  const location = useLocation()
  const { currentAgent } = useAgentStore()

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-sidebar-border/70 bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border/60 px-4 pb-4 pt-4">
        <div className="flex items-center gap-3">
          <Link
            to="/$workspaceId/agents"
            params={{ workspaceId }}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-sidebar-border/70 text-sidebar-foreground transition-colors hover:bg-background/80"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <div className="min-w-0 flex flex-1 items-center gap-3 overflow-hidden">
            <span className="text-sidebar-foreground/25">/</span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight">
                {currentAgent?.name || 'Agent'}
              </p>
            </div>
          </div>
        </div>
        <p className="px-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/45">
          Navigation
        </p>
      </div>

      <nav className="flex-1 px-4 py-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const targetPath = item.to
              .replace('$workspaceId', workspaceId)
              .replace('$agentId', agentId)

            const isActive =
              location.pathname === targetPath ||
              (targetPath !== `/${workspaceId}/agents/${agentId}` &&
                location.pathname.startsWith(targetPath))

            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/40"
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-full border border-sidebar-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Soon
                  </span>
                </div>
              )
            }

            return (
              <Link
                key={item.label}
                to={item.to}
                params={{ workspaceId, agentId }}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-background text-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-background/60 hover:text-foreground',
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Settings' && !isActive && (
                  <ChevronDown className="size-4 text-sidebar-foreground/35" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
