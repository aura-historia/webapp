import type { AdminPartnershipFilters } from "@/data/internal/partnership/AdminPartnership.ts";

const MAX_ID_LENGTH = 128;

/** The route's search: exact ID filters plus the partnership whose dialog is open. */
export type AdminPartnershipRouteSearch = AdminPartnershipFilters & {
    readonly partnership?: string;
};

function pickId(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const id = value.trim();
    return id && id.length <= MAX_ID_LENGTH ? id : undefined;
}

/** Route search validation: keeps trimmed IDs of at most 128 characters, drops anything else. */
export function validateAdminPartnershipSearch(
    search: Record<string, unknown>,
): AdminPartnershipRouteSearch {
    const entries: AdminPartnershipRouteSearch = {
        partyId: pickId(search.partyId),
        memberUserId: pickId(search.memberUserId),
        listingSourceId: pickId(search.listingSourceId),
        partnership: pickId(search.partnership),
    };
    return Object.fromEntries(
        Object.entries(entries).filter(([, value]) => value !== undefined),
    ) as AdminPartnershipRouteSearch;
}

/** The list filters alone: the open dialog must not change the list query. */
export function adminPartnershipFiltersOf({
    partnership: _partnership,
    ...filters
}: AdminPartnershipRouteSearch): AdminPartnershipFilters {
    return filters;
}

/**
 * The URL shape: the listing-source filter is `listingSource`, because product search declares
 * `listingSourceId` as a list and route search types share one namespace.
 */
export type AdminPartnershipUrlSearch = Omit<AdminPartnershipRouteSearch, "listingSourceId"> & {
    readonly listingSource?: string;
};

export function toAdminPartnershipUrlSearch({
    listingSourceId,
    ...rest
}: AdminPartnershipRouteSearch): AdminPartnershipUrlSearch {
    return listingSourceId ? { ...rest, listingSource: listingSourceId } : rest;
}

export function fromAdminPartnershipUrlSearch({
    listingSource,
    ...rest
}: AdminPartnershipUrlSearch): AdminPartnershipRouteSearch {
    return listingSource ? { ...rest, listingSourceId: listingSource } : rest;
}

export function validateAdminPartnershipUrlSearch(
    search: Record<string, unknown>,
): AdminPartnershipUrlSearch {
    return toAdminPartnershipUrlSearch(
        validateAdminPartnershipSearch({ ...search, listingSourceId: search.listingSource }),
    );
}
