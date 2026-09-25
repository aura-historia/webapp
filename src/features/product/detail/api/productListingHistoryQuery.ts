import { getProductListingHistoryOptions as generatedHistoryOptions } from "@/client/@tanstack/react-query.gen";
import { mapProductListingHistory } from "@/data/internal/product/ProductListingHistory.ts";
import { useQuery } from "@tanstack/react-query";

/** History is public, immutable listing data and varies only by canonical listing identity. */
export function productListingHistoryQueryOptions(productListingId: string) {
    return {
        ...generatedHistoryOptions({ path: { productListingId } }),
        select: mapProductListingHistory,
    };
}

export function useProductListingHistory(productListingId: string) {
    return useQuery(productListingHistoryQueryOptions(productListingId));
}

export function useOptionalProductListingHistory(productListingId: string | undefined) {
    return useQuery({
        ...productListingHistoryQueryOptions(productListingId ?? ""),
        enabled: Boolean(productListingId),
    });
}
