import type { PartnerApplicationState } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";

export const BUSINESS_STATE_TRANSLATION_KEY: Record<PartnerApplicationState, string> = {
    SUBMITTED: "partnerApplications.businessState.submitted",
    IN_REVIEW: "partnerApplications.businessState.inReview",
    APPROVED: "partnerApplications.businessState.approved",
    REJECTED: "partnerApplications.businessState.notApproved",
    WITHDRAWN: "partnerApplications.proposals.withdrawn",
};

/** One line on what happens next, shown under the status (board "Application row"). */
export const BUSINESS_STATE_NOTE_KEY: Record<PartnerApplicationState, string> = {
    SUBMITTED: "partnerApplications.stateNote.submitted",
    IN_REVIEW: "partnerApplications.stateNote.inReview",
    APPROVED: "partnerApplications.stateNote.approved",
    REJECTED: "partnerApplications.stateNote.rejected",
    WITHDRAWN: "partnerApplications.stateNote.withdrawn",
};

/** Label colour and mark per state; the mark always sits beside the label. */
export const BUSINESS_STATE_STYLE: Record<
    PartnerApplicationState,
    { readonly label: string; readonly mark: string }
> = {
    SUBMITTED: {
        label: "text-ink-secondary",
        mark: "shadow-[inset_0_0_0_1.5px_var(--ink-muted)]",
    },
    IN_REVIEW: { label: "text-brass-ink", mark: "shadow-[inset_0_0_0_2px_var(--brass)]" },
    APPROVED: { label: "text-ink", mark: "bg-ink" },
    REJECTED: { label: "text-oxblood", mark: "bg-oxblood" },
    WITHDRAWN: {
        label: "text-ink-muted",
        mark: "outline-[1.5px] -outline-offset-[1.5px] outline-dashed outline-ink-muted",
    },
};
