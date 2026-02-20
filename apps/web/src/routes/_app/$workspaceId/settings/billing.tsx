import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import {
  CreditCard,
  Loader2,
  Package,
  Zap,
  ArrowUpRight,
  Check,
} from 'lucide-react'
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
import { useCreatePaymeCheckout } from '@/features/payments/api'
import { usePayme } from '@/features/payments/components/payme-provider'

const planConfig: Record<
  string,
  {
    name: string
    color: string
    bgColor: string
    description: string
    maxCalls: number
    priceUzs: number
    priceUsd: number
    features: string[]
  }
> = {
  free: {
    name: 'Free',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500',
    description: 'Try it out with limited features',
    maxCalls: 2,
    priceUzs: 0,
    priceUsd: 0,
    features: ['2 calls/month', '1 AI agent', 'Basic analytics'],
  },
  starter: {
    name: 'Starter',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    description: 'For small teams',
    maxCalls: 200,
    priceUzs: 108000,
    priceUsd: 9,
    features: [
      '200 calls/month',
      '3 AI agents',
      'All languages',
      'Call transcripts',
      'Email support',
    ],
  },
  professional: {
    name: 'Professional',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    description: 'For growing businesses',
    maxCalls: 1000,
    priceUzs: 348000,
    priceUsd: 29,
    features: [
      '1000 calls/month',
      '40 super realistic calls',
      '10 AI agents',
      'Premium voices',
      'CRM integrations',
    ],
  },
  business: {
    name: 'Business',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500',
    description: 'For large organizations',
    maxCalls: 2000,
    priceUzs: 948000,
    priceUsd: 79,
    features: [
      '2000 calls/month',
      '90 super realistic calls',
      '25 AI agents',
      'Custom integrations',
      'Dedicated support',
    ],
  },
}

const planOrder = ['free', 'starter', 'professional', 'business']

function BillingSettingsPage() {
  const { user, isLoaded } = useUser()
  const createCheckout = useCreatePaymeCheckout()
  const { redirectToCheckout } = usePayme()

  const userPlan = (user?.publicMetadata?.plan as string) || 'free'
  const userCredits = (user?.publicMetadata?.credits as number) || 2

  const plan = planConfig[userPlan] || planConfig.free
  const usagePercentage = Math.min(100, (userCredits / plan.maxCalls) * 100)

  const currentPlanIndex = planOrder.indexOf(userPlan)
  const upgradePlans = planOrder
    .slice(currentPlanIndex + 1)
    .map((p) => ({ id: p, ...planConfig[p] }))

  const handleUpgrade = (planId: string) => {
    if (!user) return

    createCheckout.mutate(
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
            <Badge className={`${plan.bgColor} text-white`}>{plan.name}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatPrice(plan.priceUzs)}
            </span>
            <span className="text-muted-foreground">UZS/month</span>
          </div>
          <p className="text-muted-foreground">{plan.description}</p>

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
                      <span className={`font-semibold ${upgradePlan.color}`}>
                        {upgradePlan.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(upgradePlan.priceUzs)} UZS/mo
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {upgradePlan.maxCalls} calls/month
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
              {plan.maxCalls} calls / month
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
