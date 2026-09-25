import type { SearchFilterMatchProductCollectionData } from "@/client";
import {
    mapPersonalizedProductListingDetails,
    type ProductListing,
} from "@/data/internal/product/ProductListing.ts";

export type SearchFilterMatchProductCollection = {
    readonly items: readonly ProductListing[];
    readonly size: number;
    readonly searchAfter?: string;
    readonly total?: number;
};

export function mapToInternalSearchFilterMatchProductCollection(
    data: SearchFilterMatchProductCollectionData,
    locale: string,
): SearchFilterMatchProductCollection {
    return {
        items: data.items.map((item) => mapPersonalizedProductListingDetails(item, locale)),
        size: data.size,
        searchAfter: data.searchAfter ? JSON.stringify(data.searchAfter) : undefined,
        total: data.total ?? undefined,
    };
}
