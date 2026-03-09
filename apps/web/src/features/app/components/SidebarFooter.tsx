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
      <div className="rounded-lg bg-background p-4 shadow-sm ring-1 ring-border/20">
        <div className="flex items-center justify-between text-sm text-foreground">
          <span className="font-semibold">{t('app.sidebar.credits')}</span>
          <span className="font-semibold tabular-nums text-foreground/80">
            {userCredits} / {planConfig.credits}
          </span>
        </div>
        <div className="my-3 h-px bg-border" />
        <p className="text-xs font-medium text-muted-foreground">
          {t('app.sidebar.resets_on', { date: resetDate })}
        </p>

        {userPlan === 'free' && (
          <div
            className="mt-4 rounded-md p-0.5"
            style={{
              background:
                'linear-gradient(90deg, #f5a35c 0%, #f08db9 55%, #d38cff 100%)',
            }}
          >
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="h-10 w-full rounded-[4px] bg-background text-base font-semibold text-foreground hover:bg-background"
            >
              <Link
                to="/$workspaceId/settings/billing"
                params={{ workspaceId }}
              >
                <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-foreground text-background">
                  <ArrowUp className="size-3.5" />
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
