import type { SearchableListingAvailability } from "@/data/internal/product/ListingAvailability.ts";
import type { ListingOrderability } from "@/data/internal/product/ListingOrderability.ts";
import type { SortMode } from "@/data/internal/search/SortMode.ts";
import type { Currency } from "@/data/internal/common/Currency.ts";
import type { SearchLocation } from "@/data/internal/search/SearchLocation.ts";

export type SearchFilterArguments = {
    q: string;
    currency?: Currency;
    queryTerms?: string[];
    enhancedSearchDescription?: string;
    excludeProductId?: string[];
    listingSourceId?: string[];
    excludeListingSourceId?: string[];
    auctionId?: string[];
    priceFrom?: number;
    priceTo?: number;
    availability?: SearchableListingAvailability[];
    /** Sent only alongside `availability`; see `mapToListingAvailabilityQuery`. */
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
    /**
     * The search page's location filter. Saved searches do not carry it yet (#1081); a distance
     * order inside it replaces `sortField` and `sortOrder`.
     */
    location?: SearchLocation;
};
