import type {
    AdminPartnershipApplicationCollectionData,
    AdminPartnershipApplicationData,
    AdminPartnershipApplicationSummaryData,
    AdminSearchPartnershipApplicationsData,
    DecidePartnershipApplicationData,
} from "@/client";
import {
    copyProposal,
    type PartnerApplicationState,
    type PartnershipProposal,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";

export const PARTNERSHIP_PROPOSAL_TYPES = [
    "EXISTING_LISTING_SOURCE",
    "PROPOSED_LISTING_SOURCE",
] as const;
export type PartnershipProposalType = (typeof PARTNERSHIP_PROPOSAL_TYPES)[number];
export const ADMIN_APPLICATION_SORT_FIELDS = ["created", "updated"] as const;
export type AdminApplicationSortField = (typeof ADMIN_APPLICATION_SORT_FIELDS)[number];
export const ADMIN_APPLICATION_SORT_ORDERS = ["desc", "asc"] as const;
export type AdminApplicationSortOrder = (typeof ADMIN_APPLICATION_SORT_ORDERS)[number];
export type AdminApplicationDecision = DecidePartnershipApplicationData["decision"];

/** Fields shared by admin detail and summary responses. Detail carries no timestamps. */
export type AdminPartnershipApplication = {
    readonly id: string;
    readonly applicantUserId: string;
    readonly state: PartnerApplicationState;
    readonly proposal: PartnershipProposal;
    readonly approvedPartnershipId?: string;
    readonly approvedListingSourceId?: string;
};

/** Review-queue entry; only the search summary guarantees created/updated timestamps. */
export type AdminPartnershipApplicationSummary = AdminPartnershipApplication & {
    readonly created: Date;
    readonly updated: Date;
};

export type AdminPartnershipApplicationPage = {
    readonly items: readonly AdminPartnershipApplicationSummary[];
    /** JSON-encoded `[timestamp, id]` cursor; absent on the terminal page. */
    readonly searchAfter?: string;
    readonly total?: number;
};

/** Date bounds are `YYYY-MM-DD` calendar days, interpreted in UTC and inclusive. */
export type AdminApplicationFilters = {
    readonly states?: readonly PartnerApplicationState[];
    readonly proposalTypes?: readonly PartnershipProposalType[];
    readonly applicantUserId?: string;
    readonly sourceId?: string;
    readonly createdFrom?: string;
    readonly createdTo?: string;
    readonly updatedFrom?: string;
    readonly updatedTo?: string;
    readonly sort?: AdminApplicationSortField;
    readonly order?: AdminApplicationSortOrder;
};

export type AdminApplicationSearchQuery = NonNullable<
    AdminSearchPartnershipApplicationsData["query"]
>;

export const ADMIN_APPLICATION_PAGE_SIZE = 21;

export function mapToAdminPartnershipApplication(
    data: AdminPartnershipApplicationData,
): AdminPartnershipApplication {
    return {
        id: data.id,
        applicantUserId: data.applicantUserId,
        state: data.state,
        proposal: copyProposal(data.proposal),
        ...(data.approvedPartnershipId
            ? { approvedPartnershipId: data.approvedPartnershipId }
            : {}),
        ...(data.approvedListingSourceId
            ? { approvedListingSourceId: data.approvedListingSourceId }
            : {}),
    };
}

export function mapToAdminPartnershipApplicationSummary(
    data: AdminPartnershipApplicationSummaryData,
): AdminPartnershipApplicationSummary {
    return {
        ...mapToAdminPartnershipApplication(data),
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}

export function mapToAdminPartnershipApplicationPage(
    data: AdminPartnershipApplicationCollectionData,
): AdminPartnershipApplicationPage {
    return {
        items: data.items.map(mapToAdminPartnershipApplicationSummary),
        ...(data.searchAfter ? { searchAfter: encodeApplicationCursor(data.searchAfter) } : {}),
        ...(typeof data.total === "number" ? { total: data.total } : {}),
    };
}

export function encodeApplicationCursor(cursor: readonly [string, string]): string {
    return JSON.stringify([cursor[0], cursor[1]]);
}

/** True only for a real `YYYY-MM-DD` calendar day, rejecting values such as `2026-02-30`. */
export function isCalendarDay(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function dayBound(day: string | undefined, bound: "start" | "end"): string | undefined {
    if (!day || !isCalendarDay(day)) return undefined;
    return bound === "start" ? `${day}T00:00:00.000Z` : `${day}T23:59:59.999Z`;
}

function trimmed(value: string | undefined): string | undefined {
    const result = value?.trim();
    return result || undefined;
}

/** Builds the admin search query; the cursor must be sent with unchanged filters and sort. */
export function mapToAdminApplicationSearchQuery(
    filters: AdminApplicationFilters,
    searchAfter?: string,
    size = ADMIN_APPLICATION_PAGE_SIZE,
): AdminApplicationSearchQuery {
    const query: AdminApplicationSearchQuery = { size };
    if (filters.states?.length) query.state = [...filters.states];
    if (filters.proposalTypes?.length) query.proposalType = [...filters.proposalTypes];
    const applicantUserId = trimmed(filters.applicantUserId);
    if (applicantUserId) query.applicantUserId = applicantUserId;
    const listingSourceId = trimmed(filters.sourceId);
    if (listingSourceId) query.listingSourceId = listingSourceId;
    const createdMin = dayBound(filters.createdFrom, "start");
    if (createdMin) query["created[min]"] = createdMin;
    const createdMax = dayBound(filters.createdTo, "end");
    if (createdMax) query["created[max]"] = createdMax;
    const updatedMin = dayBound(filters.updatedFrom, "start");
    if (updatedMin) query["updated[min]"] = updatedMin;
    const updatedMax = dayBound(filters.updatedTo, "end");
    if (updatedMax) query["updated[max]"] = updatedMax;
    // The API only honours a custom sort when both field and direction are present.
    if (filters.sort && filters.order) {
        query.sort = filters.sort;
        query.order = filters.order;
    }
    if (searchAfter) query.searchAfter = searchAfter;
    return query;
}

export function canMarkApplicationInReview(application: {
    readonly state: PartnerApplicationState;
}) {
    return application.state === "SUBMITTED";
}

export function canDecideApplication(application: { readonly state: PartnerApplicationState }) {
    return application.state === "IN_REVIEW";
}

export function adminApplicationName(application: AdminPartnershipApplication): string {
    return application.proposal.type === "EXISTING_LISTING_SOURCE"
        ? application.proposal.listingSourceId
        : application.proposal.listingSource.name;
}
