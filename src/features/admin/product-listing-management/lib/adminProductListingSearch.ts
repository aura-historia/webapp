import type {
    ListingAvailabilityData,
    ListingLifecycleData,
    SearchAdminProductListingsData,
} from "@/client";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ProductListingDomain.ts";

type AdminProductListingSearchQuery = NonNullable<SearchAdminProductListingsData["query"]>;

export const ADMIN_PRODUCT_LISTING_SORT_FIELDS = [
    "updated",
    "created",
] as const satisfies readonly NonNullable<AdminProductListingSearchQuery["sort"]>[];
export const ADMIN_PRODUCT_LISTING_LIFECYCLES = [
    "ACTIVE",
    "WITHDRAWN",
] as const satisfies readonly ListingLifecycleData[];
export const ADMIN_PRODUCT_LISTING_AVAILABILITIES =
    LISTING_AVAILABILITIES satisfies readonly ListingAvailabilityData[];
export const ADMIN_PRODUCT_LISTING_PAGE_SIZE = 25;
export const ADMIN_PRODUCT_LISTING_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;
/** Backend bound for the text query and the source-local ID filter. */
export const ADMIN_PRODUCT_LISTING_FILTER_MAX_BYTES = 512;

export type AdminProductListingSortField = (typeof ADMIN_PRODUCT_LISTING_SORT_FIELDS)[number];
export type AdminProductListingSortOrder = "asc" | "desc";
export type AdminProductListingLifecycleFilter = (typeof ADMIN_PRODUCT_LISTING_LIFECYCLES)[number];
export type AdminProductListingAvailabilityFilter =
    (typeof ADMIN_PRODUCT_LISTING_AVAILABILITIES)[number];

/** Every field is optional so links to the directory need no search state; absent means default. */
export type AdminProductListingFilters = {
    readonly query?: string;
    readonly listingSourceId?: string;
    readonly sourceListingId?: string;
    /** Absent includes both active and withdrawn listings. */
    readonly lifecycle?: AdminProductListingLifecycleFilter;
    readonly availability?: AdminProductListingAvailabilityFilter;
    readonly auctionId?: string;
    readonly sort?: AdminProductListingSortField;
    readonly order?: AdminProductListingSortOrder;
    readonly size?: number;
};

/** The backend default ordering; it applies whenever sort and order are not both sent. */
export const DEFAULT_ADMIN_PRODUCT_LISTING_SORT = { sort: "updated", order: "desc" } as const;

const validSorts = new Set<string>(ADMIN_PRODUCT_LISTING_SORT_FIELDS);
const validLifecycles = new Set<string>(ADMIN_PRODUCT_LISTING_LIFECYCLES);
const validAvailabilities = new Set<string>(ADMIN_PRODUCT_LISTING_AVAILABILITIES);

export function isWithinFilterByteLimit(value: string): boolean {
    return new TextEncoder().encode(value.trim()).length <= ADMIN_PRODUCT_LISTING_FILTER_MAX_BYTES;
}

function searchString(search: Record<string, unknown>, key: string): string | undefined {
    const value = search[key];
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function searchEnum<T extends string>(
    search: Record<string, unknown>,
    key: string,
    allowed: Set<string>,
): T | undefined {
    const value = searchString(search, key);
    return value && allowed.has(value) ? (value as T) : undefined;
}

export function isAdminProductListingPageSize(value: unknown): value is number {
    return (
        typeof value === "number" &&
        Number.isInteger(value) &&
        value >= MIN_PAGE_SIZE &&
        value <= MAX_PAGE_SIZE
    );
}

function searchPageSize(search: Record<string, unknown>): number | undefined {
    const raw = search.size;
    const value = typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : raw;
    return isAdminProductListingPageSize(value) ? value : undefined;
}

/**
 * URL state for the directory. The listing source, auction and availability use their own keys
 * because product search declares `listingSourceId`, `auctionId` and `availability` as lists, and
 * route search types share one namespace.
 */
export type AdminProductListingRouteSearch = Omit<
    AdminProductListingFilters,
    "listingSourceId" | "auctionId" | "availability"
> & {
    readonly listingSource?: string;
    readonly auction?: string;
    readonly availabilityCode?: AdminProductListingAvailabilityFilter;
};

function withoutUndefined<T extends object>(value: T): T {
    return Object.fromEntries(
        Object.entries(value).filter(([, entry]) => entry !== undefined),
    ) as T;
}

/** Drops unknown, blank or out-of-range values instead of sending them to the API. */
export function validateAdminProductListingSearch(
    search: Record<string, unknown>,
): AdminProductListingRouteSearch {
    const sort = searchEnum<AdminProductListingSortField>(search, "sort", validSorts);
    const rawOrder = searchString(search, "order");
    const order = rawOrder === "asc" || rawOrder === "desc" ? rawOrder : undefined;
    return withoutUndefined<AdminProductListingRouteSearch>({
        query: searchString(search, "query"),
        listingSource: searchString(search, "listingSource"),
        sourceListingId: searchString(search, "sourceListingId"),
        lifecycle: searchEnum<AdminProductListingLifecycleFilter>(
            search,
            "lifecycle",
            validLifecycles,
        ),
        availabilityCode: searchEnum<AdminProductListingAvailabilityFilter>(
            search,
            "availabilityCode",
            validAvailabilities,
        ),
        auction: searchString(search, "auction"),
        // The API only honours a sort override when both values are sent.
        ...(sort && order && { sort, order }),
        size: searchPageSize(search),
    });
}

export function toAdminProductListingFilters({
    listingSource,
    auction,
    availabilityCode,
    ...search
}: AdminProductListingRouteSearch): AdminProductListingFilters {
    return withoutUndefined({
        ...search,
        listingSourceId: listingSource,
        auctionId: auction,
        availability: availabilityCode,
    });
}

export function toAdminProductListingRouteSearch({
    listingSourceId,
    auctionId,
    availability,
    ...filters
}: AdminProductListingFilters): AdminProductListingRouteSearch {
    return withoutUndefined({
        ...filters,
        listingSource: listingSourceId,
        auction: auctionId,
        availabilityCode: availability,
    });
}

/** Maps directory filters to only the declared searchAdminProductListings query parameters. */
export function mapToAdminProductListingSearchQuery(
    filters: AdminProductListingFilters,
    searchAfter?: string,
): AdminProductListingSearchQuery {
    const query = filters.query?.trim();
    const listingSourceId = filters.listingSourceId?.trim();
    const sourceListingId = filters.sourceListingId?.trim();
    const auctionId = filters.auctionId?.trim();
    return {
        ...(query && { query }),
        ...(listingSourceId && { listingSourceId }),
        ...(sourceListingId && { sourceListingId }),
        ...(filters.lifecycle && { lifecycle: filters.lifecycle }),
        ...(filters.availability && { availability: filters.availability }),
        ...(auctionId && { auctionId }),
        ...(filters.sort && filters.order && { sort: filters.sort, order: filters.order }),
        size: isAdminProductListingPageSize(filters.size)
            ? filters.size
            : ADMIN_PRODUCT_LISTING_PAGE_SIZE,
        // The cursor is opaque and only valid for the scope that issued it; pass it unchanged.
        ...(searchAfter !== undefined && { searchAfter }),
    };
}
