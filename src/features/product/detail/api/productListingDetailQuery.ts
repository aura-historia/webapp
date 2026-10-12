import { getProductListingByTitleSlug } from "@/client";
import { queryOptions } from "@tanstack/react-query";
import {
    productListingQueryKeys,
    type ProductListingDetailQueryContext,
} from "@/data/internal/product/ProductListingQueryKeys.ts";

/**
 * Product detail for the route loader and page. The cache holds the raw personalized DTO so SSR
 * dehydration stays serializable; the page maps it to `ProductListingDetail`. Errors are thrown as
 * the API problem body so the loader can turn a 404 into `notFound()`.
 */
export function productListingDetailQueryOptions(
    productListingTitleSlugId: string,
    context: ProductListingDetailQueryContext,
) {
    return queryOptions({
        queryKey: productListingQueryKeys.detailBySlug(productListingTitleSlugId, context),
        queryFn: async ({ signal }) => {
            const { data } = await getProductListingByTitleSlug({
                path: { productListingTitleSlugId },
                query: { language: context.language, currency: context.currency },
                signal,
                throwOnError: true,
            });
            return data;
        },
    });
}
