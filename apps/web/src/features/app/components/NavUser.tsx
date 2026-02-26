import { useUser, useClerk } from '@clerk/clerk-react'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import {
  Moon,
  Sun,
  Monitor,
  ChevronsUpDown,
  LogOut,
  CreditCard,
  User,
} from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function NavUser() {
  const { user } = useUser()
  const { theme, setTheme } = useTheme()
  const { openUserProfile } = useClerk()

  if (!user) return null

  const displayName = user.fullName || user.username || 'User'
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <AvatarImage src={user.imageUrl} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-slate-900 dark:text-zinc-100">
                  {displayName}
                </span>
                <span className="truncate text-xs text-slate-500 dark:text-zinc-400">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-slate-400 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg shadow-xl border-zinc-200 dark:border-zinc-800"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="px-2 py-1.5">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 rounded-md">
                  <AvatarImage src={user.imageUrl} alt={displayName} />
                  <AvatarFallback className="rounded-md text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />

            <DropdownMenuItem
              onClick={() => openUserProfile()}
              className="gap-2 cursor-pointer"
            >
              <User className="size-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                {theme === 'light' && <Sun className="size-4" />}
                {theme === 'dark' && <Moon className="size-4" />}
                {theme === 'system' && <Monitor className="size-4" />}
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent sideOffset={4}>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) => setTheme(value as any)}
                >
                  <DropdownMenuRadioItem value="light">
                    <Sun className="mr-2 size-4" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon className="mr-2 size-4" />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Monitor className="mr-2 size-4" />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />

            <DropdownMenuItem
              onClick={() => (window.location.href = '/account/billing')}
              className="gap-2 cursor-pointer"
            >
              <CreditCard className="size-4" />
              <span>Billing</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />

            <DropdownMenuItem
              onClick={() => (window.location.href = '/sign-out')}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
