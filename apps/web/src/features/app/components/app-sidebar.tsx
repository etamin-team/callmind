import * as React from "react"
import {
  Brain,
  Settings,
  TrendingUp,
  Sparkles,
  ChartPie
} from "lucide-react"
import { useParams } from '@tanstack/react-router'

import { NavMain } from "./NavMain"
import { NavUser } from "./NavUser"
import { TeamSwitcher } from "./TeamSwitcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { workspaceId } = useParams({ from: '/_app/$workspaceId' })
  
  const data = {
    navMain: [
      {
        title: "Agents",
        url: `/${workspaceId}/agents`,
        icon: Sparkles,
      },
      {
        title: "Usage",
        url: `/${workspaceId}/usage`,
        icon: ChartPie,
      },
      {
        title: "Workspace settings",
        url: `/${workspaceId}/settings`,
        icon: Settings,
        items: [
          {
            title: "General",
            url: `/${workspaceId}/settings/general`,
          },
          {
            title: "Members",
            url: `/${workspaceId}/settings/members`,
          },
          {
            title: "Billing",
            url: `/${workspaceId}/settings/billing`,
          },
          {
            title: "Notifications",
            url: `/${workspaceId}/settings/notifications`,
          },
          {
            title: "Security",
            url: `/${workspaceId}/settings/security`,
          },
        ],
      }
    ],
  }
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain 
          items={data.navMain} 
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
