import type { PartnershipProposalType } from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import type { PartnerApplicationState } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import type { AdminMarkTone } from "@/features/admin/common/components/AdminStatusMark.tsx";

export const ADMIN_APPLICATION_STATE_TRANSLATION_KEY: Record<PartnerApplicationState, string> = {
    SUBMITTED: "adminApplications.state.SUBMITTED",
    IN_REVIEW: "adminApplications.state.IN_REVIEW",
    APPROVED: "adminApplications.state.APPROVED",
    REJECTED: "adminApplications.state.REJECTED",
    WITHDRAWN: "adminApplications.state.WITHDRAWN",
};

/** Short quick-filter labels ("Existing", "Proposed"). */
export const PROPOSAL_OPTION_TRANSLATION_KEY: Record<PartnershipProposalType, string> = {
    EXISTING_LISTING_SOURCE: "adminApplications.proposalOption.EXISTING_LISTING_SOURCE",
    PROPOSED_LISTING_SOURCE: "adminApplications.proposalOption.PROPOSED_LISTING_SOURCE",
};

/** The status marks shared with the partner dashboard. */
export const ADMIN_APPLICATION_STATE_TONE: Record<PartnerApplicationState, AdminMarkTone> = {
    SUBMITTED: "hollow",
    IN_REVIEW: "brass",
    APPROVED: "ink",
    REJECTED: "oxblood",
    WITHDRAWN: "dashed",
};
