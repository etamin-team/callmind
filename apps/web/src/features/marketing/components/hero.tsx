import { ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/button'

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center pt-16">
      <div className="page-wrap">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] mb-8">
            <span className="text-xs font-semibold">Now in beta</span>
          </div>

          {/* Main headline */}
          <h1 className="mb-6">
            AI that helps you close more deals
          </h1>

          {/* Subheading */}
          <p className="text-xl mb-10 text-[var(--color-text-muted)]" style={{ maxWidth: '480px', lineHeight: '1.6' }}>
            Real-time coaching for sales calls. Listen, learn, and improve with AI-powered insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button size="lg">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Watch demo
            </Button>
          </div>

          {/* Trust indicator */}
          <div className="mt-16 pt-8 border-t border-[var(--color-border-subtle)]">
            <p className="text-xs font-semibold text-[var(--color-text-dim)] uppercase tracking-wide mb-4">
              Trusted by sales teams at
            </p>
            <div className="flex flex-wrap items-center gap-8">
              {['Acme', 'Stripe', 'Vercel', 'Linear', 'Notion'].map((company) => (
                <span key={company} className="text-lg font-semibold text-[var(--color-text-dim)]">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient orb */}
      <div className="absolute top-1/4 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent)]/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  )
}
