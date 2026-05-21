import type { ProductState } from "@/data/internal/product/ProductState.ts";
import type { SortMode } from "@/data/internal/search/SortMode.ts";
import type { ShopType } from "@/data/internal/shop/ShopType.ts";

export type SearchFilterArguments = {
    q: string;
    priceFrom?: number;
    priceTo?: number;
    allowedStates?: ProductState[];
    creationDateFrom?: Date;
    creationDateTo?: Date;
    updateDateFrom?: Date;
    updateDateTo?: Date;
    auctionDateFrom?: Date;
    auctionDateTo?: Date;
    merchant?: string[];
    excludeMerchant?: string[];
    seller?: string[];
    excludeSeller?: string[];
    shopType?: ShopType[];
    sortField?: SortMode["field"];
    sortOrder?: SortMode["order"];
};

/**
 * Returns true if any "advanced" filter detail is set — those shown in the
 * collapsed accordion section of SearchFilterCard (merchants, dates).
 */
export function hasAdvancedFilterDetails(filters: SearchFilterArguments): boolean {
    return (
        !!filters.merchant?.length ||
        !!filters.excludeMerchant?.length ||
        filters.creationDateFrom != null ||
        filters.creationDateTo != null ||
        filters.updateDateFrom != null ||
        filters.updateDateTo != null ||
        filters.auctionDateFrom != null ||
        filters.auctionDateTo != null
    );
}

/** Returns true if any filter besides the search query is set. */
export function hasActiveFilters(filters: SearchFilterArguments): boolean {
    return (
        filters.priceFrom != null ||
        filters.priceTo != null ||
        filters.allowedStates != null ||
        filters.shopType != null ||
        hasAdvancedFilterDetails(filters)
    );
}
