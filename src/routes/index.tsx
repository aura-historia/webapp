import DiscoverSection from "@/components/landing-page/discover-section/DiscoverSection.tsx";
import FAQSection from "@/components/landing-page/faq-section/FAQSection.tsx";
import HeroSection from "@/components/landing-page/hero-section/HeroSection.tsx";
import FeaturesSection from "@/components/landing-page/features-section/FeaturesSection.tsx";
import HowItWorksSection from "@/components/landing-page/how-it-works-section/HowItWorksSection.tsx";
import TestimonialsSection from "@/components/landing-page/testimonials-section/TestimonialsSection.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";
import CategoriesSection from "@/components/landing-page/categories-section/CategoriesSection.tsx";
import PeriodsSection from "@/components/landing-page/periods-section/PeriodsSection.tsx";
import RecentlyAddedSection from "@/components/landing-page/recently-added-section/RecentlyAddedSection.tsx";
import { useQuery } from "@tanstack/react-query";
import {
    getCategoriesOptions,
    getPeriodsOptions,
    simpleSearchProductsOptions,
} from "@/client/@tanstack/react-query.gen.ts";
import { mapToCategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { mapToPeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import { mapPersonalizedGetProductSummaryDataToOverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/preferences/useCurrency.ts";

export const Route = createFileRoute("/")({
    loader: async ({ context: { queryClient, initialPreferences } }) => {
        const currency = initialPreferences.currency;
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
            queryClient
                .ensureQueryData(
                    simpleSearchProductsOptions({
                        query: {
                            sort: "created",
                            order: "desc",
                            size: 12,
                            language: parseLanguage(i18n.language),
                            currency: currency,
                        },
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
    const currency = useCurrency();
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
    const { data: recentlyAddedData } = useQuery(
        simpleSearchProductsOptions({
            query: {
                sort: "created",
                order: "desc",
                size: 12,
                language: parseLanguage(i18n.language),
                currency: currency,
            },
        }),
    );

    const categories = (categoriesData ?? []).map(mapToCategoryOverview);
    const periods = (periodsData ?? []).map(mapToPeriodOverview);
    const recentlyAdded = (recentlyAddedData?.items ?? []).map((p) =>
        mapPersonalizedGetProductSummaryDataToOverviewProduct(p, i18n.language),
    );

    return (
        <div className="flex flex-col min-h-screen">
            <HeroSection />
            {categories.length > 0 && <CategoriesSection categories={categories} />}
            {recentlyAdded.length > 0 && <RecentlyAddedSection products={recentlyAdded} />}
            {periods.length > 0 && <PeriodsSection periods={periods} />}
            <DiscoverSection />
            <FeaturesSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <FAQSection />
        </div>
    );
}
