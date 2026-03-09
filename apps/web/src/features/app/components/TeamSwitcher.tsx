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
  const displayName =
    activeOrg?.name || user.fullName || user.username || 'Personal'
  const displayImage = activeOrg?.imageUrl || user.imageUrl

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-11 rounded-2xl border border-sidebar-border/40 bg-sidebar/70 px-2 text-sidebar-foreground transition-colors data-[state=open]:border-sidebar-border data-[state=open]:bg-sidebar-accent/40 data-[state=open]:text-sidebar-accent-foreground supports-[backdrop-filter]:backdrop-blur-xl"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={displayImage} alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="rounded-full border border-sidebar-border/60 bg-sidebar-accent/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-accent-foreground">
                    {userPlan}
                  </span>
                </div>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {activeOrg ? 'Organization' : 'Personal'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
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
