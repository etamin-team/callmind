import { ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/button'

export function CTA() {
  return (
    <section className="section-padding section-border">
      <div className="page-wrap">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="mb-4">Ready to close more deals?</h2>
          <p className="text-lg mb-8">
            Join thousands of sales teams using Callmind to improve their calls.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg">
              Start your free trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Schedule a demo
            </Button>
          </div>

          <p className="text-sm text-[var(--color-text-dim)] mt-6">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
