import HeroSection from "../components/hero-section";
import FooterSection from "../components/footer";
import FeaturesSection from "../components/features-8";
import CallToAction from "../components/call-to-action";
import { Pricing2 } from "../components/pricing2";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <Pricing2 />
      <CallToAction />
      <FooterSection />
      
    </>
  );
}