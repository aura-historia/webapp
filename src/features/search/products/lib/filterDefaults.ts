import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

/** Minimum number of characters required for a search query */
export const MIN_SEARCH_QUERY_LENGTH = 3;

export type ProductFilterFormValues = {
    priceSpan?: {
        min?: number;
        max?: number;
    };
    availability: (typeof LISTING_AVAILABILITIES)[number][];
    creationDate: {
        from?: Date;
        to?: Date;
    };
    updateDate: {
        from?: Date;
        to?: Date;
    };
    auctionDate: {
        from?: Date;
        to?: Date;
    };
    listingSourceId: string[];
    excludeListingSourceId: string[];
    listingSourceLabels: string[];
    excludeListingSourceLabels: string[];
};

export const FILTER_DEFAULTS: ProductFilterFormValues = {
    priceSpan: { min: undefined, max: undefined },
    availability: [...LISTING_AVAILABILITIES],
    creationDate: { from: undefined, to: undefined },
    updateDate: { from: undefined, to: undefined },
    auctionDate: { from: undefined, to: undefined },
    listingSourceId: [],
    excludeListingSourceId: [],
    listingSourceLabels: [],
    excludeListingSourceLabels: [],
};
