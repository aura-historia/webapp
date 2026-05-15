import type { SearchFilterMatchProductCollectionData } from "@/client";
import {
    mapPersonalizedGetProductDataToOverviewProduct,
    type OverviewProduct,
} from "@/data/internal/product/OverviewProduct.ts";

export type SearchFilterMatchProductCollection = {
    readonly items: readonly OverviewProduct[];
    readonly size: number;
    readonly searchAfter?: string;
    readonly total?: number;
};

export function mapToInternalSearchFilterMatchProductCollection(
    data: SearchFilterMatchProductCollectionData,
    locale: string,
): SearchFilterMatchProductCollection {
    return {
        items: data.items.map((item) =>
            mapPersonalizedGetProductDataToOverviewProduct(item, locale),
        ),
        size: data.size,
        searchAfter: data.searchAfter ?? undefined,
        total: data.total ?? undefined,
    };
}
