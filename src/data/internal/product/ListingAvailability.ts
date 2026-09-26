import {
    LISTING_AVAILABILITIES,
    type ListingAvailability,
} from "@/data/internal/product/ProductListingDomain.ts";

export { LISTING_AVAILABILITIES };
export type { ListingAvailability };

export const LISTING_AVAILABILITY_TRANSLATION_KEYS = {
    AVAILABLE: "listingAvailability.available",
    IN_STOCK: "listingAvailability.inStock",
    LIMITED_AVAILABILITY: "listingAvailability.limitedAvailability",
    BACK_ORDER: "listingAvailability.backOrder",
    MADE_TO_ORDER: "listingAvailability.madeToOrder",
    PRE_ORDER: "listingAvailability.preOrder",
    PRE_SALE: "listingAvailability.preSale",
    UNAVAILABLE: "listingAvailability.unavailable",
    RESERVED: "listingAvailability.reserved",
    OUT_OF_STOCK: "listingAvailability.outOfStock",
    SOLD_OUT: "listingAvailability.soldOut",
} as const satisfies Record<(typeof LISTING_AVAILABILITIES)[number], string>;

export function parseListingAvailability(
    value: unknown,
): Exclude<ListingAvailability, "UNKNOWN">[] | undefined {
    if (!Array.isArray(value)) return undefined;
    return value.filter(
        (item, index, values): item is (typeof LISTING_AVAILABILITIES)[number] =>
            LISTING_AVAILABILITIES.includes(item) && values.indexOf(item) === index,
    );
}
