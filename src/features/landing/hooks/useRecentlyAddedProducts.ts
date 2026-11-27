import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { simpleSearchProductListings } from "@/client";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { mapPersonalizedProductListingSummary } from "@/data/internal/product/ProductListing.ts";
import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";

export const RECENTLY_ADDED_COUNT = 12;

const HOUR_MS = 60 * 60 * 1000;

/**
 * Translation and embedding run in batches that mostly finish within an hour but can take up to
 * 24 hours. A listing newer than that may still show its original-language text, so the rail
 * skips it.
 */
export const ENRICHMENT_LAG_MS = 24 * HOUR_MS;

/**
 * Newest `created` time the rail shows (RFC 3339): at least `ENRICHMENT_LAG_MS` before `now`,
 * rounded down to the full hour so the request URL stays the same for an hour and anonymous
 * responses are shared at the edge.
 */
export function enrichedCreatedCutoff(now: number = Date.now()): string {
    return new Date(Math.floor((now - ENRICHMENT_LAG_MS) / HOUR_MS) * HOUR_MS).toISOString();
}

/**
 * The newest listings in the index that enrichment has had time to finish. Client-only by
 * design: this inventory changes too often to be baked into prerendered landing-page HTML.
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
                    created: { max: enrichedCreatedCutoff() },
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
