import type { FilterSchema } from "@/components/search/SearchFilters";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";

/** Minimum number of characters required for a search query */
export const MIN_SEARCH_QUERY_LENGTH = 3;

export const FILTER_DEFAULTS: FilterSchema = {
    priceSpan: { min: undefined, max: undefined },
    productState: ["AVAILABLE", "LISTED", "UNKNOWN"],
    creationDate: { from: undefined, to: undefined },
    updateDate: { from: undefined, to: undefined },
    auctionDate: { from: undefined, to: undefined },
    merchant: undefined,
    excludeMerchant: undefined,
    seller: undefined,
    excludeSeller: undefined,
    shopType: [...SHOP_TYPES],
};
