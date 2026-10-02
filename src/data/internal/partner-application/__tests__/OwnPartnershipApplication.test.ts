import { describe, expect, it } from "vitest";
import {
    canWithdrawApplication,
    mapToPartnerApplication,
    mapToSubmitApplication,
    type PartnershipProposal,
} from "../OwnPartnershipApplication.ts";
describe("own partnership application boundary", () => {
    it("allowlists the minimal own DTO even if admin fields are present", () => {
        const response = {
            id: "pa_1",
            state: "WITHDRAWN" as const,
            proposal: { type: "EXISTING_LISTING_SOURCE" as const, listingSourceId: "ls_1" },
            applicantUserId: "private",
            approvedListingSourceId: "ls_other",
            created: "2026-01-01",
        };
        expect(mapToPartnerApplication(response)).toEqual({
            id: "pa_1",
            state: "WITHDRAWN",
            proposal: { type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_1" },
        });
    });
    it("copies nested proposal data and ignores extra contact fields", () => {
        const party = { name: "Operator", email: "contact@example.com", address: "private" };
        const listingSource = {
            name: "Source",
            requestedIngestionMethods: ["PARTNER_API" as const],
            image: "https://example.com/image.png",
        };
        const result = mapToPartnerApplication({
            id: "pa_1",
            state: "SUBMITTED",
            proposal: { type: "PROPOSED_LISTING_SOURCE", party, listingSource },
        });
        expect(result.proposal).toEqual({
            type: "PROPOSED_LISTING_SOURCE",
            party: { name: "Operator", email: "contact@example.com" },
            listingSource,
        });
        listingSource.requestedIngestionMethods.push("PARTNER_API");
        expect(
            result.proposal.type === "PROPOSED_LISTING_SOURCE" &&
                result.proposal.listingSource.requestedIngestionMethods,
        ).toEqual(["PARTNER_API"]);
    });
    it.each(["APPROVED", "REJECTED", "WITHDRAWN"] as const)(
        "does not offer withdrawal for %s",
        (state) => {
            expect(
                canWithdrawApplication({
                    id: "pa_1",
                    state,
                    proposal: { type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_1" },
                }),
            ).toBe(false);
        },
    );
    it("wraps an exact existing-source submission", () => {
        const proposal: PartnershipProposal = {
            type: "EXISTING_LISTING_SOURCE",
            listingSourceId: "ls_canonical",
        };
        expect(mapToSubmitApplication(proposal)).toEqual({ proposal });
    });
});
