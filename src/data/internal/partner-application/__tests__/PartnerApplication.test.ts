import { describe, expect, it } from "vitest";
import { mapToPartnerApplication } from "../PartnerApplication.ts";
import type { GetPartnerShopApplicationData } from "@/client";

describe("mapToPartnerApplication", () => {
    it("maps an EXISTING payload application", () => {
        const api: GetPartnerShopApplicationData = {
            id: "app-1",
            applicantUserId: "user-1",
            businessState: "IN_REVIEW",
            executionState: "WAITING",
            payload: { type: "EXISTING", shopId: "shop-1" },
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-02T00:00:00Z",
        };

        const result = mapToPartnerApplication(api);

        expect(result.id).toBe("app-1");
        expect(result.applicantUserId).toBe("user-1");
        expect(result.businessState).toBe("IN_REVIEW");
        expect(result.executionState).toBe("WAITING");
        expect(result.payload).toEqual({ type: "EXISTING", shopId: "shop-1" });
        expect(result.created).toBeInstanceOf(Date);
        expect(result.updated).toBeInstanceOf(Date);
    });

    it("maps a NEW payload application with all fields", () => {
        const api: GetPartnerShopApplicationData = {
            id: "app-2",
            applicantUserId: "user-2",
            businessState: "SUBMITTED",
            executionState: "PROCESSING",
            payload: {
                type: "NEW",
                shopName: "Antiques Co.",
                shopType: "AUCTION_HOUSE",
                shopDomains: ["antiques.example.com"],
                shopImage: "https://example.com/logo.png",
            },
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-02T00:00:00Z",
        };

        const result = mapToPartnerApplication(api);

        expect(result.payload).toEqual({
            type: "NEW",
            shopName: "Antiques Co.",
            shopType: "AUCTION_HOUSE",
            shopDomains: ["antiques.example.com"],
            shopImage: "https://example.com/logo.png",
        });
    });

    it("normalises null shop image to undefined for NEW payloads", () => {
        const api: GetPartnerShopApplicationData = {
            id: "app-3",
            applicantUserId: "user-3",
            businessState: "APPROVED",
            executionState: "COMPLETED",
            payload: {
                type: "NEW",
                shopName: "X",
                shopType: "MARKETPLACE",
                shopDomains: [],
                shopImage: null,
            },
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-02T00:00:00Z",
        };

        const result = mapToPartnerApplication(api);
        if (result.payload.type !== "NEW") throw new Error("expected NEW payload");
        expect(result.payload.shopImage).toBeUndefined();
    });

    it("preserves the required applicant user id from the API response", () => {
        const api: GetPartnerShopApplicationData = {
            id: "app-4",
            applicantUserId: "08ad1750-f5de-44ff-913f-43f6f8980fb9",
            businessState: "SUBMITTED",
            executionState: "WAITING",
            payload: { type: "EXISTING", shopId: "shop-9" },
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-02T00:00:00Z",
        };

        const result = mapToPartnerApplication(api);

        expect(result.applicantUserId).toBe("08ad1750-f5de-44ff-913f-43f6f8980fb9");
    });

    it("maps structuredAddress for NEW payload when present", () => {
        const api: GetPartnerShopApplicationData = {
            id: "app-5",
            applicantUserId: "user-5",
            businessState: "SUBMITTED",
            executionState: "PROCESSING",
            payload: {
                type: "NEW",
                shopName: "Berlin Antiques",
                shopType: "COMMERCIAL_DEALER",
                shopDomains: ["berlin-antiques.de"],
                shopStructuredAddress: {
                    addressline: "Unter den Linden 1",
                    locality: "Berlin",
                    postalCode: "10117",
                    country: "DE",
                    continent: "EUROPE",
                },
            },
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-02T00:00:00Z",
        };

        const result = mapToPartnerApplication(api);
        if (result.payload.type !== "NEW") throw new Error("expected NEW payload");

        expect(result.payload.shopStructuredAddress).toEqual({
            addressline: "Unter den Linden 1",
            locality: "Berlin",
            postalCode: "10117",
            country: "DE",
            continent: "EUROPE",
        });
    });

    it("shopStructuredAddress is undefined when not in NEW payload", () => {
        const api: GetPartnerShopApplicationData = {
            id: "app-6",
            applicantUserId: "user-6",
            businessState: "SUBMITTED",
            executionState: "PROCESSING",
            payload: {
                type: "NEW",
                shopName: "No Address Shop",
                shopType: "MARKETPLACE",
                shopDomains: ["no-address.example.com"],
            },
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-02T00:00:00Z",
        };

        const result = mapToPartnerApplication(api);
        if (result.payload.type !== "NEW") throw new Error("expected NEW payload");
        expect(result.payload.shopStructuredAddress).toBeUndefined();
    });

    it("maps shopPhone and shopEmail for NEW payload", () => {
        const api: GetPartnerShopApplicationData = {
            id: "app-7",
            applicantUserId: "user-7",
            businessState: "SUBMITTED",
            executionState: "PROCESSING",
            payload: {
                type: "NEW",
                shopName: "Contact Shop",
                shopType: "AUCTION_PLATFORM",
                shopDomains: ["contact.example.com"],
                shopPhone: "+49 30 987654",
                shopEmail: "info@contact.example.com",
            },
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-02T00:00:00Z",
        };

        const result = mapToPartnerApplication(api);
        if (result.payload.type !== "NEW") throw new Error("expected NEW payload");
        expect(result.payload.shopPhone).toBe("+49 30 987654");
        expect(result.payload.shopEmail).toBe("info@contact.example.com");
    });

    it("maps shopSpecialitiesCategories and shopSpecialitiesPeriods for NEW payload", () => {
        const api: GetPartnerShopApplicationData = {
            id: "app-8",
            applicantUserId: "user-8",
            businessState: "SUBMITTED",
            executionState: "PROCESSING",
            payload: {
                type: "NEW",
                shopName: "Speciality Shop",
                shopType: "AUCTION_HOUSE",
                shopDomains: ["spec.example.com"],
                shopSpecialitiesCategories: ["ancient-egypt", "roman-coins"],
                shopSpecialitiesPeriods: ["roman-period"],
            },
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-02T00:00:00Z",
        };

        const result = mapToPartnerApplication(api);
        if (result.payload.type !== "NEW") throw new Error("expected NEW payload");
        expect(result.payload.shopSpecialitiesCategories).toEqual(["ancient-egypt", "roman-coins"]);
        expect(result.payload.shopSpecialitiesPeriods).toEqual(["roman-period"]);
    });

    it("shopSpecialitiesCategories is undefined when NEW payload has empty array", () => {
        const api: GetPartnerShopApplicationData = {
            id: "app-9",
            applicantUserId: "user-9",
            businessState: "SUBMITTED",
            executionState: "PROCESSING",
            payload: {
                type: "NEW",
                shopName: "Empty Spec Shop",
                shopType: "MARKETPLACE",
                shopDomains: ["empty.example.com"],
                shopSpecialitiesCategories: [],
                shopSpecialitiesPeriods: [],
            },
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-02T00:00:00Z",
        };

        const result = mapToPartnerApplication(api);
        if (result.payload.type !== "NEW") throw new Error("expected NEW payload");
        expect(result.payload.shopSpecialitiesCategories).toBeUndefined();
        expect(result.payload.shopSpecialitiesPeriods).toBeUndefined();
    });
});
