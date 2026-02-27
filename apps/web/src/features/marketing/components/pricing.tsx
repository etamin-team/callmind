import { Check } from 'lucide-react'
import { Button } from '#/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: 'per user/month',
    description: 'For individuals and small teams.',
    features: [
      '50 recordings/month',
      'Basic transcription',
      'Email support',
      '30 day retention',
    ],
    cta: 'Start free trial',
  },
  {
    name: 'Pro',
    price: '$79',
    period: 'per user/month',
    description: 'For growing sales teams.',
    popular: true,
    features: [
      'Unlimited recordings',
      'Real-time coaching',
      'Priority support',
      '12 month retention',
      'CRM integrations',
      'Team analytics',
    ],
    cta: 'Start free trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'for large teams',
    description: 'For organizations with advanced needs.',
    features: [
      'Everything in Pro',
      'Unlimited retention',
      'Dedicated success manager',
      'Custom integrations',
      'SSO & advanced security',
      'SLA guarantee',
    ],
    cta: 'Contact sales',
  },
]

export function Pricing() {
  return (
    <section className="section-padding section-border">
      <div className="page-wrap">
        <div className="text-center mb-12">
          <h2 className="mb-4">Simple pricing</h2>
          <p className="max-w-md mx-auto">No hidden fees. Cancel anytime. 14-day free trial.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card p-6 ${
                plan.popular ? 'border-[var(--color-accent)]' : ''
              }`}
            >
              {plan.popular && (
                <span className="inline-block text-xs font-semibold text-[var(--color-accent)] mb-4">
                  Most popular
                </span>
              )}

              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-[var(--color-text-muted)] ml-1">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
