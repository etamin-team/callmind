import * as React from 'react'
import { Bot, PieChart, Settings2 } from 'lucide-react'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { NavMain } from './NavMain'
import { TeamSwitcher } from './TeamSwitcher'
import { SidebarFooterComponent } from './SidebarFooter'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ className, ...props }: AppSidebarProps) {
  const { t } = useTranslation()
  const { workspaceId } = useParams({ from: '/_app/$workspaceId' })
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const data = {
    navMain: [
      {
        title: t('app.nav.agents'),
        url: `/${workspaceId}/agents`,
        icon: Bot,
      },
      {
        title: t('app.nav.usage'),
        url: `/${workspaceId}/usage`,
        icon: PieChart,
      },
      {
        title: t('app.nav.workspace_settings'),
        url: `/${workspaceId}/settings`,
        icon: Settings2,
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
      },
    ],
  }

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className={cn(
        '[&_[data-slot=sidebar-inner]]:border-r [&_[data-slot=sidebar-inner]]:border-sidebar-border/80 [&_[data-slot=sidebar-inner]]:bg-sidebar [&_[data-slot=sidebar-inner]]:text-sidebar-foreground',
        'supports-[backdrop-filter]:[&_[data-slot=sidebar-inner]]:bg-sidebar/70 supports-[backdrop-filter]:[&_[data-slot=sidebar-inner]]:backdrop-blur-2xl',
        '[&_[data-slot=sidebar-header]]:bg-transparent [&_[data-slot=sidebar-footer]]:bg-transparent [&_[data-slot=sidebar-content]]:bg-transparent',
        className,
      )}
      {...props}
    >
      <SidebarHeader className="px-3 pb-0 pt-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <TeamSwitcher />
          </div>
          <SidebarTrigger className="shrink-0 rounded-xl border border-sidebar-border/60 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        </div>
        {!isCollapsed && (
          <p className="px-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-sidebar-foreground/55">
            {t('app.nav.navigation')}
          </p>
        )}
      </SidebarHeader>
      <SidebarContent className="px-3 pb-4 pt-2">
        <div className="-mx-1">
          <TeamSwitcher />
        </div>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="px-3 pb-4 pt-0">
        <SidebarFooterComponent />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
