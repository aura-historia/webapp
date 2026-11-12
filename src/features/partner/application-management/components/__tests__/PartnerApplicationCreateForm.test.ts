import { describe, expect, it } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import {
    buildApplicationProposal,
    createPartnerApplicationFormSchema,
    PROPOSED_APPLICATION_DEFAULT_VALUES,
} from "../PartnerApplicationCreateForm.ts";
describe("proposal form validation", () => {
    const schema = createPartnerApplicationFormSchema(testI18n.t);
    it("ignores hidden proposed fields for an existing-source proposal", () => {
        expect(
            schema.parse({
                ...PROPOSED_APPLICATION_DEFAULT_VALUES,
                type: "EXISTING_LISTING_SOURCE",
                listingSourceId: "ls_1",
                partyEmail: "invalid",
            }),
        ).toEqual({ type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_1" });
    });
    it("requires selection and both proposed names", () => {
        expect(
            schema.safeParse({ type: "EXISTING_LISTING_SOURCE", listingSourceId: "" }).success,
        ).toBe(false);
        expect(schema.safeParse(PROPOSED_APPLICATION_DEFAULT_VALUES).success).toBe(false);
    });
    it("requires the applicant to classify the proposed source", () => {
        const values = {
            ...PROPOSED_APPLICATION_DEFAULT_VALUES,
            partyName: "Operator",
            sourceName: "Source",
        };
        const result = schema.safeParse(values);
        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.message)).toContain(
            testI18n.t("partnerApplications.proposals.listingSourceTypeRequired"),
        );
        expect(schema.safeParse({ ...values, listingSourceType: "MARKETPLACE" }).success).toBe(
            true,
        );
    });
    it("rejects invalid email, non-HTTP URLs and oversized UTF-8 names", () => {
        const values = {
            ...PROPOSED_APPLICATION_DEFAULT_VALUES,
            partyName: "Operator",
            sourceName: "Source",
        };
        expect(schema.safeParse({ ...values, partyEmail: "invalid" }).success).toBe(false);
        expect(schema.safeParse({ ...values, sourceUrl: "javascript:alert(1)" }).success).toBe(
            false,
        );
        expect(schema.safeParse({ ...values, partyName: "é".repeat(128) }).success).toBe(false);
    });
    it("trims values and omits empty optional fields without inventing metadata", () => {
        const values = schema.parse({
            ...PROPOSED_APPLICATION_DEFAULT_VALUES,
            partyName: " Operator ",
            sourceName: " Source ",
            listingSourceType: "AUCTION_HOUSE",
            partyPhone: " ",
            requestedIngestionMethods: [],
        });
        expect(buildApplicationProposal(values)).toEqual({
            type: "PROPOSED_LISTING_SOURCE",
            party: { name: "Operator" },
            listingSource: {
                name: "Source",
                listingSourceType: "AUCTION_HOUSE",
                requestedIngestionMethods: [],
            },
        });
    });
});
