import PricingSection from "@/features/billing/components/PricingSection.tsx";
import { DealersSection } from "@/features/landing/components/dealers-section/DealersSection.tsx";
import FAQSection from "@/features/landing/components/faq-section/FAQSection.tsx";
import HeroSection from "@/features/landing/components/hero-section/HeroSection.tsx";
import HowItWorksSection from "@/features/landing/components/how-it-works-section/HowItWorksSection.tsx";
import { LatestAcquisitionsSection } from "@/features/landing/components/latest-acquisitions-section/LatestAcquisitionsSection.tsx";
import { OpportunitySection } from "@/features/landing/components/opportunity-section/OpportunitySection.tsx";
import { PlatformSection } from "@/features/landing/components/platform-section/PlatformSection.tsx";
import NewsletterSection from "@/features/newsletter/components/NewsletterSection.tsx";

/**
 * The landing page, chapter by chapter as in the design: hero, latest acquisitions,
 * I–VII, and the closing newsletter band.
 */
export default function LandingPage() {
    return (
        <div className="flex flex-col">
            <HeroSection />
            <LatestAcquisitionsSection />
            <OpportunitySection />
            <PlatformSection />
            <HowItWorksSection />
            {/* Pricing stays hidden until paid plans launch. */}
            <div hidden>
                <PricingSection />
            </div>
            <DealersSection />
            <FAQSection />
            <NewsletterSection />
        </div>
    );
}
