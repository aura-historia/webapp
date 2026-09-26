import type { ProductState } from "@/data/internal/product/ProductState.ts";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

/** Minimum number of characters required for a search query */
export const MIN_SEARCH_QUERY_LENGTH = 3;

export type ProductFilterFormValues = {
    priceSpan?: {
        min?: number;
        max?: number;
    };
    productState: ProductState[];
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
    merchant?: string[];
    excludeMerchant?: string[];
    seller?: string[];
    excludeSeller?: string[];
    shopType: (typeof SHOP_TYPES)[number][];
    listingSourceId: string[];
    excludeListingSourceId: string[];
    listingSourceLabels: string[];
    excludeListingSourceLabels: string[];
};

export const FILTER_DEFAULTS: ProductFilterFormValues = {
    priceSpan: { min: undefined, max: undefined },
    availability: [...LISTING_AVAILABILITIES],
    productState: ["AVAILABLE", "LISTED", "UNKNOWN"],
    creationDate: { from: undefined, to: undefined },
    updateDate: { from: undefined, to: undefined },
    auctionDate: { from: undefined, to: undefined },
    merchant: undefined,
    excludeMerchant: undefined,
    seller: undefined,
    excludeSeller: undefined,
    shopType: [...SHOP_TYPES],
    listingSourceId: [],
    excludeListingSourceId: [],
    listingSourceLabels: [],
    excludeListingSourceLabels: [],
};
