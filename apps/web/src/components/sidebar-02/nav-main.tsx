'use client'

import { Link, useLocation } from '@tanstack/react-router'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuItem as SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

export type Route = {
  id: string
  title: string
  icon?: React.ReactNode
  link: string
  subs?: {
    title: string
    link: string
    icon?: React.ReactNode
  }[]
}

export default function DashboardNavigation({ routes }: { routes: Route[] }) {
  const { state } = useSidebar()
  const location = useLocation()
  const pathname = location.pathname
  const isCollapsed = state === 'collapsed'

  const activeRouteId = useMemo(() => {
    return (
      routes.find((route) => {
        if (route.link === pathname) return true
        return route.subs?.some((sub) => sub.link === pathname)
      })?.id ?? null
    )
  }, [pathname, routes])

  const [openCollapsible, setOpenCollapsible] = useState<string | null>(
    activeRouteId,
  )

  useEffect(() => {
    setOpenCollapsible(activeRouteId)
  }, [activeRouteId])

  return (
    <SidebarMenu>
      {routes.map((route) => {
        const hasSubRoutes = !!route.subs?.length
        const isActive =
          route.link === pathname ||
          route.subs?.some((subRoute) => subRoute.link === pathname)
        const isOpen =
          !isCollapsed && openCollapsible === route.id && hasSubRoutes

        return (
          <SidebarMenuItem key={route.id}>
            {hasSubRoutes ? (
              <Collapsible
                open={isOpen}
                onOpenChange={(open) =>
                  setOpenCollapsible(open ? route.id : null)
                }
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    data-active={isActive}
                    className={cn(
                      'group flex w-full items-center rounded-2xl border px-3 py-2 text-sm font-medium transition-all duration-200',
                      isCollapsed && 'justify-center px-2',
                      isActive
                        ? 'border-sidebar-border bg-background text-foreground shadow-sm'
                        : 'border-transparent text-sidebar-foreground/70 hover:border-sidebar-border/70 hover:bg-background/70 hover:text-foreground',
                    )}
                  >
                    {route.icon}
                    {!isCollapsed && (
                      <span className="ml-2 flex-1 text-sm font-medium">
                        {route.title}
                      </span>
                    )}
                    {!isCollapsed && hasSubRoutes && (
                      <span className="ml-auto">
                        {isOpen ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </span>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {!isCollapsed && hasSubRoutes && (
                  <CollapsibleContent>
                    <SidebarMenuSub className="my-1 ml-3.5">
                      {route.subs?.map((subRoute) => {
                        const isSubActive = subRoute.link === pathname
                        return (
                          <SidebarMenuSubItem
                            key={`${route.id}-${subRoute.title}`}
                            className="h-auto"
                          >
                            <SidebarMenuSubButton asChild>
                              <Link
                                to={subRoute.link as any}
                                className={cn(
                                  'flex items-center rounded-xl px-4 py-1.5 text-sm font-medium transition-colors',
                                  isSubActive
                                    ? 'bg-background text-foreground'
                                    : 'text-sidebar-foreground/60 hover:bg-background/70 hover:text-foreground',
                                )}
                              >
                                {subRoute.icon && (
                                  <span className="mr-2 text-sidebar-foreground/60">
                                    {subRoute.icon}
                                  </span>
                                )}
                                {subRoute.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </Collapsible>
            ) : (
              <SidebarMenuButton tooltip={route.title} asChild>
                <Link
                  to={route.link as any}
                  className={cn(
                    'group flex items-center rounded-2xl border px-3 py-2 text-sm font-medium transition-all duration-200',
                    isCollapsed && 'justify-center px-2',
                    isActive
                      ? 'border-sidebar-border bg-background text-foreground shadow-sm'
                      : 'border-transparent text-sidebar-foreground/70 hover:border-sidebar-border/70 hover:bg-background/70 hover:text-foreground',
                  )}
                >
                  {route.icon}
                  {!isCollapsed && (
                    <span className="ml-2 text-sm font-medium">
                      {route.title}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
