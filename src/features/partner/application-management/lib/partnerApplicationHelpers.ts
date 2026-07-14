import type { PartnerApplicationBusinessState } from "@/data/internal/partner-application/PartnerApplication.ts";
import type { StructuredAddress } from "@/data/internal/shop/ShopDetail.ts";

export const BUSINESS_STATE_TRANSLATION_KEY: Record<PartnerApplicationBusinessState, string> = {
    SUBMITTED: "partnerApplications.businessState.submitted",
    IN_REVIEW: "partnerApplications.businessState.inReview",
    APPROVED: "partnerApplications.businessState.approved",
    REJECTED: "partnerApplications.businessState.rejected",
};

export function businessStateVariant(
    state: PartnerApplicationBusinessState,
): "default" | "secondary" | "destructive" | "outline" {
    switch (state) {
        case "APPROVED":
            return "outline";
        case "REJECTED":
            return "destructive";
        case "IN_REVIEW":
            return "secondary";
        case "SUBMITTED":
            return "outline";
        default:
            return "outline";
    }
}

export function getProgressValue(state: PartnerApplicationBusinessState): number {
    switch (state) {
        case "SUBMITTED":
            return 12;
        case "IN_REVIEW":
            return 50;
        case "APPROVED":
        case "REJECTED":
            return 100;
        default:
            return 0;
    }
}

export function getAddressSummary(address?: StructuredAddress): string | undefined {
    if (!address) {
        return undefined;
    }

    return [
        address.addressline,
        address.addresslineExtra,
        address.postalCode,
        address.locality,
        address.region,
        address.country,
    ]
        .filter(Boolean)
        .join(", ");
}
