import type {
    OwnPartnershipApplicationData,
    PublicListingSourceData,
    SubmitPartnershipApplicationData,
} from "@/client";

export const PARTNER_APPLICATION_STATES = [
    "SUBMITTED",
    "IN_REVIEW",
    "APPROVED",
    "REJECTED",
    "WITHDRAWN",
] as const;
export type PartnerApplicationState = (typeof PARTNER_APPLICATION_STATES)[number];
export const INGESTION_METHODS = ["WEB_CRAWL", "SHOPIFY", "WOOCOMMERCE", "PARTNER_API"] as const;
export type IngestionMethod = (typeof INGESTION_METHODS)[number];
export type PartnershipProposal =
    | { readonly type: "EXISTING_LISTING_SOURCE"; readonly listingSourceId: string }
    | {
          readonly type: "PROPOSED_LISTING_SOURCE";
          readonly party: {
              readonly name: string;
              readonly phone?: string;
              readonly email?: string;
          };
          readonly listingSource: {
              readonly name: string;
              readonly url?: string;
              readonly image?: string;
              readonly requestedIngestionMethods: readonly IngestionMethod[];
          };
      };
export type PartnerApplication = {
    readonly id: string;
    readonly state: PartnerApplicationState;
    readonly proposal: PartnershipProposal;
};
export type ApplicationListingSource = {
    readonly listingSourceId: string;
    readonly name: string;
    readonly operatorName: string;
};

function copyProposal(proposal: PartnershipProposal): PartnershipProposal {
    if (proposal.type === "EXISTING_LISTING_SOURCE")
        return { type: proposal.type, listingSourceId: proposal.listingSourceId };
    return {
        type: proposal.type,
        party: {
            name: proposal.party.name,
            ...(proposal.party.phone ? { phone: proposal.party.phone } : {}),
            ...(proposal.party.email ? { email: proposal.party.email } : {}),
        },
        listingSource: {
            name: proposal.listingSource.name,
            ...(proposal.listingSource.url ? { url: proposal.listingSource.url } : {}),
            ...(proposal.listingSource.image ? { image: proposal.listingSource.image } : {}),
            requestedIngestionMethods: [...proposal.listingSource.requestedIngestionMethods],
        },
    };
}
export function mapToPartnerApplication(data: OwnPartnershipApplicationData): PartnerApplication {
    return { id: data.id, state: data.state, proposal: copyProposal(data.proposal) };
}
export function mapToApplicationListingSource(
    data: PublicListingSourceData,
): ApplicationListingSource {
    return {
        listingSourceId: data.listingSourceId,
        name: data.name,
        operatorName: data.operator.name,
    };
}
export function mapToSubmitApplication(
    proposal: PartnershipProposal,
): SubmitPartnershipApplicationData {
    const mapped = copyProposal(proposal);
    if (mapped.type === "EXISTING_LISTING_SOURCE") return { proposal: mapped };
    return {
        proposal: {
            ...mapped,
            listingSource: {
                ...mapped.listingSource,
                requestedIngestionMethods: [...mapped.listingSource.requestedIngestionMethods],
            },
        },
    };
}
export function applicationName(application: PartnerApplication): string {
    return application.proposal.type === "EXISTING_LISTING_SOURCE"
        ? application.proposal.listingSourceId
        : application.proposal.listingSource.name;
}
export function canWithdrawApplication(application: PartnerApplication): boolean {
    return application.state === "SUBMITTED" || application.state === "IN_REVIEW";
}
