import { Check, Minus } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Navbar } from '../components/navbar'
import { Footer } from '../components/footer'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small teams getting started.',
    price: '$29',
    period: 'per user/month',
    features: [
      '100 call recordings/month',
      'Basic AI transcription',
      'Email support',
      '1 month retention',
      'Team dashboard',
    ],
    cta: 'Start free trial',
  },
  {
    name: 'Pro',
    description: 'For growing teams that need more power.',
    price: '$79',
    period: 'per user/month',
    popular: true,
    features: [
      'Unlimited call recordings',
      'Advanced AI insights',
      'Priority support',
      '12 month retention',
      'Custom coaching plans',
      'CRM integrations',
    ],
    cta: 'Start free trial',
  },
  {
    name: 'Business',
    description: 'For scaling teams with advanced needs.',
    price: '$149',
    period: 'per user/month',
    features: [
      'Everything in Pro',
      'Unlimited call recordings',
      'Advanced AI insights',
      'API access',
      'Unlimited CRM integrations',
      'Dedicated support',
    ],
    cta: 'Start free trial',
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with custom needs.',
    price: 'Custom',
    period: "let's talk",
    features: [
      'Everything in Business',
      'Unlimited retention',
      'Dedicated success manager',
      'Custom integrations',
      'SSO & advanced security',
      'SLA guarantee',
    ],
    cta: 'Contact sales',
  },
]

// Comparison table features - 4 plans
const comparisonFeatures = [
  { name: 'Call recordings', starter: '100/month', pro: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'AI transcription', starter: 'Basic', pro: 'Advanced', business: 'Advanced', enterprise: 'Advanced + Custom' },
  { name: 'Sentiment analysis', starter: false, pro: true, business: true, enterprise: true },
  { name: 'Custom coaching', starter: false, pro: true, business: true, enterprise: true },
  { name: 'CRM integrations', starter: false, pro: '5+', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'API access', starter: false, pro: false, business: true, enterprise: true },
  { name: 'Email support', starter: true, pro: true, business: true, enterprise: true },
  { name: 'Priority support', starter: false, pro: true, business: true, enterprise: true },
  { name: 'Data retention', starter: '1 month', pro: '12 months', business: '12 months', enterprise: 'Unlimited' },
  { name: 'Team members', starter: 'Up to 10', pro: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
]

function getFeatureDisplay(value: string | boolean): React.ReactNode {
  if (value === false) {
    return <Minus className="h-4 w-4 mx-auto text-muted-foreground/40" />
  }
  if (value === true) {
    return <Check className="h-4 w-4 mx-auto text-foreground" />
  }
  return <span>{value}</span>
}

export function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20">
          <div className="page-wrap">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground mb-4">
                Simple, transparent pricing
              </h1>
              <p className="text-lg text-muted-foreground">
                No hidden fees. Cancel anytime. Start with a 14-day free trial.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 border-t border-border">
          <div className="page-wrap">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`border rounded-lg p-6 flex flex-col ${
                    plan.popular
                      ? 'border-foreground bg-card shadow-lg'
                      : 'border-border bg-card/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="text-xs font-medium text-foreground mb-4">Most popular</div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-semibold text-foreground">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? 'default' : 'outline'}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 border-t border-border bg-muted/20">
          <div className="page-wrap">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-semibold text-foreground mb-10 text-center">
                Compare all features
              </h2>

              <div className="border border-border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-5 border-b border-border bg-muted/30">
                  <div className="p-4 font-medium text-foreground text-sm">Feature</div>
                  <div className="p-4 font-medium text-foreground text-sm text-center">Starter</div>
                  <div className="p-4 font-medium text-foreground text-sm text-center bg-foreground/5">Pro</div>
                  <div className="p-4 font-medium text-foreground text-sm text-center">Business</div>
                  <div className="p-4 font-medium text-foreground text-sm text-center">Enterprise</div>
                </div>

                {/* Rows */}
                {comparisonFeatures.map((feature) => (
                  <div key={feature.name} className="grid grid-cols-5 border-b border-border last:border-b-0">
                    <div className="p-4 text-sm text-foreground/70">{feature.name}</div>
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      {getFeatureDisplay(feature.starter)}
                    </div>
                    <div className="p-4 text-sm text-center text-muted-foreground bg-foreground/5">
                      {getFeatureDisplay(feature.pro)}
                    </div>
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      {getFeatureDisplay(feature.business)}
                    </div>
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      {getFeatureDisplay(feature.enterprise)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-t border-border">
          <div className="page-wrap">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-foreground mb-10 text-center">
                Frequently asked questions
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: 'Can I change plans later?',
                    a: 'Yes, you can upgrade or downgrade your plan at any time. Prorated charges will be applied.',
                  },
                  {
                    q: 'What payment methods do you accept?',
                    a: 'We accept all major credit cards, including Visa, Mastercard, and American Express.',
                  },
                  {
                    q: 'Is there a free trial?',
                    a: 'Yes! All plans come with a 14-day free trial. No credit card required to start.',
                  },
                  {
                    q: 'Do you offer discounts for nonprofits?',
                    a: 'Yes, we offer special pricing for nonprofits and educational institutions. Contact us for details.',
                  },
                ].map((faq) => (
                  <div
                    key={faq.q}
                    className="border border-border rounded-lg p-4 bg-card/50"
                  >
                    <h3 className="font-medium text-foreground mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
