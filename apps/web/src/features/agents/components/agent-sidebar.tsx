import { Link, useMatches, useParams } from '@tanstack/react-router'
import { 
  Bot, 
  Activity, 
  BarChart2, 
  Database, 
  Zap, 
  Users, 
  Rocket, 
  Settings,
  Play
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: Play, label: 'Playground', to: '.' },
  { icon: Activity, label: 'Activity', to: './activity', disabled: true },
  { icon: BarChart2, label: 'Analytics', to: './analytics', disabled: true },
  { icon: Database, label: 'Sources', to: './sources', disabled: true },
  { icon: Zap, label: 'Actions', to: './actions', disabled: true },
  { icon: Users, label: 'Contacts', to: './contacts', disabled: true },
  { icon: Rocket, label: 'Deploy', to: './deploy', disabled: true },
  { icon: Settings, label: 'Settings', to: './settings', disabled: true },
]

export function AgentSidebar() {
  const { workspaceId, agentId } = useParams({ from: '/_app/$workspaceId/agents/$agentId' })
  
  return (
    <div className="w-64 border-r h-full bg-card flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 font-semibold">
           {/* Link back to Agents list */}
           <Link to="/$workspaceId/agents" params={{ workspaceId }} className="text-muted-foreground hover:text-foreground transition-colors">
             <Bot className="w-5 h-5" />
           </Link>
           <span className="text-sm text-muted-foreground">/</span>
           <span className="truncate">Agent Dashboard</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            disabled={item.disabled}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              "text-muted-foreground hover:text-foreground hover:bg-accent",
              item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground",
              "[&.active]:bg-primary/10 [&.active]:text-primary"
            )}
            activeOptions={{ exact: item.to === '.' }}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
         <div className="rounded-lg bg-muted/50 p-4">
            <h4 className="font-medium text-sm mb-1">Credits used</h4>
            <div className="flex items-end gap-1 mb-2">
               <span className="text-2xl font-bold">1</span>
               <span className="text-muted-foreground text-sm mb-1">/ 50</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
               <div className="h-full bg-primary w-[2%]" />
            </div>
             <p className="text-xs text-muted-foreground mt-2">Resets on Feb 1</p>
         </div>
      </div>
    </div>
  )
}
