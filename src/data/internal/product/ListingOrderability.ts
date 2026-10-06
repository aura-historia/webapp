import type { ListingOrderabilityData } from "@/client";

export const LISTING_ORDERABILITIES = [
    "ORDERABLE_NOW",
    "ORDERABLE_CONDITIONALLY",
    "NOT_ORDERABLE",
] as const;

export type ListingOrderability = (typeof LISTING_ORDERABILITIES)[number];

export function parseListingOrderability(
    value: ListingOrderabilityData[] | null | undefined,
): ListingOrderability[] | null | undefined {
    if (value == null) return value;
    return value.filter(
        (item, index, values): item is ListingOrderability =>
            LISTING_ORDERABILITIES.includes(item) && values.indexOf(item) === index,
    );
}
