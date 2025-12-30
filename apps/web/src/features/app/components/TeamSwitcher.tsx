import { useOrganization, useOrganizationList, useUser, useClerk } from "@clerk/clerk-react"
import { ChevronsUpDown, Plus, User, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { openCreateOrganization } = useClerk()
  const { user } = useUser()
  const { organization } = useOrganization()
  
  // Correctly access the list of memberships
  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

  // We should also look for invitations/suggestions if needed, 
  // but usually created orgs appear in memberships.

  if (!user || !isLoaded) return null

  const activeOrg = organization
  const displayName = activeOrg?.name || user.fullName || user.username || "Personal"
  const displayImage = activeOrg?.imageUrl || user.imageUrl

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <AvatarImage src={displayImage} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                  {displayName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeOrg ? "Organization" : "Personal Account"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-slate-400 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg shadow-xl border-zinc-200 dark:border-zinc-800"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 font-bold">
              Account
            </DropdownMenuLabel>
            
            {/* Personal Account Option */}
            <DropdownMenuItem
              onClick={() => setActive({ organization: null })}
              className="gap-2 p-2 cursor-pointer focus:bg-slate-100 dark:focus:bg-zinc-900"
            >
              <div className="flex size-7 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <User className="size-4 shrink-0" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium">{user.fullName || "Personal Workspace"}</span>
                <span className="text-[10px] text-muted-foreground">Personal</span>
              </div>
              {!activeOrg && <Check className="size-4 text-emerald-500" />}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />
            
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Organizations</span>
            </div>
            
            <div className="max-h-[200px] overflow-y-auto">
              {userMemberships.data?.length === 0 ? (
                <div className="px-2 py-3 text-center">
                  <p className="text-xs text-muted-foreground">No organizations yet</p>
                </div>
              ) : (
                userMemberships.data?.map((membership) => (
                  <DropdownMenuItem
                    key={membership.organization.id}
                    onClick={() => setActive({ organization: membership.organization.id })}
                    className="gap-2 p-2 cursor-pointer focus:bg-slate-100 dark:focus:bg-zinc-900"
                  >
                    <Avatar className="size-7 rounded-md border border-zinc-200 dark:border-zinc-800">
                      <AvatarImage src={membership.organization.imageUrl} />
                      <AvatarFallback className="rounded-md text-[10px]">
                        {membership.organization.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">{membership.organization.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{membership.role}</span>
                    </div>
                    {activeOrg?.id === membership.organization.id && <Check className="size-4 text-emerald-500" />}
                  </DropdownMenuItem>
                ))
              )}
            </div>

            <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />
            
            {/* Create Organization Trigger */}
            <DropdownMenuItem 
                className="gap-2 p-2 cursor-pointer text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 focus:bg-slate-100 dark:focus:bg-zinc-900"
                onClick={() => openCreateOrganization()}
            >
              <div className="flex size-7 items-center justify-center rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                <Plus className="size-4" />
              </div>
              <span className="text-sm font-medium">Create Organization</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
