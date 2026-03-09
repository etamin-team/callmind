import { useUser } from '@clerk/clerk-react'
import { ArrowUp } from 'lucide-react'
import { Link, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { PRICING_CONFIG } from '@repo/types'
import type { PlanType } from '@repo/types'
import { Button } from '@/components/ui/button'

export function SidebarFooterComponent() {
  const { t, i18n } = useTranslation()
  const { user } = useUser()
  const { workspaceId } = useParams({ from: '/_app/$workspaceId' })

  if (!user) return null

  const userPlan = ((user.publicMetadata.plan as string) || 'free') as PlanType
  const userCredits = (user.publicMetadata.credits as number) || 2
  const planConfig = PRICING_CONFIG[userPlan]

  // Calculate next reset date (first day of next month)
  const now = new Date()
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const resetDate = new Intl.DateTimeFormat(i18n.resolvedLanguage || 'en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(nextReset)

  return (
    <div className="group-data-[collapsible=icon]:hidden">
      <div className="rounded-2xl border border-sidebar-border/70 bg-sidebar/80 p-3 shadow-lg supports-[backdrop-filter]:backdrop-blur-xl">
        <div className="flex items-center justify-between text-sm text-sidebar-foreground">
          <span className="font-medium">{t('app.sidebar.credits')}</span>
          <span className="font-semibold tabular-nums">
            {userCredits} / {planConfig.credits}
          </span>
        </div>
        <div className="my-2 h-px bg-sidebar-border/70" />
        <p className="text-xs text-sidebar-foreground/65">
          {t('app.sidebar.resets_on', { date: resetDate })}
        </p>

        {userPlan === 'free' && (
          <div
            className="mt-3 rounded-xl p-[1px]"
            style={{
              background:
                'linear-gradient(135deg, var(--sidebar-primary) 0%, var(--primary) 80%)',
            }}
          >
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="h-9 w-full rounded-[11px] bg-sidebar font-semibold text-sidebar-foreground hover:bg-sidebar/90"
            >
              <Link
                to="/$workspaceId/settings/billing"
                params={{ workspaceId }}
              >
                <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                  <ArrowUp className="size-3" />
                </span>
                {t('app.sidebar.upgrade')}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
