import DiscoverSection from "@/components/landing-page/discover-section/DiscoverSection.tsx";
import FAQSection from "@/components/landing-page/faq-section/FAQSection.tsx";
import HeroSection from "@/components/landing-page/hero-section/HeroSection.tsx";
import FeaturesSection from "@/components/landing-page/features-section/FeaturesSection.tsx";
import HowItWorksSection from "@/components/landing-page/how-it-works-section/HowItWorksSection.tsx";
import TestimonialsSection from "@/components/landing-page/testimonials-section/TestimonialsSection.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/pageHeadMeta.ts";

export const Route = createFileRoute("/")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "home",
            url: "https://aura-historia.com/",
        }),
    component: LandingPage,
});

function LandingPage() {
    return (
        <>
            <HeroSection />
            <DiscoverSection />
            <FeaturesSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <FAQSection />
        </>
    );
}
