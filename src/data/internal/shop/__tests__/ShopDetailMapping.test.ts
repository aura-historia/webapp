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

    it("maps image to undefined when missing", () => {
        const dataWithoutImage = { ...mockShopData, image: undefined };
        const result = mapToShopDetail(dataWithoutImage);
        expect(result.image).toBeUndefined();
    });

    it("maps image to undefined when null", () => {
        const dataWithNullImage = { ...mockShopData, image: null };
        const result = mapToShopDetail(dataWithNullImage);
        expect(result.image).toBeUndefined();
    });

    it("maps domains array", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.domains).toEqual(["christies.com"]);
    });

    it("maps phone when present", () => {
        const result = mapToShopDetail({ ...mockShopData, phone: "+49 30 123456" });
        expect(result.phone).toBe("+49 30 123456");
    });

    it("phone is undefined when not in response", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.phone).toBeUndefined();
    });

    it("maps email when present", () => {
        const result = mapToShopDetail({ ...mockShopData, email: "info@christies.com" });
        expect(result.email).toBe("info@christies.com");
    });

    it("email is undefined when not in response", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.email).toBeUndefined();
    });

    it("maps structuredAddress with all fields", () => {
        const result = mapToShopDetail({
            ...mockShopData,
            structuredAddress: {
                addressline: "8 King St",
                addresslineExtra: "Floor 2",
                locality: "London",
                region: "England",
                postalCode: "SW1Y 6QT",
                country: "GB",
                continent: "EUROPE",
            },
        });
        expect(result.structuredAddress).toEqual({
            addressline: "8 King St",
            addresslineExtra: "Floor 2",
            locality: "London",
            region: "England",
            postalCode: "SW1Y 6QT",
            country: "GB",
            continent: "EUROPE",
        });
    });

    it("structuredAddress is undefined when not in response", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.structuredAddress).toBeUndefined();
    });

    it("maps geoAddress when present", () => {
        const result = mapToShopDetail({
            ...mockShopData,
            geoAddress: { lat: 51.5074, lon: -0.1278 },
        });
        expect(result.geoAddress).toEqual({ lat: 51.5074, lon: -0.1278 });
    });

    it("geoAddress is undefined when not in response", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.geoAddress).toBeUndefined();
    });

    it("maps specialitiesCategories when present", () => {
        const result = mapToShopDetail({
            ...mockShopData,
            specialitiesCategories: ["ancient-egypt", "roman-coins"],
        });
        expect(result.specialitiesCategories).toEqual(["ancient-egypt", "roman-coins"]);
    });

    it("specialitiesCategories is undefined when not in response", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.specialitiesCategories).toBeUndefined();
    });

    it("specialitiesCategories is undefined when response returns empty array", () => {
        const result = mapToShopDetail({ ...mockShopData, specialitiesCategories: [] });
        expect(result.specialitiesCategories).toBeUndefined();
    });

    it("maps specialitiesPeriods when present", () => {
        const result = mapToShopDetail({
            ...mockShopData,
            specialitiesPeriods: ["roman-period", "medieval"],
        });
        expect(result.specialitiesPeriods).toEqual(["roman-period", "medieval"]);
    });

    it("specialitiesPeriods is undefined when not in response", () => {
        const result = mapToShopDetail(mockShopData);
        expect(result.specialitiesPeriods).toBeUndefined();
    });

    it("specialitiesPeriods is undefined when response returns empty array", () => {
        const result = mapToShopDetail({ ...mockShopData, specialitiesPeriods: [] });
        expect(result.specialitiesPeriods).toBeUndefined();
    });
});
