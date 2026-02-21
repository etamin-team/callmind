'use client'

import { Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCreatePaymeCheckout } from '@/features/payments/api'
import { usePayme } from '@/features/payments/components/payme-provider'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    priceUzs: { monthly: 0, yearly: 0 },
    description: 'Try it out',
    features: ['10 calls/month', '1 AI agent', 'Basic analytics'],
    cta: 'Get Started',
    href: '/sign-up',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: { monthly: 59, yearly: 590 },
    priceUzs: { monthly: 108000, yearly: 1032000 },
    description: 'For small teams',
    features: [
      '250 calls/month',
      '3 AI agents',
      'All languages',
      'Call transcripts',
      'Email support',
    ],
    cta: 'Get Started',
    paymePlan: 'starter',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: { monthly: 172, yearly: 1720 },
    priceUzs: { monthly: 348000, yearly: 3336000 },
    description: 'For growing businesses',
    features: [
      '1000 calls/month',
      '40 super realistic calls',
      '10 AI agents',
      'Premium voices',
      'CRM integrations',
    ],
    cta: 'Get Started',
    paymePlan: 'pro',
  },
  {
    id: 'business',
    name: 'Business',
    price: { monthly: 345, yearly: 3450 },
    priceUzs: { monthly: 948000, yearly: 9096000 },
    description: 'For enterprises',
    features: [
      '3000 calls/month',
      '90 super realistic calls',
      '25 AI agents',
      'Custom integrations',
      'Dedicated support',
    ],
    cta: 'Get Started',
    paymePlan: 'business',
  },
]

const enterprisePlan = {
  id: 'enterprise',
  name: 'Enterprise',
  description: 'For large organizations',
  features: [
    'Unlimited calls',
    'Unlimited super realistic calls',
    'Unlimited AI agents',
    'White-label solution',
    'Integrations to custom systems',
    'Priority support',
    'SLA guarantee',
    'Custom contract',
  ],
  cta: 'Contact Sales',
  href: 'mailto:sales@callmind.uz',
}

interface Pricing2Props {
  className?: string
}

const Pricing2 = ({ className }: Pricing2Props) => {
  const [yearly, setYearly] = useState<boolean>(false)
  const { user, isSignedIn } = useUser()
  const createPaymeCheckout = useCreatePaymeCheckout()
  const { redirectToCheckout } = usePayme()

  const handlePlanClick = (plan: (typeof plans)[0]) => {
    if (plan.id === 'free' || !plan.paymePlan) {
      if (plan.href) {
        window.location.href = plan.href
      }
      return
    }

    if (!isSignedIn) {
      window.location.href = `/sign-up?redirect=pricing`
      return
    }

    createPaymeCheckout.mutate(
      {
        plan: plan.paymePlan,
        data: {
          yearly: !!yearly,
          userId: user?.id,
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

  const isLoading = (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    return !!(
      createPaymeCheckout.isPending &&
      plan?.paymePlan &&
      createPaymeCheckout.variables?.plan === plan.paymePlan
    )
  }

  return (
    <section className={cn('py-24', className)}>
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3">Pricing</h2>
          <p className="text-muted-foreground">
            Simple pricing. No hidden fees.
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
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-xl border p-6 flex flex-col',
                plan.popular && 'border-primary shadow-lg',
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Popular
                </span>
              )}
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${yearly ? plan.price.yearly : plan.price.monthly}
                </span>
                <span className="text-muted-foreground">
                  /{yearly ? 'yr' : 'mo'}
                </span>
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handlePlanClick(plan)}
                disabled={isLoading(plan.id)}
              >
                {isLoading(plan.id) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  plan.cta
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="relative rounded-xl border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10 p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-3xl font-bold">{enterprisePlan.name}</h3>
                <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
                  Premium
                </span>
              </div>
              <p className="text-lg text-muted-foreground mb-8">
                {enterprisePlan.description}
              </p>
              <Button size="lg" className="w-full md:w-auto" asChild>
                <a href={enterprisePlan.href}>{enterprisePlan.cta}</a>
              </Button>
            </div>
            <div>
              <ul className="space-y-4">
                {enterprisePlan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-base"
                  >
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Need more?{' '}
          <a href="mailto:sales@callmind.uz" className="underline">
            Contact us
          </a>{' '}
          for enterprise pricing.
        </p>
      </div>
    </section>
  )
}

export { Pricing2 }
