import type { LucideIcon } from 'lucide-react'
import { useMemo } from 'react'

import DashboardNavigation, {
  type Route,
} from '@/components/sidebar-02/nav-main'

export function NavMain({
  items,
}: {
  items: Array<{
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: Array<{
      title: string
      url: string
      icon?: LucideIcon
    }>
  }>
}) {
  const routes = useMemo<Route[]>(
    () =>
      items.map((item) => ({
        id: item.title.toLowerCase().replace(/\s+/g, '-'),
        title: item.title,
        link: item.url,
        icon: item.icon ? (
          <item.icon className="size-4" strokeWidth={1.5} />
        ) : undefined,
        subs: item.items?.map((sub) => ({
          title: sub.title,
          link: sub.url,
          icon: sub.icon ? <sub.icon className="size-4" /> : undefined,
        })),
      })),
    [items],
  )

  return <DashboardNavigation routes={routes} />
}
