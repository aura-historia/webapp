import ArtworkStorySection from "@/components/landing-page/artwork-story-section/ArtworkStorySection.tsx";
import DiscoverSection from "@/components/landing-page/discover-section/DiscoverSection.tsx";
import FAQSection from "@/components/landing-page/faq-section/FAQSection.tsx";
import HeroSection from "@/components/landing-page/hero-section/HeroSection.tsx";
import FeaturesSection from "@/components/landing-page/features-section/FeaturesSection.tsx";
import HowItWorksSection from "@/components/landing-page/how-it-works-section/HowItWorksSection.tsx";
import PricingSection from "@/components/landing-page/pricing-section/PricingSection.tsx";
import NewsletterSection from "@/features/newsletter/components/NewsletterSection.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";
import { useQuery } from "@tanstack/react-query";
import { simpleSearchShopsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { LANDING_PAGE_FRAGMENTS } from "@/components/landing-page/LandingPage.fragments.ts";
import { RecentlyAddedClientSection } from "@/components/landing-page/recently-added-section/RecentlyAddedClientSection.tsx";

export const Route = createFileRoute("/$lng/")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "home",
            url: `${env.VITE_APP_URL}/`,
        }),
    component: LandingPage,
});

function LandingPage() {
    const { data: shopData } = useQuery(simpleSearchShopsOptions());

    return (
        <div className="flex flex-col min-h-screen">
            <div id={LANDING_PAGE_FRAGMENTS.hero} className="scroll-mt-24">
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
