import { describe, expect, it } from "vitest";
import {
    ADMIN_AUCTION_PAGE_SIZE,
    mapToAdminAuctionSearchQuery,
    toAdminAuctionFilters,
    toAdminAuctionRouteSearch,
    validateAdminAuctionSearch,
} from "../adminAuctionSearch.ts";

describe("validateAdminAuctionSearch", () => {
    it("keeps valid, trimmed filters and drops unknown or blank values", () => {
        expect(
            validateAdminAuctionSearch({
                query: "  autumn ",
                listingSource: " ls_01 ",
                sourceAuctionId: "   ",
                format: "TIMED",
                reportedStatus: "OPEN",
                sort: "name",
                order: "asc",
                size: 50,
                unrelated: "value",
            }),
        ).toEqual({
            query: "autumn",
            listingSource: "ls_01",
            format: "TIMED",
            sort: "name",
            order: "asc",
            size: 50,
        });
    });

    it("only keeps a sort override when both sort and order are valid", () => {
        expect(validateAdminAuctionSearch({ sort: "name" })).toEqual({});
        expect(validateAdminAuctionSearch({ order: "asc" })).toEqual({});
        expect(validateAdminAuctionSearch({ sort: "slug", order: "asc" })).toEqual({});
        expect(validateAdminAuctionSearch({ sort: "created", order: "up" })).toEqual({});
    });

    it.each([0, 101, 2.5, "abc", -1])("drops out-of-range page size %s", (size) => {
        expect(validateAdminAuctionSearch({ size })).toEqual({});
    });

    it("accepts page size bounds and numeric strings", () => {
        expect(validateAdminAuctionSearch({ size: 1 })).toEqual({ size: 1 });
        expect(validateAdminAuctionSearch({ size: "100" })).toEqual({ size: 100 });
    });

    it("round-trips the listing source between URL and filter names", () => {
        const search = validateAdminAuctionSearch({ listingSource: "ls_01", query: "sale" });
        const filters = toAdminAuctionFilters(search);
        expect(filters).toEqual({ listingSourceId: "ls_01", query: "sale" });
        expect(toAdminAuctionRouteSearch(filters)).toEqual(search);
    });
});

describe("mapToAdminAuctionSearchQuery", () => {
    it("sends only the page size for the default directory", () => {
        expect(mapToAdminAuctionSearchQuery({})).toEqual({ size: ADMIN_AUCTION_PAGE_SIZE });
    });

    it("sends only documented parameters for every filter", () => {
        expect(
            mapToAdminAuctionSearchQuery({
                query: " Autumn ",
                listingSourceId: " ls_01 ",
                sourceAuctionId: " Sale 01 ",
                format: "LIVE",
                reportedStatus: "ENDED",
                sort: "created",
                order: "asc",
                size: 100,
            }),
        ).toEqual({
            query: "Autumn",
            listingSourceId: "ls_01",
            sourceAuctionId: "Sale 01",
            format: "LIVE",
            reportedStatus: "ENDED",
            sort: "created",
            order: "asc",
            size: 100,
        });
    });

    it("sends sort and order together or not at all", () => {
        expect(mapToAdminAuctionSearchQuery({ sort: "name" })).toEqual({
            size: ADMIN_AUCTION_PAGE_SIZE,
        });
        expect(mapToAdminAuctionSearchQuery({ order: "asc" })).toEqual({
            size: ADMIN_AUCTION_PAGE_SIZE,
        });
    });

    it("falls back to the default size when the requested size is out of bounds", () => {
        expect(mapToAdminAuctionSearchQuery({ size: 0 }).size).toBe(ADMIN_AUCTION_PAGE_SIZE);
        expect(mapToAdminAuctionSearchQuery({ size: 101 }).size).toBe(ADMIN_AUCTION_PAGE_SIZE);
    });

    it("passes the opaque cursor through verbatim", () => {
        expect(mapToAdminAuctionSearchQuery({}, " eyJh+/= ")).toEqual({
            size: ADMIN_AUCTION_PAGE_SIZE,
            searchAfter: " eyJh+/= ",
        });
    });
});
