import DiscoverSection from "@/components/landing-page/discover-section/DiscoverSection.tsx";
import FAQSection from "@/components/landing-page/faq-section/FAQSection.tsx";
import HeroSection from "@/components/landing-page/hero-section/HeroSection.tsx";
import FeaturesSection from "@/components/landing-page/features-section/FeaturesSection.tsx";
import HowItWorksSection from "@/components/landing-page/how-it-works-section/HowItWorksSection.tsx";
import TestimonialsSection from "@/components/landing-page/testimonials-section/TestimonialsSection.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/pageHeadMeta.ts";
import { env } from "@/env";
import CategoriesSection from "@/components/landing-page/categories-section/CategoriesSection";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getCategoriesOptions } from "@/client/@tanstack/react-query.gen";
import { mapToCategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";

export const Route = createFileRoute("/")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(
            getCategoriesOptions({ query: { language: parseLanguage(i18n.language) } }),
        );
    },
    head: () =>
        generatePageHeadMeta({
            pageKey: "home",
            url: `${env.VITE_APP_URL}/`,
        }),
    component: LandingPage,
});

function LandingPage() {
    const { data: categoriesData } = useSuspenseQuery(getCategoriesOptions());
    const categories = categoriesData.map(mapToCategoryOverview);

    return (
        <>
            <HeroSection />
            <CategoriesSection categories={categories} />
            <DiscoverSection />
            <FeaturesSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <FAQSection />
        </>
    );
}
