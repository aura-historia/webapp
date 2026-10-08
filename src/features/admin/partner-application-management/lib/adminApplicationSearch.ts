import {
    ADMIN_APPLICATION_SORT_FIELDS,
    ADMIN_APPLICATION_SORT_ORDERS,
    type AdminApplicationFilters,
    isCalendarDay,
    PARTNERSHIP_PROPOSAL_TYPES,
} from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import { PARTNER_APPLICATION_STATES } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";

const MAX_ID_LENGTH = 128;

function pickList<T extends string>(value: unknown, allowed: readonly T[]): T[] | undefined {
    const values = Array.isArray(value) ? value : [value];
    const picked = allowed.filter((option) => values.includes(option));
    return picked.length ? picked : undefined;
}

function pickOne<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
    return allowed.find((option) => option === value);
}

function pickId(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const id = value.trim();
    return id && id.length <= MAX_ID_LENGTH ? id : undefined;
}

function pickDay(value: unknown): string | undefined {
    return typeof value === "string" && isCalendarDay(value) ? value : undefined;
}

/** Route search validation: returns URL-safe strings and arrays only, dropping unknown values. */
export function validateAdminApplicationSearch(
    search: Record<string, unknown>,
): AdminApplicationFilters {
    const sort = pickOne(search.sort, ADMIN_APPLICATION_SORT_FIELDS);
    const order = pickOne(search.order, ADMIN_APPLICATION_SORT_ORDERS);
    // The API ignores an incomplete pair, so keep sort and order only together.
    const sortPair = sort && order ? { sort, order } : {};
    const entries: AdminApplicationFilters = {
        states: pickList(search.states, PARTNER_APPLICATION_STATES),
        proposalTypes: pickList(search.proposalTypes, PARTNERSHIP_PROPOSAL_TYPES),
        applicantUserId: pickId(search.applicantUserId),
        sourceId: pickId(search.sourceId),
        createdFrom: pickDay(search.createdFrom),
        createdTo: pickDay(search.createdTo),
        updatedFrom: pickDay(search.updatedFrom),
        updatedTo: pickDay(search.updatedTo),
        ...sortPair,
    };
    return Object.fromEntries(
        Object.entries(entries).filter(([, value]) => value !== undefined),
    ) as AdminApplicationFilters;
}
