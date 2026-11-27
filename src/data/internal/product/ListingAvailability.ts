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

/**
 * The availabilities a search can still return. Search no longer contains listings that are out of
 * stock, unavailable or sold out, so filtering for them would be redundant and misleading: they
 * are not offered in any search or saved-search interface. They remain valid listing data, shown
 * on a listing's own status and edited by admins.
 */
export const SEARCHABLE_LISTING_AVAILABILITIES = [
    "AVAILABLE",
    "IN_STOCK",
    "LIMITED_AVAILABILITY",
    "BACK_ORDER",
    "MADE_TO_ORDER",
    "PRE_ORDER",
    "PRE_SALE",
    "RESERVED",
] as const satisfies readonly (typeof LISTING_AVAILABILITIES)[number][];

export type SearchableListingAvailability = (typeof SEARCHABLE_LISTING_AVAILABILITIES)[number];

/**
 * Reads availability criteria from a URL or a saved search, dropping duplicates and values that
 * search does not offer, including the removed out-of-stock, unavailable and sold-out states. An
 * old link or saved search that selected only removed states therefore keeps an empty selection
 * rather than silently widening to every state.
 */
export function parseListingAvailability(
    value: unknown,
): SearchableListingAvailability[] | undefined {
    if (!Array.isArray(value)) return undefined;
    return value.filter(
        (item, index, values): item is SearchableListingAvailability =>
            (SEARCHABLE_LISTING_AVAILABILITIES as readonly unknown[]).includes(item) &&
            values.indexOf(item) === index,
    );
}
