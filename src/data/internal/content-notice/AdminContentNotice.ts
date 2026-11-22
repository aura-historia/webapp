import type {
    AdminContentNoticeCollectionData,
    AdminContentNoticeDetailsData,
    AdminContentNoticeReceiptData,
    AdminContentNoticeSummaryData,
    AdminContentNoticeTargetData,
    AdminSearchContentNoticesData,
    ContentNoticeReasonCategoryData,
    ContentNoticeSubmitterRoleData,
    ContentNoticeTargetTypeData,
    LanguageData,
    ListingIngestionMethodData,
    ListingLifecycleData,
} from "@/client";
import { isCalendarDay } from "@/data/internal/partner-application/AdminPartnershipApplication.ts";

export const ADMIN_CONTENT_NOTICE_PAGE_SIZE = 25;

export const CONTENT_NOTICE_TARGET_TYPES = [
    "PRODUCT_LISTING",
    "LISTING_SOURCE",
] as const satisfies readonly ContentNoticeTargetTypeData[];

export const CONTENT_NOTICE_REASONS = [
    "PROVIDER_OPT_OUT",
    "RIGHTS_INFRINGEMENT",
    "ILLEGAL_CONTENT",
    "INCORRECT_INFORMATION",
    "OTHER",
] as const satisfies readonly ContentNoticeReasonCategoryData[];

export const CONTENT_NOTICE_ROLES = [
    "PROVIDER",
    "RIGHTS_HOLDER",
    "ILLEGAL_CONTENT_REPORTER",
    "OTHER",
] as const satisfies readonly ContentNoticeSubmitterRoleData[];

export type ContentNoticeTargetType = (typeof CONTENT_NOTICE_TARGET_TYPES)[number];
export type ContentNoticeReason = (typeof CONTENT_NOTICE_REASONS)[number];
export type ContentNoticeRole = (typeof CONTENT_NOTICE_ROLES)[number];
/** Every notice is `SUBMITTED` today; a state this client does not know yet maps to `UNKNOWN`. */
export type ContentNoticeState = "SUBMITTED" | "UNKNOWN";
export type ContentNoticeReceiptStatus = AdminContentNoticeReceiptData["status"];

export type AdminContentNoticeTarget = {
    readonly type: ContentNoticeTargetType;
    readonly listingSourceId: string;
    /** Present exactly for `PRODUCT_LISTING` targets. */
    readonly productListingId?: string;
};

/** One row of the review queue. Contains personal data (the notifier's name and e-mail). */
export type AdminContentNoticeSummary = {
    readonly id: string;
    readonly state: ContentNoticeState;
    readonly created: Date;
    readonly target: AdminContentNoticeTarget;
    /** The listing source's name at submission. */
    readonly listingSourceName: string;
    /** The listing's title at submission; missing for sources and untitled listings. */
    readonly productListingTitle?: string;
    /** Whether the source's operator was a partner at submission. */
    readonly partner: boolean;
    readonly role: ContentNoticeRole;
    readonly reason: ContentNoticeReason;
    readonly submitterName?: string;
    readonly submitterEmail?: string;
};

export type AdminContentNoticeCurrentSource =
    | { readonly exists: false }
    | {
          readonly exists: true;
          readonly name: string;
          readonly slugId: string;
          readonly ingestionMethods: readonly ListingIngestionMethodData[];
          readonly partner: boolean;
      };

export type AdminContentNoticeCurrentListing =
    | { readonly exists: false }
    | { readonly exists: true; readonly lifecycle?: ListingLifecycleData };

export type AdminContentNoticeReceipt = {
    readonly status: ContentNoticeReceiptStatus;
    readonly attempts: number;
    readonly deliveredAt?: Date;
};

/** One notice for review. Contains personal data. */
export type AdminContentNotice = {
    readonly id: string;
    readonly state: ContentNoticeState;
    readonly created: Date;
    readonly updated: Date;
    readonly target: AdminContentNoticeTarget;
    /** The target as it was at submission; it never changes. */
    readonly snapshot: {
        readonly listingSourceName: string;
        readonly listingSourceUrl?: string;
        readonly partner: boolean;
        readonly productListingTitle?: string;
        readonly productListingUrl?: string;
    };
    /** The target as it is now. */
    readonly current: {
        readonly listingSource: AdminContentNoticeCurrentSource;
        /** Only for `PRODUCT_LISTING` targets. */
        readonly productListing?: AdminContentNoticeCurrentListing;
    };
    readonly role: ContentNoticeRole;
    readonly reason: ContentNoticeReason;
    /** Missing only for `PROVIDER_OPT_OUT`. */
    readonly explanation?: string;
    readonly additionalUrls: readonly string[];
    readonly submitter: {
        readonly name?: string;
        readonly email?: string;
        readonly language: LanguageData;
    };
    /** Missing when no receipt was enqueued, always the case without an e-mail address. */
    readonly receipt?: AdminContentNoticeReceipt;
};

export type AdminContentNoticePage = {
    readonly items: readonly AdminContentNoticeSummary[];
    readonly searchAfter?: string;
};

/** The list filters, as kept in the URL. Each API filter takes one value. */
export type AdminContentNoticeFilters = {
    readonly targetType?: ContentNoticeTargetType;
    readonly reason?: ContentNoticeReason;
    readonly role?: ContentNoticeRole;
    readonly sourceId?: string;
    readonly productListingId?: string;
    /** UTC calendar days, `YYYY-MM-DD`. */
    readonly receivedFrom?: string;
    readonly receivedTo?: string;
    /** Newest first unless `asc`. */
    readonly order?: "asc";
};

export type AdminContentNoticeSearchQuery = NonNullable<AdminSearchContentNoticesData["query"]>;

function optionalText(value: string | undefined): string | undefined {
    const text = value?.trim();
    return text || undefined;
}

function mapState(state: string): ContentNoticeState {
    return state === "SUBMITTED" ? "SUBMITTED" : "UNKNOWN";
}

function mapTarget(target: AdminContentNoticeTargetData): AdminContentNoticeTarget {
    return target.type === "PRODUCT_LISTING" && target.productListingId
        ? {
              type: "PRODUCT_LISTING",
              listingSourceId: target.listingSourceId,
              productListingId: target.productListingId,
          }
        : { type: "LISTING_SOURCE", listingSourceId: target.listingSourceId };
}

export function mapToAdminContentNoticeSummary(
    data: AdminContentNoticeSummaryData,
): AdminContentNoticeSummary {
    return {
        id: data.contentNoticeId,
        state: mapState(data.state),
        created: new Date(data.created),
        target: mapTarget(data.target),
        listingSourceName: data.listingSourceName,
        productListingTitle: optionalText(data.productListingTitle),
        partner: data.partner,
        role: data.submitterRole,
        reason: data.reasonCategory,
        submitterName: optionalText(data.submitterName),
        submitterEmail: optionalText(data.submitterEmail),
    };
}

export function mapToAdminContentNoticePage(
    data: AdminContentNoticeCollectionData,
): AdminContentNoticePage {
    return {
        items: data.items.map(mapToAdminContentNoticeSummary),
        searchAfter: data.searchAfter || undefined,
    };
}

export function mapToAdminContentNotice(data: AdminContentNoticeDetailsData): AdminContentNotice {
    const target = mapTarget(data.target);
    const source = data.currentTarget.listingSource;
    const listing = data.currentTarget.productListing;
    return {
        id: data.contentNoticeId,
        state: mapState(data.state),
        created: new Date(data.created),
        updated: new Date(data.updated),
        target,
        snapshot: {
            listingSourceName: data.targetSnapshot.listingSourceName,
            listingSourceUrl: optionalText(data.targetSnapshot.listingSourceUrl),
            partner: data.targetSnapshot.partner,
            productListingTitle: optionalText(data.targetSnapshot.productListingTitle),
            productListingUrl: optionalText(data.targetSnapshot.productListingUrl),
        },
        current: {
            listingSource:
                source.exists && source.name && source.slugId
                    ? {
                          exists: true,
                          name: source.name,
                          slugId: source.slugId,
                          ingestionMethods: source.ingestionMethods ?? [],
                          partner: source.partner ?? false,
                      }
                    : { exists: false },
            ...(target.type === "PRODUCT_LISTING" && {
                productListing: listing?.exists
                    ? { exists: true, lifecycle: listing.lifecycle }
                    : { exists: false },
            }),
        },
        role: data.submitterRole,
        reason: data.reasonCategory,
        explanation: optionalText(data.explanation),
        additionalUrls: data.additionalUrls,
        submitter: {
            name: optionalText(data.submitter.name),
            email: optionalText(data.submitter.email),
            language: data.submitter.language,
        },
        receipt: data.receipt && {
            status: data.receipt.status,
            attempts: data.receipt.attempts,
            deliveredAt: data.receipt.deliveredAt ? new Date(data.receipt.deliveredAt) : undefined,
        },
    };
}

function dayBound(day: string | undefined, bound: "start" | "end"): string | undefined {
    if (!day || !isCalendarDay(day)) return undefined;
    return bound === "start" ? `${day}T00:00:00.000Z` : `${day}T23:59:59.999Z`;
}

/** Builds the search query; the cursor must be sent with unchanged filters and sort. */
export function mapToAdminContentNoticeSearchQuery(
    filters: AdminContentNoticeFilters,
    searchAfter?: string,
    size = ADMIN_CONTENT_NOTICE_PAGE_SIZE,
): AdminContentNoticeSearchQuery {
    const query: AdminContentNoticeSearchQuery = { size };
    if (filters.targetType) query.targetType = filters.targetType;
    if (filters.reason) query.reasonCategory = filters.reason;
    if (filters.role) query.submitterRole = filters.role;
    const listingSourceId = optionalText(filters.sourceId);
    if (listingSourceId) query.listingSourceId = listingSourceId;
    const productListingId = optionalText(filters.productListingId);
    if (productListingId) query.productListingId = productListingId;
    const createdMin = dayBound(filters.receivedFrom, "start");
    if (createdMin) query["created[min]"] = createdMin;
    const createdMax = dayBound(filters.receivedTo, "end");
    if (createdMax) query["created[max]"] = createdMax;
    // The API's default is newest first; it needs sort and order together.
    if (filters.order === "asc") {
        query.sort = "created";
        query.order = "asc";
    }
    if (searchAfter) query.searchAfter = searchAfter;
    return query;
}

/** The title an admin recognises the notice by: the listing title or the source name at submission. */
export function adminContentNoticeTitle(notice: {
    readonly target: AdminContentNoticeTarget;
    readonly listingSourceName: string;
    readonly productListingTitle?: string;
}): string | undefined {
    return notice.target.type === "LISTING_SOURCE"
        ? notice.listingSourceName
        : notice.productListingTitle;
}
