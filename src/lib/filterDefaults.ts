import type { FilterSchema } from "@/components/search/SearchFilters";

export const FILTER_DEFAULTS: FilterSchema = {
    priceSpan: { min: undefined, max: undefined },
    itemState: ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"],
    creationDate: { from: undefined, to: undefined },
    updateDate: { from: undefined, to: undefined },
    merchant: undefined,
};
