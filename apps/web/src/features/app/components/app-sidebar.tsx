import * as React from "react"
import {
  Settings,
  Sparkles,
  ChartPie
} from "lucide-react"
import { useParams } from '@tanstack/react-router'
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()
  const { workspaceId } = useParams({ from: '/_app/$workspaceId' })
  
  const data = {
    navMain: [
      {
        title: t('app.nav.agents'),
        url: `/${workspaceId}/agents`,
        icon: Sparkles,
      },
      {
        title: t('app.nav.usage'),
        url: `/${workspaceId}/usage`,
        icon: ChartPie,
      },
      {
        title: t('app.nav.workspace_settings'),
        url: `/${workspaceId}/settings`,
        icon: Settings,
        items: [
          {
            title: t('app.nav.settings_general'),
            url: `/${workspaceId}/settings/general`,
          },
          {
            title: t('app.nav.settings_members'),
            url: `/${workspaceId}/settings/members`,
          },
          {
            title: t('app.nav.settings_billing'),
            url: `/${workspaceId}/settings/billing`,
          },
          {
            title: t('app.nav.settings_notifications'),
            url: `/${workspaceId}/settings/notifications`,
          },
          {
            title: t('app.nav.settings_security'),
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
