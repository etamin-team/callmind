import { UserButton, useUser } from "@clerk/clerk-react"
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Moon, Sun, Monitor, ChevronsUpDown } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function NavUser() {
  const { state, isMobile } = useSidebar()
  const { user } = useUser()
  const { theme, setTheme } = useTheme()

  if (!user) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem className="px-2 py-1 relative group">
        {/* Custom display for Name/Email behind/next to UserButton to maintain Shadcn Look */}
        <div className="flex items-center gap-3 w-full p-2 py-2.5 rounded-lg transition-all">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-lg">
             {/* We let Clerk's UserButton handle the avatar and trigger */}
            <UserButton 
              appearance={{
                elements: {
                  rootBox: "absolute inset-0 size-8",
                  userButtonBox: "size-8",
                  userButtonTrigger: "size-8 rounded-lg outline-none ring-0 focus:ring-0 focus:outline-none",
                  userButtonAvatarBox: "size-8 rounded-lg",
                  userButtonAvatarImage: "rounded-lg",
                  userButtonPopoverCard: "border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl ml-2",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Action label="manageAccount" />
                <UserButton.Action 
                  label={theme === "light" ? "Dark Mode" : "Light Mode"}
                  labelIcon={theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                />
                <UserButton.Action 
                  label="System Theme"
                  labelIcon={<Monitor className="size-4" />}
                  onClick={() => setTheme("system")}
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>

          {state === "expanded" && (
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0 pr-4">
              <span className="truncate font-semibold text-slate-900 dark:text-zinc-100">
                {user.fullName || user.username}
              </span>
              <span className="truncate text-xs text-slate-500 dark:text-zinc-400">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          )}
          
          {state === "expanded" && (
            <ChevronsUpDown className="ml-auto size-4 text-slate-400 shrink-0" />
          )}
        </div>

        {/* This invisible overlay makes the whole area feel clickable, though Clerk only opens via its button */}
        {/* Note: UserButton doesn't support a custom trigger easily, so we keep it on the avatar */}
        {/* However, we positioned the avatar on the left to match the sidebar design */}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
