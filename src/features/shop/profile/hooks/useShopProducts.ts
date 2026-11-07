import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";
import { simpleSearchProductListings } from "@/client";
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
import {
    mapListingSearchCursor,
    serializeListingSearchCursor,
    type ListingSearchCursor,
} from "@/data/internal/search/SearchResultData.ts";

const PAGE_SIZE = 20;

export type ShopProductsPage = {
    products: ProductListing[];
    total: number | undefined;
    searchAfter: ListingSearchCursor | undefined;
};

/**
 * One provider's indexed listings, newest update first. With a `query`, the backend searches all
 * of the provider's listings for it and returns the best matches first.
 */
export function useShopProducts(
    listingSourceId: string,
    query = "",
): UseInfiniteQueryResult<InfiniteData<ShopProductsPage>> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();
    const language = parseLanguage(i18n.language);

    return useInfiniteQuery({
        queryKey: productListingQueryKeys.source(
            listingSourceId,
            PAGE_SIZE,
            { language, currency: preferences.currency },
            query,
        ),
        queryFn: async ({ pageParam }) => {
            const result = await simpleSearchProductListings({
                query: {
                    language,
                    currency: preferences.currency,
                    searchAfter: pageParam ? serializeListingSearchCursor(pageParam) : undefined,
                    size: PAGE_SIZE,
                    sort: query ? "score" : "updated",
                    order: "desc",
                    listingSourceId: [listingSourceId],
                    productQuery: query ? [query] : undefined,
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
                total: result.data?.total ?? undefined,
                searchAfter: mapListingSearchCursor(result.data?.searchAfter),
            };
        },
        initialPageParam: undefined as ListingSearchCursor | undefined,
        getNextPageParam: (lastPage) => lastPage.searchAfter,
    });
}
