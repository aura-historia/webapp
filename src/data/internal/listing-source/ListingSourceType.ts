import type { ListingSourceType as ListingSourceTypeData } from "@/client";

/**
 * A ListingSource's primary sales model, curated by administrators. Dealers and auction houses
 * sell their own or consigned objects; marketplaces and auction platforms host other sellers.
 * The set is closed: a new type arrives as an announced contract change.
 */
export const LISTING_SOURCE_TYPES = [
    "DEALER",
    "AUCTION_HOUSE",
    "MARKETPLACE",
    "AUCTION_PLATFORM",
] as const satisfies readonly ListingSourceTypeData[];

export type ListingSourceType = (typeof LISTING_SOURCE_TYPES)[number];
