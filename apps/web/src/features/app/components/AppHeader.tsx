import { useUser, useClerk } from '@clerk/clerk-react'
import {
  Settings,
  LogOut,
  Globe,
  Moon,
  Sun,
  Monitor,
  Check,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/theme-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'uz', label: "O'zbekcha" },
]

export function AppHeader() {
  const { t, i18n } = useTranslation()
  const { openUserProfile, signOut } = useClerk()
  const { user } = useUser()
  const { theme, setTheme } = useTheme()

  if (!user) return null

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 border-b bg-background sticky top-0 z-30">
      <SidebarTrigger className="-ml-1" />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted transition-colors">
            <Avatar className="size-7 rounded-lg">
              <AvatarImage
                src={user.imageUrl}
                alt={user.fullName || user.username || ''}
              />
              <AvatarFallback className="rounded-lg text-xs">
                {user.firstName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user.imageUrl}
                  alt={user.fullName || user.username || ''}
                />
                <AvatarFallback className="rounded-lg">
                  {user.firstName?.charAt(0) || 'U'}
                </AvatarFallback>
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
              {t('app.user_menu.manage_account') || 'Manage Account'}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Globe className="mr-2 h-4 w-4" />
                <span>{t('app.user_menu.language') || 'Language'}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => i18n.changeLanguage(lang.code)}
                    >
                      {lang.label}
                      {i18n.resolvedLanguage === lang.code && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {theme === 'light' ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : theme === 'dark' ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : (
                  <Monitor className="mr-2 h-4 w-4" />
                )}
                <span>{t('app.user_menu.theme') || 'Theme'}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />{' '}
                    {t('app.user_menu.light_mode') || 'Light'}
                    {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />{' '}
                    {t('app.user_menu.dark_mode') || 'Dark'}
                    {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="mr-2 h-4 w-4" />{' '}
                    {t('app.user_menu.system_theme') || 'System'}
                    {theme === 'system' && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('app.user_menu.log_out') || 'Log out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
