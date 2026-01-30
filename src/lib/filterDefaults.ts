import type { FilterSchema } from "@/components/search/SearchFilters";
import { RESTORATIONS } from "@/data/internal/quality-indicators/Restoration.ts";
import { PROVENANCES } from "@/data/internal/quality-indicators/Provenance.ts";
import { CONDITIONS } from "@/data/internal/quality-indicators/Condition.ts";
import { AUTHENTICITIES } from "@/data/internal/quality-indicators/Authenticity.ts";
import { PRODUCT_STATES } from "@/data/internal/product/ProductState.ts";

/** Minimum number of characters required for a search query */
export const MIN_SEARCH_QUERY_LENGTH = 3;

export const FILTER_DEFAULTS: FilterSchema = {
    priceSpan: { min: undefined, max: undefined },
    productState: [...PRODUCT_STATES],
    creationDate: { from: undefined, to: undefined },
    updateDate: { from: undefined, to: undefined },
    merchant: undefined,
    excludeMerchant: undefined,
    originYearSpan: { min: undefined, max: undefined },
    authenticity: [...AUTHENTICITIES],
    condition: [...CONDITIONS],
    provenance: [...PROVENANCES],
    restoration: [...RESTORATIONS],
};
