import type { ProductState } from "@/data/internal/product/ProductState.ts";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";

/** Minimum number of characters required for a search query */
export const MIN_SEARCH_QUERY_LENGTH = 3;

export type ProductFilterFormValues = {
    priceSpan?: {
        min?: number;
        max?: number;
    };
    productState: ProductState[];
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
};

export const FILTER_DEFAULTS: ProductFilterFormValues = {
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
