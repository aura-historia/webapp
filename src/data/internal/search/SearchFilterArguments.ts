import type { ListingAvailability } from "@/data/internal/product/ProductListingDomain.ts";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ProductListingDomain.ts";
import type { ListingOrderability } from "@/data/internal/product/ListingOrderability.ts";
import type { SortMode } from "@/data/internal/search/SortMode.ts";

export type SearchFilterArguments = {
    q: string;
    queryTerms?: string[];
    enhancedSearchDescription?: string;
    excludeProductId?: string[];
    listingSourceId?: string[];
    excludeListingSourceId?: string[];
    auctionId?: string[];
    priceFrom?: number;
    priceTo?: number;
    availability?: Exclude<ListingAvailability, "UNKNOWN">[];
    /** Saved-search-only criteria; intentionally omitted from public GET search requests. */
    orderability?: ListingOrderability[] | null;
    includeUnspecifiedAvailability?: boolean | null;
    /** Presentation labels paired by index with source IDs in search URLs. */
    listingSourceLabels?: string[];
    excludeListingSourceLabels?: string[];
    creationDateFrom?: Date;
    creationDateTo?: Date;
    updateDateFrom?: Date;
    updateDateTo?: Date;
    auctionDateFrom?: Date;
    auctionDateTo?: Date;
    sortField?: SortMode["field"];
    sortOrder?: SortMode["order"];
};

/** Returns true when any advanced range or source filter is set. */
export function hasAdvancedFilterDetails(filters: SearchFilterArguments): boolean {
    return (
        !!filters.listingSourceId?.length ||
        !!filters.excludeListingSourceId?.length ||
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
        (filters.availability != null &&
            filters.availability.length !== LISTING_AVAILABILITIES.length) ||
        filters.orderability != null ||
        filters.includeUnspecifiedAvailability != null ||
        !!filters.excludeProductId?.length ||
        hasAdvancedFilterDetails(filters)
    );
}
