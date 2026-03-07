import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import {
  Loader2,
  Check,
  CreditCard,
  ChevronDown,
  Building2,
  Landmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCreatePaymeCheckout } from '@/features/payments/api'

import { PRICING_CONFIG, type PlanType } from '@repo/types'
import { cn } from '@/lib/utils'

const planOrder: PlanType[] = ['free', 'starter', 'professional', 'business']

const planContent = {
  free: {
    description: 'Try it out',
  },
  starter: {
    description: 'For small teams',
    popular: true,
  },
  professional: {
    description: 'For growing businesses',
  },
  business: {
    description: 'For enterprises',
  },
} as const

function BillingSettingsPage() {
  const { user, isLoaded } = useUser()
  const createCheckout = useCreatePaymeCheckout()
  const [yearly, setYearly] = useState(false)
  const [enterpriseExpanded, setEnterpriseExpanded] = useState(false)

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
    createCheckout.mutate(
      {
        plan: planId,
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
    return !!(
      createCheckout.isPending && createCheckout.variables?.plan === planId
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
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold mb-3">Pricing</h2>
        <p className="text-muted-foreground">
          Your current plan:{' '}
          <span className="text-foreground font-medium">
            {currentPlanConfig.name}
          </span>
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className="text-sm">Monthly</span>
          <Switch checked={yearly} onCheckedChange={setYearly} />
          <span className="text-sm">Yearly</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            Save 17%
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {planOrder.map((planId) => {
          const config = PRICING_CONFIG[planId]
          const content = planContent[planId]
          const isCurrent = planId === userPlan

          return (
            <div
              key={planId}
              className={cn(
                'relative rounded-xl border p-6 flex flex-col',
                content.popular && 'border-primary shadow-lg',
              )}
            >
              {content.popular && !isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Current
                </span>
              )}

              <div className="mb-4">
                <h3 className="font-semibold text-lg">{config.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {content.description}
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  $
                  {yearly
                    ? Math.floor(config.priceUsd * 12 * 0.83)
                    : config.priceUsd}
                </span>
                <span className="text-muted-foreground">
                  /{yearly ? 'yr' : 'mo'}
                </span>
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                {config.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="mt-auto border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Credits</span>
                    <span className="font-medium">
                      {userCredits} / {config.credits}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full mt-auto"
                  variant={content.popular ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(planId)}
                  disabled={isLoading(planId) || planId === 'free'}
                >
                  {isLoading(planId) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : planId === 'free' ? (
                    'Included'
                  ) : (
                    'Upgrade'
                  )}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={() => setEnterpriseExpanded(!enterpriseExpanded)}
        className="relative w-full rounded-xl border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10 p-6 md:p-8 text-left transition-all hover:shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">Enterprise</h3>
              <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
                Premium
              </span>
            </div>
            <p className="text-muted-foreground mb-4">
              For large organizations
            </p>

            <div
              className={cn(
                'grid gap-2 transition-all duration-300 ease-in-out',
                enterpriseExpanded
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[1fr] opacity-100',
              )}
            >
              <ul
                className={cn(
                  'grid grid-cols-1 sm:grid-cols-2 gap-2',
                  'transition-all duration-300 ease-in-out',
                  enterpriseExpanded
                    ? 'opacity-0 h-0 overflow-hidden'
                    : 'opacity-100',
                )}
              >
                {[
                  'Unlimited calls',
                  'Unlimited super realistic calls',
                  'Unlimited AI agents',
                  'White-label solution',
                  'Integrations to custom systems',
                  'Priority support',
                  'SLA guarantee',
                  'Custom contract',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="shrink-0">
            <ChevronDown
              className={cn(
                'w-5 h-5 text-muted-foreground transition-transform duration-300',
                enterpriseExpanded && 'rotate-180',
              )}
            />
          </div>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-500 ease-in-out',
            enterpriseExpanded
              ? 'max-h-[800px] mt-8 pt-6 border-t border-primary/20 opacity-100'
              : 'max-h-0 mt-0 pt-0 border-t-0 border-transparent opacity-0',
          )}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div
              className={cn(
                'transition-all duration-500 delay-100',
                enterpriseExpanded
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0',
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">B2B Solutions</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Unlimited API calls with custom rate limits</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Dedicated infrastructure with 99.9% SLA</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Custom voice models & branding</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>CRM integrations (Salesforce, HubSpot, etc.)</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Advanced analytics dashboard</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Team management & role-based access</span>
                </li>
              </ul>
            </div>
            <div
              className={cn(
                'transition-all duration-500 delay-200',
                enterpriseExpanded
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0',
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <Landmark className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">B2G Solutions</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>On-premise deployment option</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Data residency & security compliance</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Government-grade encryption (AES-256)</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Custom procurement & billing</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Priority 24/7 support with dedicated CSM</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Integration with government systems</span>
                </li>
              </ul>
            </div>
          </div>
          <div
            className={cn(
              'mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between transition-all duration-500 delay-300',
              enterpriseExpanded
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0',
            )}
          >
            <p className="text-lg text-muted-foreground">
              Tailored solutions for your organization's unique needs
            </p>
            <Button size="lg" asChild>
              <a href="mailto:sales@callmind.uz">Contact Sales</a>
            </Button>
          </div>
        </div>
      </button>

      <div className="mt-12 rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-xl font-bold">Billing History</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Your past transactions
        </p>
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No billing history yet</p>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/settings/billing')({
  component: BillingSettingsPage,
})
