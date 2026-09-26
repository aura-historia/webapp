import type { SearchSchemaInput } from "@tanstack/react-router";

import { parseListingAvailability } from "@/data/internal/product/ListingAvailability.ts";
import type { ListingAvailability } from "@/data/internal/product/ProductListingDomain.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { SEARCH_RESULT_SORT_FIELDS, type SortMode } from "@/data/internal/search/SortMode.ts";

export type RawSearchParams = {
    q?: string;
    enhancedSearchDescription?: string;
    excludeProductId?: string | string[];
    listingSourceId?: string | string[];
    excludeListingSourceId?: string | string[];
    listingSourceLabels?: string | string[];
    excludeListingSourceLabels?: string | string[];
    priceFrom?: number;
    priceTo?: number;
    availability?: ListingAvailability[];
    creationDateFrom?: string;
    creationDateTo?: string;
    updateDateFrom?: string;
    updateDateTo?: string;
    auctionDateFrom?: string;
    auctionDateTo?: string;
    sortField?: string;
    sortOrder?: string;
} & SearchSchemaInput;

function parseOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === "") return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
}

function parseOptionalDate(value: string | undefined): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseStringArray(value: string | string[] | undefined): string[] | undefined {
    if (value === undefined) return undefined;
    const values = Array.isArray(value) ? value : [value];
    return [...new Set(values.filter((item) => typeof item === "string" && item.length > 0))];
}

function parseSortField(field: string | undefined): SortMode["field"] {
    return SEARCH_RESULT_SORT_FIELDS.includes(field as SortMode["field"])
        ? (field as SortMode["field"])
        : "RELEVANCE";
}

function parseSortOrder(order: string | undefined): SortMode["order"] {
    return order === "ASC" || order === "DESC" ? order : "DESC";
}

export function validateSearchParams(search: RawSearchParams): SearchFilterArguments {
    return {
        q: typeof search.q === "string" ? search.q : "",
        enhancedSearchDescription: search.enhancedSearchDescription,
        excludeProductId: parseStringArray(search.excludeProductId),
        listingSourceId: parseStringArray(search.listingSourceId),
        excludeListingSourceId: parseStringArray(search.excludeListingSourceId),
        listingSourceLabels: parseStringArray(search.listingSourceLabels),
        excludeListingSourceLabels: parseStringArray(search.excludeListingSourceLabels),
        priceFrom: parseOptionalNumber(search.priceFrom),
        priceTo: parseOptionalNumber(search.priceTo),
        availability: parseListingAvailability(search.availability),
        creationDateFrom: parseOptionalDate(search.creationDateFrom),
        creationDateTo: parseOptionalDate(search.creationDateTo),
        updateDateFrom: parseOptionalDate(search.updateDateFrom),
        updateDateTo: parseOptionalDate(search.updateDateTo),
        auctionDateFrom: parseOptionalDate(search.auctionDateFrom),
        auctionDateTo: parseOptionalDate(search.auctionDateTo),
        sortField: parseSortField(search.sortField),
        sortOrder: parseSortOrder(search.sortOrder),
    };
}

function serializeOptionalDate(date: Date | undefined): string | undefined {
    return date?.toISOString();
}

/** Converts validated search arguments back to URL-safe query values. */
export function serializeSearchParams(
    params: SearchFilterArguments,
): Omit<RawSearchParams, keyof SearchSchemaInput> {
    return {
        q: params.q,
        enhancedSearchDescription: params.enhancedSearchDescription,
        excludeProductId: params.excludeProductId,
        listingSourceId: params.listingSourceId,
        excludeListingSourceId: params.excludeListingSourceId,
        listingSourceLabels: params.listingSourceLabels,
        excludeListingSourceLabels: params.excludeListingSourceLabels,
        priceFrom: params.priceFrom,
        priceTo: params.priceTo,
        availability: params.availability,
        creationDateFrom: serializeOptionalDate(params.creationDateFrom),
        creationDateTo: serializeOptionalDate(params.creationDateTo),
        updateDateFrom: serializeOptionalDate(params.updateDateFrom),
        updateDateTo: serializeOptionalDate(params.updateDateTo),
        auctionDateFrom: serializeOptionalDate(params.auctionDateFrom),
        auctionDateTo: serializeOptionalDate(params.auctionDateTo),
        sortField: params.sortField,
        sortOrder: params.sortOrder,
    };
}
