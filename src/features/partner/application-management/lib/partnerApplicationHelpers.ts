import type { PartnerApplicationState } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
export const BUSINESS_STATE_TRANSLATION_KEY: Record<PartnerApplicationState, string> = {
    SUBMITTED: "partnerApplications.businessState.submitted",
    IN_REVIEW: "partnerApplications.businessState.inReview",
    APPROVED: "partnerApplications.businessState.approved",
    REJECTED: "partnerApplications.businessState.rejected",
    WITHDRAWN: "partnerApplications.proposals.withdrawn",
};
export function businessStateVariant(
    state: PartnerApplicationState,
): "outline" | "destructive" | "secondary" {
    if (state === "REJECTED") return "destructive";
    if (state === "IN_REVIEW" || state === "WITHDRAWN") return "secondary";
    return "outline";
}
