import { useQuery } from "@tanstack/react-query";
import { simpleSearchShopsOptions } from "@/client/@tanstack/react-query.gen.ts";
import ArtworkStorySection from "@/features/landing/components/artwork-story-section/ArtworkStorySection.tsx";
import DiscoverSection from "@/features/landing/components/discover-section/DiscoverSection.tsx";
import FAQSection from "@/features/landing/components/faq-section/FAQSection.tsx";
import FeaturesSection from "@/features/landing/components/features-section/FeaturesSection.tsx";
import HeroSection from "@/features/landing/components/hero-section/HeroSection.tsx";
import HowItWorksSection from "@/features/landing/components/how-it-works-section/HowItWorksSection.tsx";
import { RecentlyAddedClientSection } from "@/features/landing/components/recently-added-section/RecentlyAddedClientSection.tsx";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import PricingSection from "@/features/billing/components/PricingSection.tsx";
import NewsletterSection from "@/features/newsletter/components/NewsletterSection.tsx";

export default function LandingPage() {
    const { data: shopData } = useQuery(simpleSearchShopsOptions());

    return (
        <div className="flex flex-col min-h-screen">
            <div id={LANDING_PAGE_FRAGMENTS.hero} data-app-shell-hero className="scroll-mt-24">
                <HeroSection />
            </div>
            <ArtworkStorySection />
            <RecentlyAddedClientSection />
            <div id={LANDING_PAGE_FRAGMENTS.discover} className="scroll-mt-24">
                <DiscoverSection shopCount={shopData?.total ?? undefined} />
            </div>
            <div id={LANDING_PAGE_FRAGMENTS.features} className="scroll-mt-24">
                <FeaturesSection />
            </div>
            <div id={LANDING_PAGE_FRAGMENTS.howItWorks} className="scroll-mt-24">
                <HowItWorksSection />
            </div>
            <div id={LANDING_PAGE_FRAGMENTS.pricing} className="scroll-mt-24" hidden>
                <PricingSection />
            </div>
            <div id={LANDING_PAGE_FRAGMENTS.newsletter} className="scroll-mt-24">
                <NewsletterSection />
            </div>
            <div id={LANDING_PAGE_FRAGMENTS.faq} className="scroll-mt-24">
                <FAQSection />
            </div>
        </div>
    );
}
