import {
  useClerk,
  useOrganization,
  useOrganizationList,
  useUser,
} from '@clerk/clerk-react'
import { Check, ChevronsUpDown, Plus, User } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function TeamSwitcher() {
  const { t } = useTranslation()
  const { isMobile } = useSidebar()
  const { openCreateOrganization } = useClerk()
  const { user } = useUser()
  const { organization } = useOrganization()
  const navigate = useNavigate()

  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

  if (!user || !isLoaded) return null

  const activeOrg = organization
  const userPlan = (
    (user.publicMetadata.plan as string) || 'free'
  ).toLowerCase()
  const planLabel = userPlan.charAt(0).toUpperCase() + userPlan.slice(1)
  const displayName =
    activeOrg?.name || user.fullName || user.username || 'Personal'
  const label =
    activeOrg?.name || `${user.firstName || user.username || 'Personal'}'s Team`

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                'h-10 rounded-none border-0 bg-transparent px-1 text-sidebar-foreground shadow-none transition-colors hover:bg-transparent data-[state=open]:bg-transparent',
                'group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
              )}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-3 text-left group-data-[collapsible=icon]:hidden">
                <span className="text-sidebar-foreground/25">/</span>
                <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                  <span className="truncate text-base font-semibold tracking-tight">
                    {label}
                  </span>
                  <span className="rounded-full border border-sidebar-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {planLabel}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/35 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-sidebar-foreground/60">
              {t('app.nav.workspaces') || 'Workspaces'}
            </DropdownMenuLabel>

            {/* Personal Account */}
            <DropdownMenuItem
              onClick={async () => {
                await setActive({ organization: null })
                navigate({ to: `/${user.id}/agents` })
              }}
              className="gap-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border border-sidebar-border/70 bg-sidebar/80">
                <User className="size-4" />
              </div>
              <span className="flex-1">{user.fullName || 'Personal'}</span>
              {!activeOrg && <Check className="size-4 text-sidebar-primary" />}
            </DropdownMenuItem>

            {/* Organizations */}
            {userMemberships.data.map((membership) => (
              <DropdownMenuItem
                key={membership.organization.id}
                onClick={async () => {
                  await setActive({ organization: membership.organization.id })
                  navigate({ to: `/${membership.organization.id}/agents` })
                }}
                className="gap-2"
              >
                <Avatar className="size-6 rounded-md border border-sidebar-border/60 bg-sidebar/70">
                  <AvatarImage src={membership.organization.imageUrl} />
                  <AvatarFallback className="rounded-md text-xs">
                    {membership.organization.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">
                  {membership.organization.name}
                </span>
                {activeOrg?.id === membership.organization.id && (
                  <Check className="size-4 text-sidebar-primary" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => openCreateOrganization()}
              className="gap-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed border-sidebar-border/70">
                <Plus className="size-4" />
              </div>
              <span className="text-sidebar-foreground/70">
                {t('app.nav.create_organization') || 'Create Workspace'}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
