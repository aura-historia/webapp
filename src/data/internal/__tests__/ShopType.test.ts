import { describe, expect, it } from "vitest";
import { mapToBackendShopType, parseShopType } from "../ShopType";

describe("parseShopType", () => {
    it("should return AUCTION_HOUSE for 'AUCTION_HOUSE'", () => {
        expect(parseShopType("AUCTION_HOUSE")).toBe("AUCTION_HOUSE");
    });

    it("should return COMMERCIAL_DEALER for 'COMMERCIAL_DEALER'", () => {
        expect(parseShopType("COMMERCIAL_DEALER")).toBe("COMMERCIAL_DEALER");
    });

    it("should return MARKETPLACE for 'MARKETPLACE'", () => {
        expect(parseShopType("MARKETPLACE")).toBe("MARKETPLACE");
    });

    it("should handle lowercase input and return AUCTION_HOUSE", () => {
        expect(parseShopType("auction_house")).toBe("AUCTION_HOUSE");
    });

    it("should handle lowercase input and return COMMERCIAL_DEALER", () => {
        expect(parseShopType("commercial_dealer")).toBe("COMMERCIAL_DEALER");
    });

    it("should handle lowercase input and return MARKETPLACE", () => {
        expect(parseShopType("marketplace")).toBe("MARKETPLACE");
    });

    it("should handle mixed case input", () => {
        expect(parseShopType("Auction_House")).toBe("AUCTION_HOUSE");
    });

    it("should return UNKNOWN for an invalid shop type", () => {
        expect(parseShopType("INVALID")).toBe("UNKNOWN");
    });

    it("should return UNKNOWN for an empty string", () => {
        expect(parseShopType("")).toBe("UNKNOWN");
    });

    it("should return UNKNOWN for undefined", () => {
        expect(parseShopType(undefined)).toBe("UNKNOWN");
    });

    it("should return UNKNOWN for null", () => {
        expect(parseShopType(null as unknown as string)).toBe("UNKNOWN");
    });
});

describe("mapToBackendShopType", () => {
    it("should return AUCTION_HOUSE for AUCTION_HOUSE", () => {
        expect(mapToBackendShopType("AUCTION_HOUSE")).toBe("AUCTION_HOUSE");
    });

    it("should return COMMERCIAL_DEALER for COMMERCIAL_DEALER", () => {
        expect(mapToBackendShopType("COMMERCIAL_DEALER")).toBe("COMMERCIAL_DEALER");
    });

    it("should return MARKETPLACE for MARKETPLACE", () => {
        expect(mapToBackendShopType("MARKETPLACE")).toBe("MARKETPLACE");
    });

    it("should return undefined for UNKNOWN", () => {
        expect(mapToBackendShopType("UNKNOWN")).toBeUndefined();
    });

    it("should return undefined for undefined input", () => {
        expect(mapToBackendShopType(undefined)).toBeUndefined();
    });
});
