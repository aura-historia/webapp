import { describe, expect, it } from "vitest";
import {
    getActiveRestrictedFilterLabels,
    stripRestrictedFilters,
} from "../searchFilterRestrictions.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";

const emptyArgs: SearchFilterArguments = { q: "" };

const argsWithShopType: SearchFilterArguments = {
    q: "",
    shopType: ["AUCTION_HOUSE"], // not all → active
};

const argsWithMerchant: SearchFilterArguments = {
    q: "",
    merchant: ["Händler A"],
};

const argsWithAuctionDate: SearchFilterArguments = {
    q: "",
    auctionDateFrom: new Date("2024-01-01"),
};

const argsAllDefaults: SearchFilterArguments = {
    q: "",
    shopType: [...SHOP_TYPES],
};

describe("getActiveRestrictedFilterLabels", () => {
    it("returns [] for pro user regardless of filters", () => {
        expect(getActiveRestrictedFilterLabels(argsWithShopType, "pro")).toEqual([]);
    });

    it("returns [] for ultimate user regardless of filters", () => {
        expect(getActiveRestrictedFilterLabels(argsWithShopType, "ultimate")).toEqual([]);
    });

    it("returns [] for free user with no restricted filters active", () => {
        expect(getActiveRestrictedFilterLabels(emptyArgs, "free")).toEqual([]);
    });

    it("returns [] when all filter arrays are set to their default (= full) values", () => {
        expect(getActiveRestrictedFilterLabels(argsAllDefaults, "free")).toEqual([]);
    });

    it("returns label for shopType when active for free user", () => {
        const labels = getActiveRestrictedFilterLabels(argsWithShopType, "free");
        expect(labels).toContain("search.filter.shopType");
    });

    it("returns label for merchant when active for free user", () => {
        const labels = getActiveRestrictedFilterLabels(argsWithMerchant, "free");
        expect(labels).toContain("search.filter.merchants");
    });

    it("returns label for auctionDate when active for free user", () => {
        const labels = getActiveRestrictedFilterLabels(argsWithAuctionDate, "free");
        expect(labels).toContain("search.filter.auctionDate");
    });

    it("returns multiple labels when multiple restricted filters are active", () => {
        const args: SearchFilterArguments = {
            q: "",
            shopType: ["AUCTION_HOUSE"],
            merchant: ["Händler A"],
        };
        const labels = getActiveRestrictedFilterLabels(args, "free");
        expect(labels).toContain("search.filter.shopType");
        expect(labels).toContain("search.filter.merchants");
    });

    it("treats undefined subscriptionType as free (restricted)", () => {
        const labels = getActiveRestrictedFilterLabels(argsWithShopType, undefined);
        expect(labels).toContain("search.filter.shopType");
    });
});

describe("stripRestrictedFilters", () => {
    it("returns args unchanged for pro user", () => {
        const result = stripRestrictedFilters(argsWithShopType, "pro");
        expect(result).toBe(argsWithShopType);
    });

    it("returns args unchanged for ultimate user", () => {
        const result = stripRestrictedFilters(argsWithShopType, "ultimate");
        expect(result).toBe(argsWithShopType);
    });

    it("removes shopType for free user", () => {
        const result = stripRestrictedFilters(argsWithShopType, "free");
        expect(result.shopType).toBeUndefined();
    });

    it("removes merchant for free user", () => {
        const result = stripRestrictedFilters(argsWithMerchant, "free");
        expect(result.merchant).toBeUndefined();
    });

    it("removes auctionDateFrom for free user", () => {
        const result = stripRestrictedFilters(argsWithAuctionDate, "free");
        expect(result.auctionDateFrom).toBeUndefined();
    });

    it("preserves q and non-restricted fields for free user", () => {
        const args: SearchFilterArguments = {
            q: "Barock",
            priceFrom: 100,
            shopType: ["AUCTION_HOUSE"],
        };
        const result = stripRestrictedFilters(args, "free");
        expect(result.q).toBe("Barock");
        expect(result.priceFrom).toBe(100);
        expect(result.shopType).toBeUndefined();
    });

    it("does not mutate the original args object", () => {
        const args: SearchFilterArguments = { q: "", shopType: ["AUCTION_HOUSE"] };
        stripRestrictedFilters(args, "free");
        expect(args.shopType).toEqual(["AUCTION_HOUSE"]);
    });

    it("treats undefined subscriptionType as free and strips restricted fields", () => {
        const result = stripRestrictedFilters(argsWithShopType, undefined);
        expect(result.shopType).toBeUndefined();
    });
});
