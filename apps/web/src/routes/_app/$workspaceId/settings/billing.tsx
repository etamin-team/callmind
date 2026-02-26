import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import { Loader2, Check, Sparkles, Infinity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCreatePaymeCheckout } from '@/features/payments/api'
import { usePayme } from '@/features/payments/components/payme-provider'
import { PRICING_CONFIG, type PlanType } from '@repo/types'

const planOrder: PlanType[] = ['free', 'starter', 'professional', 'business']

const planStyles: Record<string, { bgColor: string; icon: typeof Sparkles }> = {
  free: { bgColor: 'bg-zinc-500', icon: Sparkles },
  starter: { bgColor: 'bg-blue-500', icon: Sparkles },
  professional: { bgColor: 'bg-violet-500', icon: Sparkles },
  business: { bgColor: 'bg-amber-500', icon: Infinity },
}

function BillingSettingsPage() {
  const { user, isLoaded } = useUser()
  const createPaymeCheckout = useCreatePaymeCheckout()
  const { openCheckout } = usePayme()

  const userPlan = ((user?.publicMetadata?.plan as string) ||
    'free') as PlanType
  const userCredits = (user?.publicMetadata?.credits as number) || 2

  const plan = PRICING_CONFIG[userPlan] || PRICING_CONFIG.free
  const styles = planStyles[userPlan] || planStyles.free
  const usagePercentage = Math.min(100, (userCredits / plan.credits) * 100)

  const currentPlanIndex = planOrder.indexOf(userPlan)
  const upgradePlans = planOrder
    .slice(currentPlanIndex + 1)
    .map((p) => ({ id: p, ...PRICING_CONFIG[p], styles: planStyles[p] }))

  const handleUpgrade = (planId: PlanType) => {
    if (!user) return

    createPaymeCheckout.mutate(
      {
        plan: planId,
        data: {
          yearly: false,
          userId: user.id,
          recurring: false,
        },
      },
      {
        onSuccess: (data) => {
          openCheckout({
            orderId: data.orderId,
            amount: data.amount,
            returnUrl: data.return_url,
            lang: (data.lang || 'ru') as 'ru' | 'uz' | 'en',
          })
        },
      },
    )
  }

  const formatPrice = (priceUzs: number) => {
    return new Intl.NumberFormat('uz-UZ').format(priceUzs)
  }

  const PlanIcon = styles.icon

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl space-y-10">
      {/* Current Plan */}
      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
          Current Plan
        </h2>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${styles.bgColor} text-white`}>
                <PlanIcon className="h-4 w-4" />
              </div>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {plan.name}
              </span>
            </div>
            <Badge variant="outline">{plan.credits} credits/mo</Badge>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            {formatPrice(plan.priceUzs)}
            <span className="text-sm font-normal text-zinc-500">/month</span>
          </div>
          <ul className="space-y-1">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2"
              >
                <Check className="h-3 w-3 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
          Usage
        </h2>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-500">{userCredits} remaining</span>
            <span className="text-zinc-500">{plan.credits} total</span>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${usagePercentage > 80 ? 'bg-orange-500' : 'bg-zinc-900 dark:bg-zinc-100'}`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      </section>

      {/* Upgrade */}
      {upgradePlans.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
            Upgrade Plan
          </h2>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {upgradePlans.map((upgradePlan) => (
              <div
                key={upgradePlan.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {upgradePlan.name}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {upgradePlan.credits} credits
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {formatPrice(upgradePlan.priceUzs)}/mo
                  </span>
                  <Button
                    onClick={() => handleUpgrade(upgradePlan.id)}
                    disabled={
                      createPaymeCheckout.isPending &&
                      createPaymeCheckout.variables?.plan === upgradePlan.id
                    }
                    size="sm"
                    variant="outline"
                  >
                    {createPaymeCheckout.isPending &&
                    createPaymeCheckout.variables?.plan === upgradePlan.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Upgrade'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/settings/billing')({
  component: BillingSettingsPage,
})
