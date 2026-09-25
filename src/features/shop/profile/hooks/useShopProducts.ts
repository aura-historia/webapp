import { simpleSearchProductListings, type ProductListingSearchCursorData } from "@/client";
import { mapPersonalizedProductListingSummary } from "@/data/internal/product/ProductListing.ts";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import {
    type InfiniteData,
    useInfiniteQuery,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useTranslation } from "react-i18next";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";

const PAGE_SIZE = 20;

export type ShopProductsPage = {
    products: ProductListing[];
    searchAfter: ProductListingSearchCursorData | undefined;
};

export function useShopProducts(
    listingSourceId: string,
): UseInfiniteQueryResult<InfiniteData<ShopProductsPage>> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();

    return useInfiniteQuery({
        queryKey: [
            "sourceProductListings",
            listingSourceId,
            i18n.language,
            preferences.currency,
            PAGE_SIZE,
        ],
        queryFn: async ({ pageParam }) => {
            const result = await simpleSearchProductListings({
                query: {
                    language: parseLanguage(i18n.language),
                    currency: preferences.currency,
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                    sort: "updated",
                    order: "desc",
                    listingSourceId: [listingSourceId],
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return {
                products:
                    result.data?.items?.map((product) =>
                        mapPersonalizedProductListingSummary(product, i18n.language),
                    ) ?? [],
                searchAfter: result.data?.searchAfter ?? undefined,
            };
        },
        initialPageParam: undefined as ProductListingSearchCursorData | undefined,
        getNextPageParam: (lastPage) => lastPage.searchAfter ?? undefined,
    });
}
