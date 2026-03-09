import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { Loader2, Check, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreatePaymeCheckout } from '@/features/payments/api'
import { motion, AnimatePresence } from 'motion/react'

import { PRICING_CONFIG, type PlanType } from '@repo/types'
import { cn } from '@/lib/utils'

const planOrder: PlanType[] = ['starter', 'professional', 'business']

const planContent: Record<
  string,
  { description: string; icon: string; color: string; popular?: boolean }
> = {
  starter: {
    description: 'For small teams',
    icon: '⭐',
    color: 'text-blue-500',
  },
  professional: {
    description: 'For growing businesses',
    icon: '✨',
    color: 'text-amber-500',
    popular: true,
  },
  business: {
    description: 'For large teams',
    icon: '💎',
    color: 'text-pink-500',
  },
}

// Animated Number Component
function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="inline-block"
    >
      {value}
    </motion.span>
  )
}

function BillingSettingsPage() {
  const { t } = useTranslation()
  const { user, isLoaded } = useUser()
  const createCheckout = useCreatePaymeCheckout()
  const [yearly, setYearly] = useState(false)

  const userPlan = ((user?.publicMetadata?.plan as string) ||
    'free') as PlanType
  const userCredits = (user?.publicMetadata?.credits as number) || 2

  const currentPlanConfig = PRICING_CONFIG[userPlan] || PRICING_CONFIG.free
  const usagePercentage = Math.min(
    100,
    (userCredits / currentPlanConfig.credits) * 100,
  )

  const handleUpgrade = (planId: PlanType) => {
    if (!user) return
    if (planId === 'free' || planId === userPlan) return

    // Map plan IDs to API plan names
    const planMapping: Record<string, string> = {
      starter: 'starter',
      professional: 'pro',
      business: 'business',
    }

    const apiPlanName = planMapping[planId] || planId

    createCheckout.mutate(
      {
        plan: apiPlanName,
        data: { yearly, userId: user.id, lang: 'ru' },
      },
      {
        onSuccess: (data) => {
          console.log('=== BILLING onSuccess ===', data)
          console.log('paymeLink:', data.paymeLink)

          if (data.paymeLink) {
            // Redirect to the Payme checkout page
            window.location.href = data.paymeLink
          } else {
            console.error('No paymeLink returned from API')
          }
        },
        onError: (error) => {
          console.log('=== BILLING onError ===', error)
        },
      },
    )
  }

  const isLoading = (planId: PlanType) => {
    const planMapping: Record<string, string> = {
      starter: 'starter',
      professional: 'pro',
      business: 'business',
    }
    const apiPlanName = planMapping[planId] || planId

    return !!(
      createCheckout.isPending && createCheckout.variables?.plan === apiPlanName
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('app.billing.title')}</h1>
        <div className="relative inline-flex items-center rounded-lg border bg-card p-1">
          <motion.div
            className="absolute inset-y-1 bg-background shadow-sm rounded-md"
            initial={false}
            animate={{
              x: yearly ? '100%' : '0%',
              width: yearly ? 'calc(50% - 4px)' : 'calc(50% - 4px)',
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 35,
            }}
          />
          <button
            onClick={() => setYearly(false)}
            className={cn(
              'relative z-10 px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              !yearly
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t('app.billing.monthly')}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={cn(
              'relative z-10 px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              yearly
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t('app.billing.yearly')}
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        {planOrder.map((planId, index) => {
          const config = PRICING_CONFIG[planId]
          const content = planContent[planId]
          const isCurrent = planId === userPlan
          const yearlyPrice = Math.floor(config.priceUsd * 12 * 0.83)
          const monthlyPrice = config.priceUsd

          return (
            <motion.div
              key={planId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              whileHover={{
                scale: 1.02,
                transition: { type: 'spring', stiffness: 400, damping: 25 },
              }}
              className={cn(
                'relative rounded-2xl border bg-card p-6 flex flex-col',
                content.popular && 'shadow-xl',
                isCurrent && 'ring-2 ring-primary',
              )}
            >
              {/* Popular Badge */}
              {content.popular && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1 + 0.2,
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-foreground text-background rounded-full">
                    {t('app.billing.popular')}
                  </span>
                </motion.div>
              )}

              {/* Plan Icon & Name */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: index * 0.1 + 0.1,
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
                className="flex items-center gap-2 mb-4"
              >
                <span className={cn('text-2xl', content.color)}>
                  {content.icon}
                </span>
                <h3 className="text-xl font-semibold">
                  {t(
                    `marketing.pricing.plans.${planId === 'professional' ? 'pro' : planId}.name`,
                  )}
                </h3>
              </motion.div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold tracking-tight">
                    $
                    <AnimatePresence mode="wait">
                      <AnimatedNumber
                        value={yearly ? yearlyPrice : monthlyPrice}
                      />
                    </AnimatePresence>
                  </span>
                  <AnimatePresence>
                    {yearly && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 25,
                        }}
                        className="inline-block px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-md"
                      >
                        {t('app.billing.discount')}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <motion.p
                  key={yearly ? 'yearly' : 'monthly'}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    delay: 0.05,
                  }}
                  className="text-sm text-muted-foreground"
                >
                  {t('app.billing.per_month', {
                    amount: yearly ? yearlyPrice : monthlyPrice * 12,
                    period: yearly
                      ? t('app.billing.billed_annually')
                      : t('app.billing.billed_monthly'),
                  })}
                </motion.p>
              </div>

              {/* CTA Button */}
              <motion.div
                key={`button-${yearly}`}
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <Button
                  size="lg"
                  className="w-full mb-6"
                  variant={isCurrent ? 'outline' : 'default'}
                  onClick={() => handleUpgrade(planId)}
                  disabled={isLoading(planId) || isCurrent}
                >
                  {isLoading(planId) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('app.billing.processing')}
                    </>
                  ) : isCurrent ? (
                    t('app.billing.current_plan')
                  ) : (
                    t('app.billing.upgrade')
                  )}
                </Button>
              </motion.div>

              {/* Usage for current plan */}
              {isCurrent && (
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {t('app.billing.usage')}
                    </span>
                    <span className="font-medium tabular-nums">
                      {userCredits} / {config.credits}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full transition-all"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="space-y-3 flex-1">
                <p className="text-sm font-semibold text-muted-foreground">
                  {t('app.billing.everything_in', {
                    plan:
                      planId === 'starter'
                        ? t('marketing.pricing.plans.free.name')
                        : planOrder[planOrder.indexOf(planId) - 1]
                          ? t(
                              `marketing.pricing.plans.${planOrder[planOrder.indexOf(planId) - 1] === 'professional' ? 'pro' : planOrder[planOrder.indexOf(planId) - 1]}.name`,
                            )
                          : t('marketing.pricing.plans.free.name'),
                  })}{' '}
                  +
                </p>
                <ul className="space-y-3">
                  {(
                    t(
                      `marketing.pricing.plans.${planId === 'professional' ? 'pro' : planId}.features`,
                      { returnObjects: true },
                    ) as string[]
                  ).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Billing History */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold">{t('app.billing.billing_history')}</h3>
        </div>
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('app.billing.no_billing_history')}
          </p>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/settings/billing')({
  component: BillingSettingsPage,
})
