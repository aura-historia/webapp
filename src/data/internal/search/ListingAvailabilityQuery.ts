import type { SimpleSearchProductListingsData } from "@/client";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ProductListingDomain.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

type ListingSearchQuery = NonNullable<SimpleSearchProductListingsData["query"]>;
type AvailabilityQuery = Pick<
    ListingSearchQuery,
    "availability" | "orderability" | "includeUnspecifiedAvailability"
>;

/**
 * Maps the availability criteria to listing-search parameters. The backend combines them into one
 * predicate; like a saved search, no availability selection (`availability` absent) means no
 * predicate, so orderability and unspecified availability are sent only alongside it.
 */
export function mapToListingAvailabilityQuery(args: SearchFilterArguments): AvailabilityQuery {
    if (args.availability == null) return {};

    const availability = args.availability.filter((value) =>
        LISTING_AVAILABILITIES.includes(value),
    );
    return {
        ...(availability.length ? { availability } : {}),
        ...(args.orderability?.length ? { orderability: args.orderability } : {}),
        ...(args.includeUnspecifiedAvailability != null
            ? { includeUnspecifiedAvailability: args.includeUnspecifiedAvailability }
            : {}),
    };
}

/**
 * True when the availability predicate admits no listing: no availability or orderability value
 * and no unspecified availability. Listing search drops empty arrays, so callers must short-circuit
 * instead of sending a request that would match everything.
 */
export function matchesNoListingAvailability(args: SearchFilterArguments): boolean {
    return (
        args.availability != null &&
        args.availability.length === 0 &&
        !args.orderability?.length &&
        args.includeUnspecifiedAvailability !== true
    );
}
