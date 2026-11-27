import {
    SEARCHABLE_LISTING_AVAILABILITIES,
    type SearchableListingAvailability,
} from "@/data/internal/product/ListingAvailability.ts";

export type ProductFilterFormValues = {
    priceSpan?: {
        min?: number;
        max?: number;
    };
    availability: SearchableListingAvailability[];
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
    availability: [...SEARCHABLE_LISTING_AVAILABILITIES],
    creationDate: { from: undefined, to: undefined },
    updateDate: { from: undefined, to: undefined },
    auctionDate: { from: undefined, to: undefined },
    listingSourceId: [],
    excludeListingSourceId: [],
    listingSourceLabels: [],
    excludeListingSourceLabels: [],
};
