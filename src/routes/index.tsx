import DiscoverSection from "@/components/landing-page/DiscoverSection.tsx";
import HeroSection from "@/components/landing-page/HeroSection.tsx";
import FeaturesSection from "@/components/landing-page/FeaturesSection.tsx";
import HowItWorksSection from "@/components/landing-page/HowItWorksSection.tsx";
import TestimonialsSection from "@/components/landing-page/TestimonialsSection.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
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
        </>
    );
}
