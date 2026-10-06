import { describe, expect, it } from "vitest";
import {
    getActiveRestrictedFilterLabels,
    stripRestrictedFilters,
} from "../searchFilterRestrictions.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

const emptyArgs: SearchFilterArguments = { q: "" };

const argsWithSource: SearchFilterArguments = {
    q: "",
    listingSourceId: ["source-1"],
};

const argsWithAuctionDate: SearchFilterArguments = {
    q: "",
    auctionDateFrom: new Date("2024-01-01"),
};

const argsAllDefaults: SearchFilterArguments = {
    q: "",
    availability: [...LISTING_AVAILABILITIES],
};

describe("getActiveRestrictedFilterLabels", () => {
    it("returns [] for pro user regardless of filters", () => {
        expect(getActiveRestrictedFilterLabels(argsWithSource, "pro")).toEqual([]);
    });

    it("returns [] for ultimate user regardless of filters", () => {
        expect(getActiveRestrictedFilterLabels(argsWithSource, "ultimate")).toEqual([]);
    });

    it("returns [] for free user with no restricted filters active", () => {
        expect(getActiveRestrictedFilterLabels(emptyArgs, "free")).toEqual([]);
    });

    it("returns [] when all filter arrays are set to their default (= full) values", () => {
        expect(getActiveRestrictedFilterLabels(argsAllDefaults, "free")).toEqual([]);
    });

    it("returns label for listing source when active for free user", () => {
        const labels = getActiveRestrictedFilterLabels(argsWithSource, "free");
        expect(labels).toContain("search.filter.listingSources");
    });

    it("returns label for auctionDate when active for free user", () => {
        const labels = getActiveRestrictedFilterLabels(argsWithAuctionDate, "free");
        expect(labels).toContain("search.filter.auctionDate");
    });

    it("returns multiple labels when multiple restricted filters are active", () => {
        const args: SearchFilterArguments = {
            q: "",
            listingSourceId: ["source-1"],
        };
        const labels = getActiveRestrictedFilterLabels(args, "free");
        expect(labels).toContain("search.filter.listingSources");
    });

    it("treats undefined subscriptionType as free (restricted)", () => {
        const labels = getActiveRestrictedFilterLabels(argsWithSource, undefined);
        expect(labels).toContain("search.filter.listingSources");
    });
});

describe("stripRestrictedFilters", () => {
    it("returns args unchanged for pro user", () => {
        const result = stripRestrictedFilters(argsWithSource, "pro");
        expect(result).toBe(argsWithSource);
    });

    it("returns args unchanged for ultimate user", () => {
        const result = stripRestrictedFilters(argsWithSource, "ultimate");
        expect(result).toBe(argsWithSource);
    });

    it("removes listing sources for free user", () => {
        const result = stripRestrictedFilters(argsWithSource, "free");
        expect(result.listingSourceId).toBeUndefined();
    });

    it("removes auctionDateFrom for free user", () => {
        const result = stripRestrictedFilters(argsWithAuctionDate, "free");
        expect(result.auctionDateFrom).toBeUndefined();
    });

    it("preserves q and non-restricted fields for free user", () => {
        const args: SearchFilterArguments = {
            q: "Barock",
            priceFrom: 100,
            listingSourceId: ["source-1"],
        };
        const result = stripRestrictedFilters(args, "free");
        expect(result.q).toBe("Barock");
        expect(result.priceFrom).toBe(100);
        expect(result.listingSourceId).toBeUndefined();
    });

    it("does not mutate the original args object", () => {
        const args: SearchFilterArguments = { q: "", listingSourceId: ["source-1"] };
        stripRestrictedFilters(args, "free");
        expect(args.listingSourceId).toEqual(["source-1"]);
    });

    it("treats undefined subscriptionType as free and strips restricted fields", () => {
        const result = stripRestrictedFilters(argsWithSource, undefined);
        expect(result.listingSourceId).toBeUndefined();
    });
});
