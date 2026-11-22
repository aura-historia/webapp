import { describe, expect, it } from "vitest";
import type { AdminContentNoticeDetailsData, AdminContentNoticeSummaryData } from "@/client";
import {
    adminContentNoticeTitle,
    mapToAdminContentNotice,
    mapToAdminContentNoticePage,
    mapToAdminContentNoticeSearchQuery,
} from "../AdminContentNotice.ts";

const summary: AdminContentNoticeSummaryData = {
    contentNoticeId: "ntc_1",
    state: "SUBMITTED",
    created: "2026-11-21T16:42:00Z",
    target: { type: "PRODUCT_LISTING", listingSourceId: "ls_1", productListingId: "pl_1" },
    listingSourceName: "Galerie Lenbach",
    productListingTitle: "Biedermeier secretary",
    partner: true,
    submitterRole: "RIGHTS_HOLDER",
    reasonCategory: "RIGHTS_INFRINGEMENT",
    submitterName: "Anna Keller",
    submitterEmail: "anna@example.com",
};

const details: AdminContentNoticeDetailsData = {
    contentNoticeId: "ntc_1",
    state: "SUBMITTED",
    created: "2026-11-21T16:42:00Z",
    updated: "2026-11-21T16:43:00Z",
    version: 1,
    target: { type: "PRODUCT_LISTING", listingSourceId: "ls_1", productListingId: "pl_1" },
    targetSnapshot: {
        listingSourceName: "Galerie Lenbach",
        listingSourceUrl: "https://lenbach.example",
        partner: true,
        productListingTitle: "Biedermeier secretary",
        productListingUrl: "https://lenbach.example/gl-1",
    },
    currentTarget: {
        listingSource: {
            exists: true,
            name: "Galerie Lenbach",
            slugId: "galerie-lenbach",
            ingestionMethods: ["WEB_CRAWL"],
            partner: false,
        },
        productListing: { exists: true, lifecycle: "WITHDRAWN" },
    },
    submitterRole: "RIGHTS_HOLDER",
    reasonCategory: "RIGHTS_INFRINGEMENT",
    explanation: "The photos are mine.",
    additionalUrls: ["https://photos.example/1"],
    submitter: { name: "Anna Keller", email: "anna@example.com", language: "de" },
    goodFaithStatement: "GOOD_FAITH_V1",
    receipt: { status: "DELIVERED", attempts: 1, deliveredAt: "2026-11-21T16:43:00Z" },
};

describe("mapToAdminContentNoticePage", () => {
    it("maps rows and the cursor", () => {
        const page = mapToAdminContentNoticePage({
            items: [summary],
            size: 1,
            searchAfter: "next",
        });
        expect(page.searchAfter).toBe("next");
        expect(page.items[0]).toMatchObject({
            id: "ntc_1",
            state: "SUBMITTED",
            target: { type: "PRODUCT_LISTING", productListingId: "pl_1" },
            role: "RIGHTS_HOLDER",
            reason: "RIGHTS_INFRINGEMENT",
            submitterName: "Anna Keller",
        });
        expect(page.items[0]?.created.toISOString()).toBe("2026-11-21T16:42:00.000Z");
    });

    it("keeps an anonymous notice anonymous and drops blank names", () => {
        const page = mapToAdminContentNoticePage({
            items: [{ ...summary, submitterName: "  ", submitterEmail: undefined }],
            size: 1,
        });
        expect(page.items[0]?.submitterName).toBeUndefined();
        expect(page.items[0]?.submitterEmail).toBeUndefined();
        expect(page.searchAfter).toBeUndefined();
    });

    it("maps a state it does not know to UNKNOWN", () => {
        const page = mapToAdminContentNoticePage({
            items: [{ ...summary, state: "DECIDED" as "SUBMITTED" }],
            size: 1,
        });
        expect(page.items[0]?.state).toBe("UNKNOWN");
    });
});

describe("mapToAdminContentNotice", () => {
    it("keeps the snapshot apart from the current target", () => {
        const notice = mapToAdminContentNotice(details);
        expect(notice.snapshot.partner).toBe(true);
        expect(notice.current.listingSource).toEqual({
            exists: true,
            name: "Galerie Lenbach",
            slugId: "galerie-lenbach",
            ingestionMethods: ["WEB_CRAWL"],
            partner: false,
        });
        expect(notice.current.productListing).toEqual({ exists: true, lifecycle: "WITHDRAWN" });
        expect(notice.receipt?.deliveredAt?.toISOString()).toBe("2026-11-21T16:43:00.000Z");
    });

    it("maps a gone source and listing, and no receipt", () => {
        const notice = mapToAdminContentNotice({
            ...details,
            currentTarget: {
                listingSource: { exists: false },
                productListing: { exists: false },
            },
            submitter: { language: "en" },
            receipt: undefined,
        });
        expect(notice.current.listingSource).toEqual({ exists: false });
        expect(notice.current.productListing).toEqual({ exists: false });
        expect(notice.submitter).toEqual({ name: undefined, email: undefined, language: "en" });
        expect(notice.receipt).toBeUndefined();
    });

    it("has no current listing for a source target", () => {
        const notice = mapToAdminContentNotice({
            ...details,
            target: { type: "LISTING_SOURCE", listingSourceId: "ls_1" },
            currentTarget: { listingSource: details.currentTarget.listingSource },
        });
        expect(notice.current.productListing).toBeUndefined();
        expect(notice.target).toEqual({ type: "LISTING_SOURCE", listingSourceId: "ls_1" });
    });
});

describe("mapToAdminContentNoticeSearchQuery", () => {
    it("sends only the active filters, newest first by default", () => {
        expect(mapToAdminContentNoticeSearchQuery({})).toEqual({ size: 25 });
    });

    it("maps every filter, the day bounds, the oldest-first sort and the cursor", () => {
        expect(
            mapToAdminContentNoticeSearchQuery(
                {
                    targetType: "LISTING_SOURCE",
                    reason: "PROVIDER_OPT_OUT",
                    role: "PROVIDER",
                    sourceId: " ls_1 ",
                    productListingId: "pl_1",
                    receivedFrom: "2026-11-01",
                    receivedTo: "2026-11-07",
                    order: "asc",
                },
                "cursor",
            ),
        ).toEqual({
            size: 25,
            targetType: "LISTING_SOURCE",
            reasonCategory: "PROVIDER_OPT_OUT",
            submitterRole: "PROVIDER",
            listingSourceId: "ls_1",
            productListingId: "pl_1",
            "created[min]": "2026-11-01T00:00:00.000Z",
            "created[max]": "2026-11-07T23:59:59.999Z",
            sort: "created",
            order: "asc",
            searchAfter: "cursor",
        });
    });

    it("ignores invalid days", () => {
        expect(mapToAdminContentNoticeSearchQuery({ receivedFrom: "2026-02-30" })).toEqual({
            size: 25,
        });
    });
});

describe("adminContentNoticeTitle", () => {
    it("names a listing by its title and a source by its name", () => {
        expect(
            adminContentNoticeTitle({
                target: { type: "PRODUCT_LISTING", listingSourceId: "ls_1", productListingId: "p" },
                listingSourceName: "Galerie",
                productListingTitle: "Secretary",
            }),
        ).toBe("Secretary");
        expect(
            adminContentNoticeTitle({
                target: { type: "LISTING_SOURCE", listingSourceId: "ls_1" },
                listingSourceName: "Galerie",
            }),
        ).toBe("Galerie");
        expect(
            adminContentNoticeTitle({
                target: { type: "PRODUCT_LISTING", listingSourceId: "ls_1", productListingId: "p" },
                listingSourceName: "Galerie",
            }),
        ).toBeUndefined();
    });
});
