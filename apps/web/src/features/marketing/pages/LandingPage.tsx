import { CTA } from '../components/cta'
import { FAQ } from '../components/faq'
import { Features } from '../components/features'
import { Footer } from '../components/footer'
import { Hero } from '../components/hero'
import { HowItWorks } from '../components/how-it-works'
import { Navbar } from '../components/navbar'
import { Pricing } from '../components/pricing'
import { Testimonials } from '../components/testimonials'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
