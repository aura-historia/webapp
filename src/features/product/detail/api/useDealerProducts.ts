import { simpleSearchProductListings } from "@/client";
import {
    mapPersonalizedProductListingSummary,
    type ProductListing,
} from "@/data/internal/product/ProductListing.ts";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useTranslation } from "react-i18next";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";

const DEALER_PRODUCTS_SIZE = 8;

export function useDealerProducts(
    listingSourceId: string,
    excludeProductListingId: string,
): UseQueryResult<ProductListing[]> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();

    return useQuery({
        queryKey: [
            "dealerProducts",
            listingSourceId,
            excludeProductListingId,
            i18n.language,
            preferences.currency,
        ],
        queryFn: async () => {
            const result = await simpleSearchProductListings({
                query: {
                    language: parseLanguage(i18n.language),
                    currency: preferences.currency,
                    size: DEALER_PRODUCTS_SIZE,
                    sort: "updated",
                    order: "desc",
                    listingSourceId: [listingSourceId],
                    excludeProductId: [excludeProductListingId],
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return (
                result.data?.items?.map((product) =>
                    mapPersonalizedProductListingSummary(product, i18n.language),
                ) ?? []
            );
        },
    });
}
