import type { SearchSchemaInput } from "@tanstack/react-router";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { type ProductState, parseProductState } from "@/data/internal/product/ProductState.ts";
import { SEARCH_RESULT_SORT_FIELDS, type SortMode } from "@/data/internal/search/SortMode.ts";
import { type ShopType, parseShopType } from "@/data/internal/shop/ShopType.ts";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";

export type RawSearchParams = {
    q: string;
    priceFrom?: number;
    priceTo?: number;
    allowedStates?: ProductState[];
    creationDateFrom?: string;
    creationDateTo?: string;
    updateDateFrom?: string;
    updateDateTo?: string;
    auctionDateFrom?: string;
    auctionDateTo?: string;
    merchant?: string | string[];
    excludeMerchant?: string | string[];
    seller?: string | string[];
    excludeSeller?: string | string[];
    shopType?: ShopType[];
    sortField?: string;
    sortOrder?: string;
} & SearchSchemaInput;

function parseOptionalNumber(value: unknown): number | undefined {
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
}

function parseOptionalDate(value: string | undefined): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseProductStates(states: unknown): ProductState[] | undefined {
    if (!Array.isArray(states)) return undefined;
    return states
        .map((state) => parseProductState(state))
        .filter((elem, index, self) => index === self.indexOf(elem));
}

function parseMerchant(merchant: string | string[] | undefined): string[] | undefined {
    if (Array.isArray(merchant)) return merchant;
    if (typeof merchant === "string") return [merchant];
    return undefined;
}

function parseExcludeMerchant(
    excludeMerchant: string | string[] | undefined,
): string[] | undefined {
    if (Array.isArray(excludeMerchant)) return excludeMerchant;
    if (typeof excludeMerchant === "string") return [excludeMerchant];
    return undefined;
}

function parseSeller(seller: string | string[] | undefined): string[] | undefined {
    if (Array.isArray(seller)) return seller;
    if (typeof seller === "string") return [seller];
    return undefined;
}

function parseExcludeSeller(excludeSeller: string | string[] | undefined): string[] | undefined {
    if (Array.isArray(excludeSeller)) return excludeSeller;
    if (typeof excludeSeller === "string") return [excludeSeller];
    return undefined;
}

function parseSortField(field: string | undefined): SortMode["field"] {
    return SEARCH_RESULT_SORT_FIELDS.includes(field as SortMode["field"])
        ? (field as SortMode["field"])
        : "RELEVANCE";
}

function parseSortOrder(order: string | undefined): SortMode["order"] {
    return order === "ASC" || order === "DESC" ? order : "DESC";
}

function parseShopTypes(values: unknown): ShopType[] | undefined {
    if (!Array.isArray(values)) return undefined;
    return values
        .map((shopType) => parseShopType(shopType))
        .filter((elem, index, self) => index === self.indexOf(elem));
}

export function validateSearchParams(search: RawSearchParams): SearchFilterArguments {
    return {
        q: (search.q as string) || "",
        priceFrom: parseOptionalNumber(search.priceFrom),
        priceTo: parseOptionalNumber(search.priceTo),
        allowedStates: parseProductStates(search.allowedStates) ?? FILTER_DEFAULTS.productState,
        creationDateFrom: parseOptionalDate(search.creationDateFrom),
        creationDateTo: parseOptionalDate(search.creationDateTo),
        updateDateFrom: parseOptionalDate(search.updateDateFrom),
        updateDateTo: parseOptionalDate(search.updateDateTo),
        auctionDateFrom: parseOptionalDate(search.auctionDateFrom),
        auctionDateTo: parseOptionalDate(search.auctionDateTo),
        merchant: parseMerchant(search.merchant),
        excludeMerchant: parseExcludeMerchant(search.excludeMerchant),
        seller: parseSeller(search.seller),
        excludeSeller: parseExcludeSeller(search.excludeSeller),
        shopType: parseShopTypes(search.shopType),
        sortField: parseSortField(search.sortField),
        sortOrder: parseSortOrder(search.sortOrder),
    };
}

function serializeOptionalDate(date: Date | undefined): string | undefined {
    return date?.toISOString();
}

/**
 * Converts validated SearchFilterArguments back to RawSearchParams format.
 * This is useful when updating search params in functional updates.
 */
export function serializeSearchParams(
    params: SearchFilterArguments,
): Omit<RawSearchParams, keyof SearchSchemaInput> {
    return {
        q: params.q,
        priceFrom: params.priceFrom,
        priceTo: params.priceTo,
        allowedStates: params.allowedStates,
        creationDateFrom: serializeOptionalDate(params.creationDateFrom),
        creationDateTo: serializeOptionalDate(params.creationDateTo),
        updateDateFrom: serializeOptionalDate(params.updateDateFrom),
        updateDateTo: serializeOptionalDate(params.updateDateTo),
        auctionDateFrom: serializeOptionalDate(params.auctionDateFrom),
        auctionDateTo: serializeOptionalDate(params.auctionDateTo),
        merchant: params.merchant,
        excludeMerchant: params.excludeMerchant,
        seller: params.seller,
        excludeSeller: params.excludeSeller,
        shopType: params.shopType,
        sortField: params.sortField,
        sortOrder: params.sortOrder,
    };
}
