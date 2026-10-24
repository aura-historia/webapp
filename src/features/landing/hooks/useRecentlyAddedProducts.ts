import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { simpleSearchProductListings } from "@/client";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { mapPersonalizedProductListingSummary } from "@/data/internal/product/ProductListing.ts";
import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";

export const RECENTLY_ADDED_COUNT = 12;

/**
 * The newest listings in the index. Client-only by design: this inventory changes too often
 * to be baked into prerendered landing-page HTML.
 */
export function useRecentlyAddedProducts() {
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();
    const language = parseLanguage(i18n.language);

    return useQuery({
        queryKey: productListingQueryKeys.recentlyAdded({
            language,
            currency: preferences.currency,
        }),
        queryFn: async ({ signal }) => {
            const { data } = await simpleSearchProductListings({
                query: {
                    sort: "created",
                    order: "desc",
                    size: RECENTLY_ADDED_COUNT,
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
}
