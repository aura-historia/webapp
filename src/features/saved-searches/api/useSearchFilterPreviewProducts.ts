import { simpleSearchProductListings, type SimpleSearchProductListingsData } from "@/client";
import {
    mapPersonalizedProductListingSummary,
    type ProductListing,
} from "@/data/internal/product/ProductListing.ts";
import { toMinorCurrencyAmount } from "@/data/internal/price/Price.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { parseCurrency, type Currency } from "@/data/internal/common/Currency.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const PREVIEW_SIZE = 4;

/** GET listing search cannot apply these saved-search-only conditions. */
export function canPreviewSavedSearch(search: SearchFilterArguments): boolean {
    return search.orderability == null && search.includeUnspecifiedAvailability == null;
}

function toListingSearchQuery(
    search: SearchFilterArguments,
    language: string,
    currency: Currency,
): NonNullable<SimpleSearchProductListingsData["query"]> {
    return {
        language: parseLanguage(language),
        currency: parseCurrency(currency),
        productQuery: search.queryTerms?.length ? search.queryTerms : search.q ? [search.q] : [],
        enhancedSearchDescription: search.enhancedSearchDescription,
        excludeProductId: search.excludeProductId,
        listingSourceId: search.listingSourceId,
        excludeListingSourceId: search.excludeListingSourceId,
        auctionId: search.auctionId,
        price:
            search.priceFrom != null || search.priceTo != null
                ? {
                      min:
                          search.priceFrom == null
                              ? undefined
                              : toMinorCurrencyAmount(search.priceFrom, currency),
                      max:
                          search.priceTo == null
                              ? undefined
                              : toMinorCurrencyAmount(search.priceTo, currency),
                  }
                : undefined,
        availability: search.availability,
        created:
            search.creationDateFrom != null || search.creationDateTo != null
                ? {
                      min: search.creationDateFrom?.toISOString(),
                      max: search.creationDateTo?.toISOString(),
                  }
                : undefined,
        updated:
            search.updateDateFrom != null || search.updateDateTo != null
                ? {
                      min: search.updateDateFrom?.toISOString(),
                      max: search.updateDateTo?.toISOString(),
                  }
                : undefined,
        lotBiddingOpens:
            search.auctionDateFrom != null || search.auctionDateTo != null
                ? {
                      min: search.auctionDateFrom?.toISOString(),
                      max: search.auctionDateTo?.toISOString(),
                  }
                : undefined,
        size: PREVIEW_SIZE,
    };
}

export function useSearchFilterPreviewProducts(
    search: SearchFilterArguments,
    enabled: boolean,
): UseQueryResult<ProductListing[]> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();
    const previewable = canPreviewSavedSearch(search);

    return useQuery({
        queryKey: ["searchFilterPreviewProducts", search, i18n.language, preferences.currency],
        enabled: enabled && previewable,
        queryFn: async () => {
            const currency = search.currency ?? preferences.currency;
            const result = await simpleSearchProductListings({
                query: toListingSearchQuery(search, i18n.language, currency),
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return result.data.items.map((item) =>
                mapPersonalizedProductListingSummary(item, i18n.language),
            );
        },
    });
}
