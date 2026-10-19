import { describe, expect, it } from "vitest";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";
import {
    getActiveFilters,
    removeActiveFilter,
} from "@/features/search/products/lib/activeFilters.ts";

describe("getActiveFilters", () => {
    it("returns nothing for a plain query", () => {
        expect(getActiveFilters({ q: "commode" })).toEqual([]);
    });

    it("ignores an availability selection that covers every state", () => {
        expect(
            getActiveFilters({ q: "commode", availability: [...LISTING_AVAILABILITIES] }),
        ).toEqual([]);
    });

    it("lists filters in panel order with one chip per provider", () => {
        const filters = getActiveFilters({
            q: "commode",
            availability: ["AVAILABLE", "RESERVED"],
            listingSourceId: ["ls_1"],
            listingSourceLabels: ["Antik & Stil"],
            excludeListingSourceId: ["ls_2", "ls_3"],
            excludeListingSourceLabels: ["Kunsthandel Meyer"],
            priceTo: 6000,
            auctionDateFrom: new Date(2026, 10, 14),
        });

        expect(filters.map((filter) => filter.id)).toEqual([
            "availability",
            "includeSource:ls_1",
            "excludeSource:ls_2",
            "excludeSource:ls_3",
            "price",
            "auctionDate",
        ]);
        expect(filters[0]).toMatchObject({ kind: "availability", selected: 2 });
        expect(filters[3]).toMatchObject({ label: "ls_3" });
        expect(filters[4]).toMatchObject({ kind: "price", min: undefined, max: 6000 });
    });
});

describe("removeActiveFilter", () => {
    const args = {
        q: "commode",
        priceFrom: 800,
        priceTo: 6000,
        listingSourceId: ["ls_1", "ls_2"],
        listingSourceLabels: ["One", "Two"],
        creationDateFrom: new Date(2026, 0, 1),
        creationDateTo: new Date(2026, 5, 1),
        sortField: "CREATION_DATE" as const,
    };

    it("drops one provider and its paired label, keeping the rest", () => {
        const [, second] = getActiveFilters(args).filter((f) => f.kind === "includeSource");
        expect(removeActiveFilter(args, second)).toMatchObject({
            listingSourceId: ["ls_1"],
            listingSourceLabels: ["One"],
            priceFrom: 800,
            sortField: "CREATION_DATE",
        });
    });

    it("clears the last provider entirely", () => {
        const single = { q: "x", listingSourceId: ["ls_1"], listingSourceLabels: ["One"] };
        const [filter] = getActiveFilters(single);
        expect(removeActiveFilter(single, filter)).toMatchObject({
            listingSourceId: undefined,
            listingSourceLabels: undefined,
        });
    });

    it("clears both ends of a price or date range", () => {
        const filters = getActiveFilters(args);
        const price = filters.find((f) => f.kind === "price");
        const date = filters.find((f) => f.kind === "date");
        if (!price || !date) throw new Error("expected price and date filters");

        expect(removeActiveFilter(args, price)).toMatchObject({
            priceFrom: undefined,
            priceTo: undefined,
        });
        expect(removeActiveFilter(args, date)).toMatchObject({
            creationDateFrom: undefined,
            creationDateTo: undefined,
        });
    });
});
