import type { ListingIngestionMethodData } from "@/client";
import {
    ADMIN_LISTING_SOURCE_INGESTION_METHODS,
    ADMIN_LISTING_SOURCE_SORT_FIELDS,
    type AdminListingSourceFilters,
    type AdminListingSourceSortField,
    isOptionalPlatformTechnology,
    normalizePlatformTechnology,
} from "@/data/internal/listing-source/AdminListingSource.ts";
import {
    LISTING_SOURCE_TYPES,
    type ListingSourceType,
} from "@/data/internal/listing-source/ListingSourceType.ts";

/** The directory's URL state: its filters plus the listing source whose dialog is open. */
export type AdminListingSourceRouteSearch = AdminListingSourceFilters & {
    /** Listing source ID of the open detail dialog (other admin sections link here with it). */
    readonly source?: string;
};

export const DEFAULT_ADMIN_LISTING_SOURCE_FILTERS = {
    sort: "name",
    order: "asc",
} as const satisfies AdminListingSourceFilters;

const SORTS = new Set<string>(ADMIN_LISTING_SOURCE_SORT_FIELDS);
const TYPES = new Set<string>(LISTING_SOURCE_TYPES);
const METHODS = new Set<string>(ADMIN_LISTING_SOURCE_INGESTION_METHODS);

function searchString(search: Record<string, unknown>, key: string): string | undefined {
    const value = search[key];
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

/** Reads the URL search; unknown or malformed values fall back to "no filter". */
export function validateAdminListingSourceSearch(
    search: Record<string, unknown>,
): AdminListingSourceRouteSearch {
    const sort = searchString(search, "sort");
    const type = searchString(search, "listingSourceType");
    const method = searchString(search, "ingestionMethod");
    const platform = searchString(search, "platformTechnology");
    return {
        query: searchString(search, "query"),
        name: searchString(search, "name"),
        listingSourceId: searchString(search, "listingSourceId"),
        listingSourceSlugId: searchString(search, "listingSourceSlugId"),
        operatorPartyId: searchString(search, "operatorPartyId"),
        listingSourceType: type && TYPES.has(type) ? (type as ListingSourceType) : undefined,
        ingestionMethod:
            method && METHODS.has(method) ? (method as ListingIngestionMethodData) : undefined,
        platformTechnology:
            platform && isOptionalPlatformTechnology(platform)
                ? normalizePlatformTechnology(platform)
                : undefined,
        sort: sort && SORTS.has(sort) ? (sort as AdminListingSourceSortField) : "name",
        order: searchString(search, "order") === "desc" ? "desc" : "asc",
        source: searchString(search, "source"),
    };
}

/** The filters alone: the open dialog never changes the list query. */
export function withoutAdminListingSourceSelection(
    search: AdminListingSourceRouteSearch,
): AdminListingSourceFilters {
    const { source: _source, ...filters } = search;
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined),
    ) as AdminListingSourceFilters;
}

/** Filters other than the sort, which never hides a source. */
export const ADMIN_LISTING_SOURCE_FILTER_KEYS = [
    "query",
    "listingSourceType",
    "ingestionMethod",
    "name",
    "listingSourceId",
    "listingSourceSlugId",
    "operatorPartyId",
    "platformTechnology",
] as const satisfies readonly (keyof AdminListingSourceFilters)[];

export function hasAdminListingSourceFilters(filters: AdminListingSourceFilters): boolean {
    return ADMIN_LISTING_SOURCE_FILTER_KEYS.some((key) => filters[key] !== undefined);
}

/**
 * The URL shape: the ID filter is `listingSource`, because product search declares
 * `listingSourceId` as a list and route search types share one namespace.
 */
export type AdminListingSourceUrlSearch = Omit<AdminListingSourceRouteSearch, "listingSourceId"> & {
    readonly listingSource?: string;
};

export function toAdminListingSourceUrlSearch({
    listingSourceId,
    ...rest
}: AdminListingSourceRouteSearch): AdminListingSourceUrlSearch {
    return listingSourceId ? { ...rest, listingSource: listingSourceId } : rest;
}

export function fromAdminListingSourceUrlSearch({
    listingSource,
    ...rest
}: AdminListingSourceUrlSearch): AdminListingSourceRouteSearch {
    return listingSource ? { ...rest, listingSourceId: listingSource } : rest;
}

export function validateAdminListingSourceUrlSearch(
    search: Record<string, unknown>,
): AdminListingSourceUrlSearch {
    return toAdminListingSourceUrlSearch(
        validateAdminListingSourceSearch({ ...search, listingSourceId: search.listingSource }),
    );
}
