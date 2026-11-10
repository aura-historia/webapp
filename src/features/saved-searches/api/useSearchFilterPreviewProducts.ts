import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";
import { previewUserSearchFilterMatches } from "@/client";
import {
    mapPersonalizedProductListingSummary,
    type ProductListing,
} from "@/data/internal/product/ProductListing.ts";
import { mapToBackendPreviewUserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { matchesNoListingAvailability } from "@/data/internal/search/ListingAvailabilityQuery.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export type SearchFilterPreviewResult = {
    readonly items: ProductListing[];
    /** Fewer than four matches were found among the candidates the preview evaluates. */
    readonly candidateLimitReached: boolean;
};

/** Carries the backend error code so the confirm step can tell a transient outage from a 422. */
export class SearchFilterPreviewError extends Error {
    constructor(
        readonly code: string,
        message: string,
    ) {
        super(message);
        this.name = "SearchFilterPreviewError";
    }
}

const NO_MATCHES_RESULT: SearchFilterPreviewResult = { items: [], candidateLimitReached: false };

export function useSearchFilterPreviewProducts(
    search: SearchFilterArguments,
    enabled: boolean,
): UseQueryResult<SearchFilterPreviewResult> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();

    return useQuery({
        queryKey: productListingQueryKeys.savedSearchPreview(search, {
            language: parseLanguage(i18n.language),
            currency: preferences.currency,
        }),
        enabled,
        // Each request costs up to 16 classifier calls: retry a transient outage once, never a
        // restricted-field or other error that a retry cannot fix.
        retry: (failureCount, error) =>
            failureCount < 1 &&
            error instanceof SearchFilterPreviewError &&
            error.code === "SEARCH_FILTER_TEMPORARILY_UNAVAILABLE",
        queryFn: async () => {
            if (matchesNoListingAvailability(search)) return NO_MATCHES_RESULT;

            const currency = search.currency ?? preferences.currency;
            const result = await previewUserSearchFilterMatches({
                body: mapToBackendPreviewUserSearchFilter({ ...search, currency }),
            });

            if (result.error) {
                const apiError = mapToInternalApiError(result.error);
                throw new SearchFilterPreviewError(apiError.error, getErrorMessage(apiError));
            }

            return {
                items: result.data.items.map((item) =>
                    mapPersonalizedProductListingSummary(item, i18n.language),
                ),
                candidateLimitReached: result.data.candidateLimitReached,
            };
        },
    });
}
