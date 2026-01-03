import * as React from "react"
import {
  Brain,
  Settings,
  TrendingUp,
} from "lucide-react"

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

const data = {
  navMain: [
    {
      title: "Agents",
      url: "/agents",
      icon: Brain,
    },
    {
      title: "Usage",
      url: "/usage",
      icon: TrendingUp,
    },
    {
      title: "Workspace settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "General",
          url: "/settings/general",
        },
        {
          title: "Members",
          url: "/settings/members",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
        },
        {
          title: "Security",
          url: "/settings/security",
        },
      ],
    }
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
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
