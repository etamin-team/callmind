import { useUser, useClerk } from "@clerk/clerk-react"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Moon, Sun, Monitor, ChevronsUpDown, LogOut, Settings, Globe, Check } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useTranslation } from "react-i18next"

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "uz", label: "O'zbekcha" },
]

export function NavUser() {
  const { t, i18n } = useTranslation()
  const { isMobile } = useSidebar()
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const { theme, setTheme } = useTheme()

  if (!user) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.imageUrl} alt={user.fullName || user.username || ""} />
                <AvatarFallback className="rounded-lg">{user.firstName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-slate-900 dark:text-zinc-100">
                  {user.fullName || user.username}
                </span>
                <span className="truncate text-xs text-slate-500 dark:text-zinc-400">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.imageUrl} alt={user.fullName || user.username || ""} />
                  <AvatarFallback className="rounded-lg">{user.firstName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.fullName || user.username}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openUserProfile()}>
                <Settings className="mr-2 h-4 w-4" />
                {t('app.user_menu.manage_account')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>{t('app.user_menu.language')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {LANGUAGES.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className="flex items-center justify-between"
                      >
                        {lang.label}
                        {i18n.resolvedLanguage === lang.code && <Check className="h-4 w-4 text-muted-foreground ml-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {theme === "light" ? <Sun className="mr-2 h-4 w-4" /> : theme === "dark" ? <Moon className="mr-2 h-4 w-4" /> : <Monitor className="mr-2 h-4 w-4" />}
                  <span>{t('app.user_menu.theme')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center justify-between">
                      <div className="flex items-center"><Sun className="mr-2 h-4 w-4" /> {t('app.user_menu.light_mode')}</div>
                      {theme === 'light' && <Check className="h-4 w-4 text-muted-foreground ml-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center justify-between">
                      <div className="flex items-center"><Moon className="mr-2 h-4 w-4" /> {t('app.user_menu.dark_mode')}</div>
                      {theme === 'dark' && <Check className="h-4 w-4 text-muted-foreground ml-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center justify-between">
                      <div className="flex items-center"><Monitor className="mr-2 h-4 w-4" /> {t('app.user_menu.system_theme')}</div>
                      {theme === 'system' && <Check className="h-4 w-4 text-muted-foreground ml-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('app.user_menu.log_out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

