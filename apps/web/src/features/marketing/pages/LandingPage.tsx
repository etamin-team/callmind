import HeroSection from "../components/hero-section";
import FooterSection from "../components/footer";
import FeaturesSection from "../components/features-8";
import CallToAction from "../components/call-to-action";
import { Pricing2 } from "../components/pricing2";
import { VoiceComparison } from "../components/voice-comparison";
import WallOfLoveSection from "../components/testimonials";
import FAQsFour from "../components/faqs-4";
import Features from "@/components/features-12";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
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
      <FooterSection />
    </>
  );
}