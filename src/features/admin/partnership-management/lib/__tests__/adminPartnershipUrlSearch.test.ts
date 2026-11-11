import { describe, expect, it } from "vitest";
import {
    fromAdminListingSourceUrlSearch,
    toAdminListingSourceUrlSearch,
    validateAdminListingSourceUrlSearch,
} from "@/features/admin/listing-source-management/lib/adminListingSourceSearch.ts";
import {
    fromAdminPartnershipUrlSearch,
    toAdminPartnershipUrlSearch,
    validateAdminPartnershipUrlSearch,
} from "@/features/admin/partnership-management/lib/adminPartnershipSearch.ts";

// Product search declares `listingSourceId` as a list; admin routes keep the single ID under
// `listingSource` in the URL so route search types stay compatible.
describe("admin listing-source URL param", () => {
    it("maps the partnership filter between `listingSource` in the URL and `listingSourceId`", () => {
        const url = validateAdminPartnershipUrlSearch({
            listingSource: " ls_1 ",
            partyId: "pty_1",
        });
        expect(url).toEqual({ listingSource: "ls_1", partyId: "pty_1" });
        expect(fromAdminPartnershipUrlSearch(url)).toEqual({
            listingSourceId: "ls_1",
            partyId: "pty_1",
        });
        expect(toAdminPartnershipUrlSearch({ listingSourceId: "ls_2" })).toEqual({
            listingSource: "ls_2",
        });
        expect(validateAdminPartnershipUrlSearch({ listingSourceId: "ls_1" })).toEqual({});
    });

    it("maps the listing-source ID filter the same way and keeps the open dialog", () => {
        const url = validateAdminListingSourceUrlSearch({ listingSource: "ls_1", source: "ls_9" });
        expect(url).toMatchObject({ listingSource: "ls_1", source: "ls_9" });
        expect(url).not.toHaveProperty("listingSourceId");
        expect(fromAdminListingSourceUrlSearch(url)).toMatchObject({ listingSourceId: "ls_1" });
        expect(
            toAdminListingSourceUrlSearch({ sort: "name", order: "asc", listingSourceId: "ls_3" }),
        ).toEqual({
            sort: "name",
            order: "asc",
            listingSource: "ls_3",
        });
    });
});
