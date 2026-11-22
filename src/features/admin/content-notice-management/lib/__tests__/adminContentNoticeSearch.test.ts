import { describe, expect, it } from "vitest";
import {
    adminContentNoticeFiltersOf,
    validateAdminContentNoticeSearch,
} from "../adminContentNoticeSearch.ts";

describe("validateAdminContentNoticeSearch", () => {
    it("keeps known values and the open notice", () => {
        expect(
            validateAdminContentNoticeSearch({
                targetType: "LISTING_SOURCE",
                reason: "PROVIDER_OPT_OUT",
                role: "PROVIDER",
                sourceId: " ls_1 ",
                productListingId: "pl_1",
                receivedFrom: "2026-11-01",
                receivedTo: "2026-11-07",
                order: "asc",
                notice: "ntc_1",
            }),
        ).toEqual({
            targetType: "LISTING_SOURCE",
            reason: "PROVIDER_OPT_OUT",
            role: "PROVIDER",
            sourceId: "ls_1",
            productListingId: "pl_1",
            receivedFrom: "2026-11-01",
            receivedTo: "2026-11-07",
            order: "asc",
            notice: "ntc_1",
        });
    });

    it("drops unknown values, invalid days, overlong IDs and the default sort", () => {
        expect(
            validateAdminContentNoticeSearch({
                targetType: "AUCTION",
                reason: "SPAM",
                role: ["PROVIDER"],
                sourceId: "x".repeat(129),
                receivedFrom: "2026-02-30",
                order: "desc",
                email: "someone@example.com",
            }),
        ).toEqual({});
    });
});

describe("adminContentNoticeFiltersOf", () => {
    it("leaves the open notice out of the list filters", () => {
        expect(adminContentNoticeFiltersOf({ reason: "OTHER", notice: "ntc_1" })).toEqual({
            reason: "OTHER",
        });
    });
});
