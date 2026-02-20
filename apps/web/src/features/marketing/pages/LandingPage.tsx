import { lazy, Suspense } from 'react'
import HeroSection from '../components/hero-section'
import FooterSection from '../components/footer'

const FeaturesSection = lazy(() => import('../components/features-8'))
const Features = lazy(() => import('@/components/features-12'))
const Pricing2 = lazy(() =>
  import('../components/pricing2').then((m) => ({ default: m.Pricing2 })),
)
const VoiceComparison = lazy(() =>
  import('../components/voice-comparison').then((m) => ({
    default: m.VoiceComparison,
  })),
)
const WallOfLoveSection = lazy(() => import('../components/testimonials'))
const CallToAction = lazy(() => import('../components/call-to-action'))
const FAQsFour = lazy(() => import('../components/faqs-4'))

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<SectionLoader />}>
        <div id="features" className="scroll-mt-20">
          <FeaturesSection />
          <Features />
        </div>
        <div id="pricing" className="scroll-mt-20">
          <Pricing2 />
          <VoiceComparison />
        </div>
        <div id="testimonials" className="scroll-mt-20">
          <WallOfLoveSection />
        </div>
        <div id="solutions" className="scroll-mt-20">
          <CallToAction />
        </div>
        <div id="faq" className="scroll-mt-20">
          <FAQsFour />
        </div>
      </Suspense>
      <FooterSection />
    </>
  )
}
