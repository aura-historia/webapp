import { describe, expect, it } from "vitest";
import type { GetShopData } from "@/client";
import { mapToShopDetail } from "../ShopDetail.ts";

const mockShopData: GetShopData = {
    shopId: "shop-uuid-123",
    shopSlugId: "christies",
    name: "Christie's",
    shopType: "AUCTION_HOUSE",
    domains: ["christies.com"],
    image: "https://example.com/logo.png",
    partnerStatus: "PARTNERED",
    created: "2024-01-15T08:00:00Z",
    updated: "2024-06-20T12:30:00Z",
};

describe("mapToShopDetail", () => {
    it("maps the shop name directly", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.name).toBe("Christie's");
    });

    it("passes shopId and shopSlugId through unchanged", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.shopId).toBe("shop-uuid-123");
        expect(result.shopSlugId).toBe("christies");
    });

    it("parses the created date string into a Date object", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.created).toBeInstanceOf(Date);
        expect(result.created.toISOString()).toBe("2024-01-15T08:00:00.000Z");
    });

    it("parses the updated date string into a Date object", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.updated).toBeInstanceOf(Date);
        expect(result.updated.toISOString()).toBe("2024-06-20T12:30:00.000Z");
    });

    it("parses the shop type correctly", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.shopType).toBe("AUCTION_HOUSE");
    });

    it("parses PARTNERED partner status correctly", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.partnerStatus).toBe("PARTNERED");
    });

    it("parses SCRAPED partner status correctly", () => {
        const result = mapToShopDetail({ ...mockShopData, partnerStatus: "SCRAPED" });
        expect(result.partnerStatus).toBe("SCRAPED");
    });

    it("maps image when present", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.image).toBe("https://example.com/logo.png");
    });

    it("maps image to null when missing", () => {
        const dataWithoutImage = { ...mockShopData, image: undefined };
        const result = mapToShopDetail(dataWithoutImage);
        expect(result.image).toBeNull();
    });

    it("maps image to null when null", () => {
        const dataWithNullImage = { ...mockShopData, image: null };
        const result = mapToShopDetail(dataWithNullImage);
        expect(result.image).toBeNull();
    });

    it("maps domains array", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.domains).toEqual(["christies.com"]);
    });
});
