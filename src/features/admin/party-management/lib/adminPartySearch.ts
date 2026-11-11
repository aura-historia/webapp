import {
    ADMIN_PARTY_SORT_FIELDS,
    ADMIN_PARTY_SORT_ORDERS,
    type AdminPartyFilters,
    isPartyCalendarDay,
} from "@/data/internal/party/Party.ts";

const MAX_TEXT_LENGTH = 256;

function pickText(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const text = value.trim();
    return text && text.length <= MAX_TEXT_LENGTH ? text : undefined;
}

function pickDay(value: unknown): string | undefined {
    return typeof value === "string" && isPartyCalendarDay(value) ? value : undefined;
}

function pickOne<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
    return allowed.find((option) => option === value);
}

/**
 * Route search validation for the organization directory: trimmed text filters, real calendar
 * days, and sort with order only together. Unknown values are dropped; the cursor is never here.
 */
export function validateAdminPartySearch(search: Record<string, unknown>): AdminPartyFilters {
    const sort = pickOne(search.sort, ADMIN_PARTY_SORT_FIELDS);
    const order = pickOne(search.order, ADMIN_PARTY_SORT_ORDERS);
    const entries: AdminPartyFilters = {
        query: pickText(search.query),
        name: pickText(search.name),
        phone: pickText(search.phone),
        email: pickText(search.email),
        createdFrom: pickDay(search.createdFrom),
        createdTo: pickDay(search.createdTo),
        updatedFrom: pickDay(search.updatedFrom),
        updatedTo: pickDay(search.updatedTo),
        ...(sort && order ? { sort, order } : {}),
    };
    return Object.fromEntries(
        Object.entries(entries).filter(([, value]) => value !== undefined),
    ) as AdminPartyFilters;
}
