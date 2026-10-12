import { useQuery } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";
import { simpleSearchProductListings } from "@/client";
import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import RecentlyAddedSection from "@/features/landing/components/recently-added-section/RecentlyAddedSection.tsx";
import { RecentlyAddedSectionSkeleton } from "@/features/landing/components/recently-added-section/RecentlyAddedSectionSkeleton.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { mapPersonalizedProductListingSummary } from "@/data/internal/product/ProductListing.ts";
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
    const language = parseLanguage(i18n.language);
    const { data: products = [], isPending } = useQuery({
        queryKey: productListingQueryKeys.recentlyAdded({
            language,
            currency: preferences.currency,
        }),
        queryFn: async ({ signal }) => {
            const { data } = await simpleSearchProductListings({
                query: {
                    sort: "created",
                    order: "desc",
                    size: 12,
                    language,
                    currency: preferences.currency,
                },
                signal,
                throwOnError: true,
            });
            return data.items.map((product) =>
                mapPersonalizedProductListingSummary(product, i18n.language),
            );
        },
    });

    if (isPending) return <RecentlyAddedSectionSkeleton />;
    if (products.length === 0) return null;

    return (
        <div id={LANDING_PAGE_FRAGMENTS.recentlyAdded} className="scroll-mt-24">
            <RecentlyAddedSection products={products} />
        </div>
    );
}
