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
      priceUzs: { monthly: 715694, yearly: 7156942 },
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
      priceUzs: { monthly: 2086431, yearly: 20864305 },
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
      priceUzs: { monthly: 4184991, yearly: 41849915 },
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
          <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl opacity-40 transition duration-500 group-hover:opacity-70" />

          <button
            type="button"
            onClick={() => setEnterpriseExpanded(!enterpriseExpanded)}
            className="relative isolate w-full overflow-hidden rounded-2xl border border-border/60 bg-card/70 px-6 py-8 text-left shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/35 hover:bg-card/85 hover:shadow-xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-70" />
            <div className="pointer-events-none absolute -right-10 top-6 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute left-6 bottom-6 h-36 w-36 rounded-full bg-primary/5 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                      {t('marketing.pricing.enterprise.name')}
                    </h3>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                      {t('marketing.pricing.enterprise.badge')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    {t('marketing.pricing.enterprise.desc')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/50 px-3 py-1 text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground">
                    <Building2 className="h-4 w-4 text-primary" />
                    {t('marketing.pricing.enterprise.badge')}
                  </div>
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/50 transition-colors',
                      enterpriseExpanded
                        ? 'border-primary/30 bg-primary/10'
                        : 'border-border/60 bg-background/50',
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        'w-6 h-6 text-primary transition-transform duration-300',
                        enterpriseExpanded && 'rotate-180',
                      )}
                    />
                  </div>
                </div>
              </div>

              <ul
                className={cn(
                  'grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm transition-all duration-300',
                  enterpriseExpanded
                    ? 'opacity-0 h-0 overflow-hidden'
                    : 'opacity-100',
                )}
              >
                {enterpriseFeatures.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-xl border border-border/50 bg-background/40 px-3 py-2"
                  >
                    <Check className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>

              <div
                className={cn(
                  'overflow-hidden transition-all duration-500 ease-in-out',
                  enterpriseExpanded
                    ? 'max-h-[800px] mt-8 pt-6 border-t border-border/60 opacity-100'
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
                    <div className="flex items-center gap-2 mb-4 text-sm font-semibold tracking-wide text-foreground">
                      <Building2 className="w-5 h-5 text-primary" />
                      {t('marketing.pricing.enterprise.b2b_title')}
                    </div>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {b2bFeatures.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
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
                    <div className="flex items-center gap-2 mb-4 text-sm font-semibold tracking-wide text-foreground">
                      <Landmark className="w-5 h-5 text-primary" />
                      {t('marketing.pricing.enterprise.b2g_title')}
                    </div>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {b2gFeatures.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
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
                    className="px-8 shadow-lg shadow-primary/15"
                    asChild
                  >
                    <a href="mailto:sales@callmind.uz">
                      {t('marketing.pricing.enterprise.cta')}
                    </a>
                  </Button>
                </div>
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
