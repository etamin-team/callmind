'use client'

import { Check, Loader2, ChevronDown, Building2, Landmark } from 'lucide-react'
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
  const [enterpriseExpanded, setEnterpriseExpanded] = useState(false)
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

        <button
          onClick={() => setEnterpriseExpanded(!enterpriseExpanded)}
          className="relative w-full rounded-xl border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10 p-6 md:p-8 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold">{enterprisePlan.name}</h3>
                <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
                  Premium
                </span>
              </div>
              <p className="text-muted-foreground mb-4">
                {enterprisePlan.description}
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
                  {enterprisePlan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
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
                <a href={enterprisePlan.href}>{enterprisePlan.cta}</a>
              </Button>
            </div>
          </div>
        </button>

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
