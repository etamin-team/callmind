import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import { Loader2, Package, Zap, ArrowUpRight, Check } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCreateFreedompayCheckout } from '@/features/payments/api'
import { useFreedompay } from '@/features/payments/components/freedompay-provider'
import { PRICING_CONFIG, type PlanType } from '@repo/types'

const planOrder: PlanType[] = ['free', 'starter', 'professional', 'business']

const planStyles: Record<string, { color: string; bgColor: string }> = {
  free: { color: 'text-gray-500', bgColor: 'bg-gray-500' },
  starter: { color: 'text-blue-500', bgColor: 'bg-blue-500' },
  professional: { color: 'text-purple-500', bgColor: 'bg-purple-500' },
  business: { color: 'text-amber-500', bgColor: 'bg-amber-500' },
}

function BillingSettingsPage() {
  const { user, isLoaded } = useUser()
  const createCheckout = useCreateFreedompayCheckout()
  const { redirectToCheckout } = useFreedompay()

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

    createCheckout.mutate(
      {
        plan: planId,
        data: {
          yearly: false,
          userId: user.id,
        },
      },
      {
        onSuccess: (data) => {
          if (data.checkoutUrl) {
            redirectToCheckout(data.checkoutUrl)
          }
        },
      },
    )
  }

  const handleGoToPricing = () => {
    window.location.href = '/#pricing'
  }

  const formatPrice = (priceUzs: number) => {
    return new Intl.NumberFormat('uz-UZ').format(priceUzs)
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </div>
            <Badge className={`${styles.bgColor} text-white`}>
              {plan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatPrice(plan.priceUzs)}
            </span>
            <span className="text-muted-foreground">UZS/month</span>
          </div>

          <ul className="space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button onClick={handleGoToPricing}>
            <Zap className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>

      {upgradePlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Upgrade Options
            </CardTitle>
            <CardDescription>
              Choose a higher plan to get more features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {upgradePlans.map((upgradePlan) => (
                <div
                  key={upgradePlan.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${upgradePlan.styles.color}`}
                      >
                        {upgradePlan.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(upgradePlan.priceUzs)} UZS/mo
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {upgradePlan.credits} calls/month
                    </p>
                  </div>
                  <Button
                    onClick={() => handleUpgrade(upgradePlan.id)}
                    disabled={
                      createCheckout.isPending &&
                      createCheckout.variables?.plan === upgradePlan.id
                    }
                  >
                    {createCheckout.isPending &&
                    createCheckout.variables?.plan === upgradePlan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Upgrade
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Usage
          </CardTitle>
          <CardDescription>Your monthly call credits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {userCredits} calls remaining
            </span>
            <span className="text-muted-foreground">
              {plan.credits} calls / month
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Credits reset at the beginning of each billing cycle
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/settings/billing')({
  component: BillingSettingsPage,
})
