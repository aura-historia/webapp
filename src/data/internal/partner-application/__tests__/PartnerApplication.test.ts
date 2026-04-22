import { describe, expect, it } from "vitest";
import { mapToPartnerApplication } from "../PartnerApplication.ts";
import type { GetPartnerShopApplicationData } from "@/client";

describe("mapToPartnerApplication", () => {
    it("maps an EXISTING payload application", () => {
        const api: GetPartnerShopApplicationData = {
            id: "app-1",
            businessState: "IN_REVIEW",
            executionState: "WAITING",
            payload: { type: "EXISTING", shopId: "shop-1" },
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-02T00:00:00Z",
        };

        const result = mapToPartnerApplication(api);

        expect(result.id).toBe("app-1");
        expect(result.businessState).toBe("IN_REVIEW");
        expect(result.executionState).toBe("WAITING");
        expect(result.payload).toEqual({ type: "EXISTING", shopId: "shop-1" });
        expect(result.created).toBeInstanceOf(Date);
        expect(result.updated).toBeInstanceOf(Date);
    });

    it("maps a NEW payload application with all fields", () => {
        const api: GetPartnerShopApplicationData = {
            id: "app-2",
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
});
