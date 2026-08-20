import { useQuery } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";
import { simpleSearchProductsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { LANDING_PAGE_FRAGMENTS } from "@/components/landing-page/LandingPage.fragments.ts";
import RecentlyAddedSection from "@/components/landing-page/recently-added-section/RecentlyAddedSection.tsx";
import { RecentlyAddedSectionSkeleton } from "@/components/landing-page/recently-added-section/RecentlyAddedSectionSkeleton.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { mapPersonalizedGetProductSummaryDataToOverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { useTranslation } from "react-i18next";

export function RecentlyAddedClientSection() {
    return (
        // We only want this on the client, since it will cause hydration mismatches
        <ClientOnly fallback={<RecentlyAddedSectionSkeleton />}>
            <RecentlyAddedContent />
        </ClientOnly>
    );
}

function RecentlyAddedContent() {
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();
    const { data, isPending } = useQuery(
        simpleSearchProductsOptions({
            query: {
                sort: "created",
                order: "desc",
                size: 12,
                language: parseLanguage(i18n.language),
                currency: preferences.currency,
            },
        }),
    );

    const products = (data?.items ?? []).map((product) =>
        mapPersonalizedGetProductSummaryDataToOverviewProduct(product, i18n.language),
    );

    if (isPending) return <RecentlyAddedSectionSkeleton />;
    if (products.length === 0) return null;

    return (
        <div id={LANDING_PAGE_FRAGMENTS.recentlyAdded} className="scroll-mt-24">
            <RecentlyAddedSection products={products} />
        </div>
    );
}
