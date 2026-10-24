import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";
import { simpleSearchProductListings, type SimpleSearchProductListingsData } from "@/client";
import {
    mapPersonalizedProductListingSummary,
    type ProductListing,
} from "@/data/internal/product/ProductListing.ts";
import { toMinorCurrencyAmount } from "@/data/internal/price/Price.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import {
    mapToListingAvailabilityQuery,
    matchesNoListingAvailability,
} from "@/data/internal/search/ListingAvailabilityQuery.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { parseCurrency, type Currency } from "@/data/internal/common/Currency.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const PREVIEW_SIZE = 4;

function toListingSearchQuery(
    search: SearchFilterArguments,
    language: string,
    currency: Currency,
): NonNullable<SimpleSearchProductListingsData["query"]> {
    let productQuery: string[];
    if (search.queryTerms?.length) {
        productQuery = search.queryTerms;
    } else if (search.q) {
        productQuery = [search.q];
    } else {
        productQuery = [];
    }

    return {
        language: parseLanguage(language),
        currency: parseCurrency(currency),
        productQuery,
        enhancedSearchDescription: search.enhancedSearchDescription,
        excludeProductListingId: search.excludeProductId,
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
        ...mapToListingAvailabilityQuery(search),
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

    return useQuery({
        queryKey: productListingQueryKeys.savedSearchPreview(search, {
            language: parseLanguage(i18n.language),
            currency: preferences.currency,
        }),
        enabled,
        queryFn: async () => {
            if (matchesNoListingAvailability(search)) return [];

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
