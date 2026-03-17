import DiscoverSection from "@/components/landing-page/discover-section/DiscoverSection.tsx";
import FAQSection from "@/components/landing-page/faq-section/FAQSection.tsx";
import HeroSection from "@/components/landing-page/hero-section/HeroSection.tsx";
import FeaturesSection from "@/components/landing-page/features-section/FeaturesSection.tsx";
import HowItWorksSection from "@/components/landing-page/how-it-works-section/HowItWorksSection.tsx";
import TestimonialsSection from "@/components/landing-page/testimonials-section/TestimonialsSection.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/pageHeadMeta.ts";
import { env } from "@/env";
import CategoriesSection from "@/components/landing-page/categories-section/CategoriesSection.tsx";
import PeriodsSection from "@/components/landing-page/periods-section/PeriodsSection.tsx";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesOptions, getPeriodsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { mapToCategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { mapToPeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/")({
    loader: async ({ context: { queryClient } }) => {
        await Promise.all([
            queryClient
                .ensureQueryData(
                    getCategoriesOptions({
                        query: { language: parseLanguage(i18n.language) },
                    }),
                )
                .catch(() => null),
            queryClient
                .ensureQueryData(
                    getPeriodsOptions({
                        query: { language: parseLanguage(i18n.language) },
                    }),
                )
                .catch(() => null),
        ]);
    },
    head: () =>
        generatePageHeadMeta({
            pageKey: "home",
            url: `${env.VITE_APP_URL}/`,
        }),
    component: LandingPage,
});

function LandingPage() {
    const { i18n } = useTranslation();
    const { data: categoriesData } = useQuery(
        getCategoriesOptions({
            query: { language: parseLanguage(i18n.language) },
        }),
    );
    const { data: periodsData } = useQuery(
        getPeriodsOptions({
            query: { language: parseLanguage(i18n.language) },
        }),
    );

    const categories = (categoriesData ?? []).map(mapToCategoryOverview);
    const periods = (periodsData ?? []).map(mapToPeriodOverview);

    return (
        <div className="flex flex-col min-h-screen">
            <HeroSection />
            {categories.length > 0 && <CategoriesSection categories={categories} />}
            {periods.length > 0 && <PeriodsSection periods={periods} />}
            <DiscoverSection />
            <FeaturesSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <FAQSection />
        </div>
    );
}
