import type { PartnershipProposalType } from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import type { PartnerApplicationState } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";

export const ADMIN_APPLICATION_STATE_TRANSLATION_KEY: Record<PartnerApplicationState, string> = {
    SUBMITTED: "adminApplications.state.SUBMITTED",
    IN_REVIEW: "adminApplications.state.IN_REVIEW",
    APPROVED: "adminApplications.state.APPROVED",
    REJECTED: "adminApplications.state.REJECTED",
    WITHDRAWN: "adminApplications.state.WITHDRAWN",
};

export const PROPOSAL_TYPE_TRANSLATION_KEY: Record<PartnershipProposalType, string> = {
    EXISTING_LISTING_SOURCE: "adminApplications.proposalType.EXISTING_LISTING_SOURCE",
    PROPOSED_LISTING_SOURCE: "adminApplications.proposalType.PROPOSED_LISTING_SOURCE",
};

export function adminApplicationStateVariant(
    state: PartnerApplicationState,
): "default" | "outline" | "destructive" | "secondary" {
    if (state === "APPROVED") return "default";
    if (state === "REJECTED") return "destructive";
    if (state === "IN_REVIEW" || state === "WITHDRAWN") return "secondary";
    return "outline";
}
