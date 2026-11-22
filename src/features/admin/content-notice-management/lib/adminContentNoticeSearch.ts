import {
    type AdminContentNoticeFilters,
    CONTENT_NOTICE_REASONS,
    CONTENT_NOTICE_ROLES,
    CONTENT_NOTICE_TARGET_TYPES,
} from "@/data/internal/content-notice/AdminContentNotice.ts";
import { isCalendarDay } from "@/data/internal/partner-application/AdminPartnershipApplication.ts";

const MAX_ID_LENGTH = 128;

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

/** The route's search: the list filters plus the notice whose dialog is open. */
export type AdminContentNoticeRouteSearch = AdminContentNoticeFilters & {
    readonly notice?: string;
};

/** Route search validation: keeps known values only, so the URL never carries free text. */
export function validateAdminContentNoticeSearch(
    search: Record<string, unknown>,
): AdminContentNoticeRouteSearch {
    const entries: AdminContentNoticeRouteSearch = {
        targetType: pickOne(search.targetType, CONTENT_NOTICE_TARGET_TYPES),
        reason: pickOne(search.reason, CONTENT_NOTICE_REASONS),
        role: pickOne(search.role, CONTENT_NOTICE_ROLES),
        sourceId: pickId(search.sourceId),
        productListingId: pickId(search.productListingId),
        receivedFrom: pickDay(search.receivedFrom),
        receivedTo: pickDay(search.receivedTo),
        order: search.order === "asc" ? "asc" : undefined,
        notice: pickId(search.notice),
    };
    return Object.fromEntries(
        Object.entries(entries).filter(([, value]) => value !== undefined),
    ) as AdminContentNoticeRouteSearch;
}

/** The list filters alone: opening a notice must not change the list query. */
export function adminContentNoticeFiltersOf({
    notice: _notice,
    ...filters
}: AdminContentNoticeRouteSearch): AdminContentNoticeFilters {
    return filters;
}
