import { describe, expect, it } from "vitest";
import {
    isWithinFilterByteLimit,
    mapToAdminProductListingSearchQuery,
    toAdminProductListingFilters,
    toAdminProductListingRouteSearch,
    validateAdminProductListingSearch,
} from "../adminProductListingSearch.ts";

describe("validateAdminProductListingSearch", () => {
    it("keeps valid filters and drops unknown, blank or out-of-range values", () => {
        expect(
            validateAdminProductListingSearch({
                query: "  cabinet ",
                listingSource: "ls_01",
                sourceListingId: " SKU 0042 ",
                lifecycle: "WITHDRAWN",
                availabilityCode: "SOLD_OUT",
                auction: "auc_01",
                sort: "created",
                order: "asc",
                size: "50",
                extra: "ignored",
            }),
        ).toEqual({
            query: "cabinet",
            listingSource: "ls_01",
            sourceListingId: "SKU 0042",
            lifecycle: "WITHDRAWN",
            availabilityCode: "SOLD_OUT",
            auction: "auc_01",
            sort: "created",
            order: "asc",
            size: 50,
        });
        expect(
            validateAdminProductListingSearch({
                query: " ",
                lifecycle: "DELETED",
                availabilityCode: "UNKNOWN",
                sort: "name",
                order: "asc",
                size: 101,
            }),
        ).toEqual({});
    });

    it("drops a sort without an order so the form shows the order the API applies", () => {
        expect(validateAdminProductListingSearch({ sort: "created" })).toEqual({});
        expect(validateAdminProductListingSearch({ order: "asc" })).toEqual({});
    });

    it("round-trips filters through URL keys that do not clash with product search", () => {
        const filters = {
            listingSourceId: "ls_01",
            auctionId: "auc_01",
            availability: "RESERVED" as const,
            lifecycle: "ACTIVE" as const,
        };
        const search = toAdminProductListingRouteSearch(filters);

        expect(search).toEqual({
            listingSource: "ls_01",
            auction: "auc_01",
            availabilityCode: "RESERVED",
            lifecycle: "ACTIVE",
        });
        expect(toAdminProductListingFilters(search)).toEqual(filters);
    });
});

describe("mapToAdminProductListingSearchQuery", () => {
    it("omits unset filters and the default ordering, includes both lifecycles and sends a bounded size", () => {
        expect(mapToAdminProductListingSearchQuery({})).toEqual({ size: 25 });
        expect(mapToAdminProductListingSearchQuery({ size: 0 })).toEqual({ size: 25 });
    });

    it("sends exact identity filters, enums, sort with order and the cursor verbatim", () => {
        expect(
            mapToAdminProductListingSearchQuery(
                {
                    query: " cabinet ",
                    listingSourceId: " ls_01 ",
                    sourceListingId: " SKU 0042 ",
                    lifecycle: "WITHDRAWN",
                    availability: "SOLD_OUT",
                    auctionId: "auc_01",
                    sort: "updated",
                    order: "asc",
                    size: 100,
                },
                "cursor+/=1",
            ),
        ).toEqual({
            query: "cabinet",
            listingSourceId: "ls_01",
            sourceListingId: "SKU 0042",
            lifecycle: "WITHDRAWN",
            availability: "SOLD_OUT",
            auctionId: "auc_01",
            sort: "updated",
            order: "asc",
            size: 100,
            searchAfter: "cursor+/=1",
        });
    });
});

describe("isWithinFilterByteLimit", () => {
    it("measures UTF-8 bytes after trimming", () => {
        expect(isWithinFilterByteLimit(` ${"€".repeat(170)} `)).toBe(true);
        expect(isWithinFilterByteLimit("€".repeat(171))).toBe(false);
    });
});
