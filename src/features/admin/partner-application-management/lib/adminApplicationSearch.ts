import {
    ADMIN_APPLICATION_SORT_FIELDS,
    ADMIN_APPLICATION_SORT_ORDERS,
    type AdminApplicationFilters,
    PARTNERSHIP_PROPOSAL_TYPES,
} from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import { PARTNER_APPLICATION_STATES } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
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
    return typeof value === "string" && DAY_PATTERN.test(value) ? value : undefined;
}

/** Route search validation: returns URL-safe strings and arrays only, dropping unknown values. */
export function validateAdminApplicationSearch(
    search: Record<string, unknown>,
): AdminApplicationFilters {
    const entries: AdminApplicationFilters = {
        states: pickList(search.states, PARTNER_APPLICATION_STATES),
        proposalTypes: pickList(search.proposalTypes, PARTNERSHIP_PROPOSAL_TYPES),
        applicantUserId: pickId(search.applicantUserId),
        sourceId: pickId(search.sourceId),
        createdFrom: pickDay(search.createdFrom),
        createdTo: pickDay(search.createdTo),
        updatedFrom: pickDay(search.updatedFrom),
        updatedTo: pickDay(search.updatedTo),
        sort: pickOne(search.sort, ADMIN_APPLICATION_SORT_FIELDS),
        order: pickOne(search.order, ADMIN_APPLICATION_SORT_ORDERS),
    };
    return Object.fromEntries(
        Object.entries(entries).filter(([, value]) => value !== undefined),
    ) as AdminApplicationFilters;
}
