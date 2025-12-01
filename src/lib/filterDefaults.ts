import type { FilterSchema } from "@/components/search/SearchFilters";

/** Minimum number of characters required for a search query */
export const MIN_SEARCH_QUERY_LENGTH = 3;

export const FILTER_DEFAULTS: FilterSchema = {
    priceSpan: { min: undefined, max: undefined },
    itemState: ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"],
    creationDate: { from: undefined, to: undefined },
    updateDate: { from: undefined, to: undefined },
    merchant: undefined,
};
