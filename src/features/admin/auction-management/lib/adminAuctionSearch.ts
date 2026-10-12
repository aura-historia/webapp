import type {
    AdminSearchAuctionsData,
    AuctionFormatData,
    AuctionReportedStatusData,
} from "@/client";

type AdminAuctionSearchQuery = NonNullable<AdminSearchAuctionsData["query"]>;

export const ADMIN_AUCTION_SORT_FIELDS = [
    "updated",
    "created",
    "name",
] as const satisfies readonly NonNullable<AdminAuctionSearchQuery["sort"]>[];
export const ADMIN_AUCTION_FORMATS = [
    "LIVE",
    "TIMED",
] as const satisfies readonly AuctionFormatData[];
export const ADMIN_AUCTION_REPORTED_STATUSES = [
    "SCHEDULED",
    "IN_PROGRESS",
    "ENDED",
    "POSTPONED",
    "CANCELLED",
] as const satisfies readonly AuctionReportedStatusData[];
export const ADMIN_AUCTION_PAGE_SIZE = 25;
export const ADMIN_AUCTION_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

export type AdminAuctionSortField = (typeof ADMIN_AUCTION_SORT_FIELDS)[number];
export type AdminAuctionSortOrder = "asc" | "desc";

/** Every field is optional so links to the directory need no search state; absent means default. */
export type AdminAuctionFilters = {
    readonly query?: string;
    readonly listingSourceId?: string;
    readonly sourceAuctionId?: string;
    readonly format?: AuctionFormatData;
    readonly reportedStatus?: AuctionReportedStatusData;
    readonly sort?: AdminAuctionSortField;
    readonly order?: AdminAuctionSortOrder;
    readonly size?: number;
};

/** The backend default ordering; it applies whenever sort and order are not both sent. */
export const DEFAULT_ADMIN_AUCTION_SORT = { sort: "updated", order: "desc" } as const;

const validSorts = new Set<string>(ADMIN_AUCTION_SORT_FIELDS);
const validFormats = new Set<string>(ADMIN_AUCTION_FORMATS);
const validStatuses = new Set<string>(ADMIN_AUCTION_REPORTED_STATUSES);

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

export function isAdminAuctionPageSize(value: unknown): value is number {
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
    return isAdminAuctionPageSize(value) ? value : undefined;
}

/**
 * URL state for the directory. The listing source uses its own key because product search
 * declares `listingSourceId` as a list, and route search types share one namespace.
 */
export type AdminAuctionRouteSearch = Omit<AdminAuctionFilters, "listingSourceId"> & {
    readonly listingSource?: string;
};

function withoutUndefined<T extends object>(value: T): T {
    return Object.fromEntries(
        Object.entries(value).filter(([, entry]) => entry !== undefined),
    ) as T;
}

/** Drops unknown, blank or out-of-range values instead of sending them to the API. */
export function validateAdminAuctionSearch(
    search: Record<string, unknown>,
): AdminAuctionRouteSearch {
    const sort = searchEnum<AdminAuctionSortField>(search, "sort", validSorts);
    const rawOrder = searchString(search, "order");
    const order = rawOrder === "asc" || rawOrder === "desc" ? rawOrder : undefined;
    return withoutUndefined<AdminAuctionRouteSearch>({
        query: searchString(search, "query"),
        listingSource: searchString(search, "listingSource"),
        sourceAuctionId: searchString(search, "sourceAuctionId"),
        format: searchEnum<AuctionFormatData>(search, "format", validFormats),
        reportedStatus: searchEnum<AuctionReportedStatusData>(
            search,
            "reportedStatus",
            validStatuses,
        ),
        // The API only honours a sort override when both values are sent.
        ...(sort && order && { sort, order }),
        size: searchPageSize(search),
    });
}

export function toAdminAuctionFilters({
    listingSource,
    ...search
}: AdminAuctionRouteSearch): AdminAuctionFilters {
    return withoutUndefined({ ...search, listingSourceId: listingSource });
}

export function toAdminAuctionRouteSearch({
    listingSourceId,
    ...filters
}: AdminAuctionFilters): AdminAuctionRouteSearch {
    return withoutUndefined({ ...filters, listingSource: listingSourceId });
}

/** Maps directory filters to only the declared adminSearchAuctions query parameters. */
export function mapToAdminAuctionSearchQuery(
    filters: AdminAuctionFilters,
    searchAfter?: string,
): AdminAuctionSearchQuery {
    const query = filters.query?.trim();
    const listingSourceId = filters.listingSourceId?.trim();
    const sourceAuctionId = filters.sourceAuctionId?.trim();
    return {
        ...(query && { query }),
        ...(listingSourceId && { listingSourceId }),
        ...(sourceAuctionId && { sourceAuctionId }),
        ...(filters.format && { format: filters.format }),
        ...(filters.reportedStatus && { reportedStatus: filters.reportedStatus }),
        ...(filters.sort && filters.order && { sort: filters.sort, order: filters.order }),
        size: isAdminAuctionPageSize(filters.size) ? filters.size : ADMIN_AUCTION_PAGE_SIZE,
        // The cursor is opaque and only valid for the scope that issued it; pass it unchanged.
        ...(searchAfter !== undefined && { searchAfter }),
    };
}
