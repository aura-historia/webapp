import type {
    ContentNoticeReason,
    ContentNoticeReceiptStatus,
    ContentNoticeRole,
    ContentNoticeState,
    ContentNoticeTargetType,
} from "@/data/internal/content-notice/AdminContentNotice.ts";
import type { AdminMarkTone } from "@/features/admin/common/components/AdminStatusMark.tsx";

/** Admin short forms; the public form keeps its own, longer wording. */
export const CONTENT_NOTICE_REASON_KEY: Record<ContentNoticeReason, string> = {
    PROVIDER_OPT_OUT: "adminContentNotices.reasons.providerOptOut",
    RIGHTS_INFRINGEMENT: "adminContentNotices.reasons.rightsInfringement",
    ILLEGAL_CONTENT: "adminContentNotices.reasons.illegalContent",
    INCORRECT_INFORMATION: "adminContentNotices.reasons.incorrectInformation",
    OTHER: "adminContentNotices.reasons.other",
};

export const CONTENT_NOTICE_ROLE_KEY: Record<ContentNoticeRole, string> = {
    PROVIDER: "adminContentNotices.roles.provider",
    RIGHTS_HOLDER: "adminContentNotices.roles.rightsHolder",
    ILLEGAL_CONTENT_REPORTER: "adminContentNotices.roles.illegalContentReporter",
    OTHER: "adminContentNotices.roles.other",
};

export const CONTENT_NOTICE_TARGET_KEY: Record<ContentNoticeTargetType, string> = {
    PRODUCT_LISTING: "adminContentNotices.targets.listing",
    LISTING_SOURCE: "adminContentNotices.targets.source",
};

export const CONTENT_NOTICE_STATE: Record<
    ContentNoticeState,
    { readonly key: string; readonly tone: AdminMarkTone }
> = {
    SUBMITTED: { key: "adminContentNotices.states.submitted", tone: "hollow" },
    UNKNOWN: { key: "adminContentNotices.states.unknown", tone: "dashed" },
};

export const CONTENT_NOTICE_RECEIPT: Record<
    ContentNoticeReceiptStatus,
    { readonly key: string; readonly noteKey: string; readonly tone: AdminMarkTone }
> = {
    DELIVERED: {
        key: "adminContentNotices.receipt.delivered",
        noteKey: "adminContentNotices.receipt.deliveredNote",
        tone: "ink",
    },
    PENDING: {
        key: "adminContentNotices.receipt.pending",
        noteKey: "adminContentNotices.receipt.pendingNote",
        tone: "hollow",
    },
    PROCESSING: {
        key: "adminContentNotices.receipt.processing",
        noteKey: "adminContentNotices.receipt.processingNote",
        tone: "brass",
    },
    FAILED: {
        key: "adminContentNotices.receipt.failed",
        noteKey: "adminContentNotices.receipt.failedNote",
        tone: "oxblood",
    },
};
