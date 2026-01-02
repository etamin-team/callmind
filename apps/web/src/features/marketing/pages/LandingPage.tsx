import HeroSection from "../components/hero-section";
import FooterSection from "../components/footer";
import FeaturesSection from "../components/features-8";
import CallToAction from "../components/call-to-action";
import { Pricing2 } from "../components/pricing2";
import WallOfLoveSection from "../components/testimonials";
import FAQsFour from "../components/faqs-4";
import Features from "@/components/features-12";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
       <Features />
      <Pricing2 />
      <WallOfLoveSection />
      <CallToAction />
     
      <FAQsFour />
      <FooterSection />
      
    </>
  );
}