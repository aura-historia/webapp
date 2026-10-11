import { getProductListingHistoryOptions as generatedHistoryOptions } from "@/client/@tanstack/react-query.gen";
import type { Currency } from "@/data/internal/common/Currency.ts";
import { mapProductListingHistory } from "@/data/internal/product/ProductListingHistory.ts";
import { useQuery } from "@tanstack/react-query";

/**
 * History is public, immutable listing data. It varies by canonical listing identity and the
 * optional display currency; omitting `currency` requests source values only. The currency is part
 * of the generated query key, so each variant has its own cache entry.
 */
export function productListingHistoryQueryOptions(productListingId: string, currency?: Currency) {
    return {
        ...generatedHistoryOptions({
            path: { productListingId },
            ...(currency && { query: { currency } }),
        }),
        select: mapProductListingHistory,
    };
}

export function useProductListingHistory(productListingId: string, currency?: Currency) {
    return useQuery(productListingHistoryQueryOptions(productListingId, currency));
}

export function useOptionalProductListingHistory(
    productListingId: string | undefined,
    currency?: Currency,
) {
    return useQuery({
        ...productListingHistoryQueryOptions(productListingId ?? "", currency),
        enabled: Boolean(productListingId),
    });
}
