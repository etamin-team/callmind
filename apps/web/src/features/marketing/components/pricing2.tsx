'use client'

import { Check, Loader2, ChevronDown, Building2, Landmark } from 'lucide-react'
import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCreatePaymeCheckout } from '@/features/payments/api'
import { usePayme } from '@/features/payments/components/payme-provider'

interface Pricing2Props {
  className?: string
}

const Pricing2 = ({ className }: Pricing2Props) => {
  const { t } = useTranslation()
  const [yearly, setYearly] = useState<boolean>(false)
  const [enterpriseExpanded, setEnterpriseExpanded] = useState(false)
  const { user, isSignedIn } = useUser()
  const createPaymeCheckout = useCreatePaymeCheckout()
  const { redirectToCheckout } = usePayme()

  const plans = [
    {
      id: 'free',
      name: t('marketing.pricing.plans.free.name'),
      price: { monthly: 0, yearly: 0 },
      priceUzs: { monthly: 0, yearly: 0 },
      description: t('marketing.pricing.plans.free.desc'),
      features: t('marketing.pricing.plans.free.features', {
        returnObjects: true,
      }) as string[],
      cta: t('marketing.pricing.plans.free.cta'),
      href: '/sign-up',
    },
    {
      id: 'starter',
      name: t('marketing.pricing.plans.starter.name'),
      price: { monthly: 59, yearly: 590 },
      priceUzs: { monthly: 108000, yearly: 1032000 },
      description: t('marketing.pricing.plans.starter.desc'),
      features: t('marketing.pricing.plans.starter.features', {
        returnObjects: true,
      }) as string[],
      cta: t('marketing.pricing.plans.starter.cta'),
      paymePlan: 'starter',
      popular: true,
    },
    {
      id: 'pro',
      name: t('marketing.pricing.plans.pro.name'),
      price: { monthly: 172, yearly: 1720 },
      priceUzs: { monthly: 348000, yearly: 3336000 },
      description: t('marketing.pricing.plans.pro.desc'),
      features: t('marketing.pricing.plans.pro.features', {
        returnObjects: true,
      }) as string[],
      cta: t('marketing.pricing.plans.pro.cta'),
      paymePlan: 'pro',
    },
    {
      id: 'business',
      name: t('marketing.pricing.plans.business.name'),
      price: { monthly: 345, yearly: 3450 },
      priceUzs: { monthly: 948000, yearly: 9096000 },
      description: t('marketing.pricing.plans.business.desc'),
      features: t('marketing.pricing.plans.business.features', {
        returnObjects: true,
      }) as string[],
      cta: t('marketing.pricing.plans.business.cta'),
      paymePlan: 'business',
    },
  ]

  const enterpriseFeatures = t('marketing.pricing.enterprise.features', {
    returnObjects: true,
  }) as string[]
  const b2bFeatures = t('marketing.pricing.enterprise.b2b_features', {
    returnObjects: true,
  }) as string[]
  const b2gFeatures = t('marketing.pricing.enterprise.b2g_features', {
    returnObjects: true,
  }) as string[]

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
          console.log('=== PRICING2 onSuccess ===', data)
          if (data.paymeLink) {
            window.location.href = data.paymeLink
          } else if (data.checkoutUrl) {
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
          <h2 className="text-3xl font-semibold mb-3">
            {t('marketing.pricing.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('marketing.pricing.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-sm">{t('marketing.pricing.monthly')}</span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className="text-sm">{t('marketing.pricing.yearly')}</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {t('marketing.pricing.save')}
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
                  {t('marketing.pricing.popular')}
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
                  /
                  {yearly
                    ? t('marketing.pricing.yr')
                    : t('marketing.pricing.mo')}
                </span>
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
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
                    {t('marketing.pricing.loading')}
                  </>
                ) : (
                  plan.cta
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="relative mt-8 max-w-5xl mx-auto w-full group">
          {/* Subtle animated gradient glow effect behind the card */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-blue-600/30 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500"></div>

          <button
            onClick={() => setEnterpriseExpanded(!enterpriseExpanded)}
            className="relative w-full rounded-2xl border border-primary/20 bg-background/60 backdrop-blur-lg p-6 md:p-10 text-left transition-all duration-300 hover:border-primary/50 hover:bg-background/80 hover:shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold">
                    {t('marketing.pricing.enterprise.name')}
                  </h3>
                  <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
                    {t('marketing.pricing.enterprise.badge')}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  {t('marketing.pricing.enterprise.desc')}
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
                    {enterpriseFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="shrink-0 pt-2 shrink-0 flex items-center justify-center p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <ChevronDown
                  className={cn(
                    'w-6 h-6 text-primary transition-transform duration-300',
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
                    <h4 className="font-semibold">
                      {t('marketing.pricing.enterprise.b2b_title')}
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    {b2bFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
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
                    <h4 className="font-semibold">
                      {t('marketing.pricing.enterprise.b2g_title')}
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    {b2gFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
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
                  {t('marketing.pricing.enterprise.tailored')}
                </p>
                <Button
                  size="lg"
                  className="px-8 shadow-lg shadow-primary/25"
                  asChild
                >
                  <a href="mailto:sales@callmind.uz">
                    {t('marketing.pricing.enterprise.cta')}
                  </a>
                </Button>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {t('marketing.pricing.need_more')}{' '}
          <a href="mailto:sales@callmind.uz" className="underline">
            {t('marketing.pricing.contact_link')}
          </a>{' '}
          {t('marketing.pricing.enterprise_suffix')}
        </p>
      </div>
    </section>
  )
}

export { Pricing2 }
