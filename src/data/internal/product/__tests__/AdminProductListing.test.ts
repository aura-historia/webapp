import { describe, expect, it } from "vitest";
import type { AdminProductListingDetails } from "@/client";
import {
    mapAdminProductListingDetail,
    mapAdminProductListingMutation,
    mapAdminProductListingPage,
    mapToBackendAdminProductListingPatch,
} from "../AdminProductListing.ts";

const adminProductListingDetailsDto: AdminProductListingDetails = {
    productListingId: "pl_01",
    productListingTitleSlugId: "walnut-cabinet-pl01",
    source: { listingSourceId: "ls_01", name: "Galerie Nord", slugId: "galerie-nord" },
    sourceListingId: "SKU 0042",
    title: { text: "Walnut cabinet", language: "en" },
    price: { type: "MONETARY", amount: 125_050, currency: "EUR" },
    priceEstimateMin: { amount: 100_000, currency: "EUR" },
    priceEstimateMax: null,
    availability: "IN_STOCK",
    lifecycle: "ACTIVE",
    auctionId: "auc_01",
    expectedVersion: 7,
    created: "2026-09-01T10:00:00Z",
    updated: "2026-10-01T12:30:00Z",
    description: { text: "Two doors.\nOriginal key.", language: "en" },
    url: "https://galerie.example/items/42",
    images: ["https://galerie.example/b.jpg", "https://galerie.example/a.jpg"],
    auction: {
        auctionId: "auc_01",
        lotNumber: "12A",
        cataloguePosition: 3,
        timing: {
            biddingOpens: "2026-10-10T08:00:00Z",
            scheduledCloses: null,
            reportedClosedAt: null,
        },
    },
    saleObservation: null,
};

describe("mapAdminProductListingDetail", () => {
    it("keeps original source facts, source-currency amounts and image order", () => {
        const listing = mapAdminProductListingDetail({
            ...adminProductListingDetailsDto,
            saleObservation: { observedAt: "2026-10-05T09:00:00Z", fxRateId: "fx_01" },
        });

        expect(listing).toMatchObject({
            productListingId: "pl_01",
            source: { listingSourceId: "ls_01", name: "Galerie Nord", slugId: "galerie-nord" },
            sourceListingId: "SKU 0042",
            title: { text: "Walnut cabinet", language: "en" },
            price: { type: "MONETARY", amount: 125_050, currency: "EUR" },
            priceEstimateMin: { amount: 100_000, currency: "EUR" },
            priceEstimateMax: null,
            availability: "IN_STOCK",
            lifecycle: "ACTIVE",
            expectedVersion: 7,
            images: ["https://galerie.example/b.jpg", "https://galerie.example/a.jpg"],
            auction: {
                auctionId: "auc_01",
                lotNumber: "12A",
                cataloguePosition: 3,
                biddingOpens: new Date("2026-10-10T08:00:00Z"),
                scheduledCloses: null,
                reportedClosedAt: null,
            },
            saleObservation: { observedAt: new Date("2026-10-05T09:00:00Z"), fxRateId: "fx_01" },
        });
        expect(listing.created).toEqual(new Date("2026-09-01T10:00:00Z"));
    });

    it("keeps absent text, auction facts and unknown enum values without inventing data", () => {
        const listing = mapAdminProductListingDetail({
            ...adminProductListingDetailsDto,
            title: null,
            description: null,
            price: { type: "ON_REQUEST" },
            availability: "SOMETHING_NEW" as never,
            lifecycle: "ARCHIVED" as never,
            auctionId: null,
            auction: null,
        });

        expect(listing).toMatchObject({
            title: null,
            description: null,
            price: { type: "ON_REQUEST" },
            availability: "UNKNOWN",
            lifecycle: "UNKNOWN",
            auctionId: null,
            auction: null,
        });
    });
});

describe("mapAdminProductListingPage", () => {
    it("keeps only items and the opaque cursor, never a total", () => {
        const page = mapAdminProductListingPage({
            items: [adminProductListingDetailsDto],
            size: 1,
            searchAfter: "opaque+/=",
        });

        expect(page.items.map((item) => item.productListingId)).toEqual(["pl_01"]);
        expect(page.searchAfter).toBe("opaque+/=");
        expect(page).not.toHaveProperty("size");
        expect(mapAdminProductListingPage({ items: [], size: 0 })).toEqual({ items: [] });
    });
});

describe("mapAdminProductListingMutation", () => {
    it("keeps the resulting version and outcome", () => {
        expect(
            mapAdminProductListingMutation({
                productListingId: "pl_01",
                expectedVersion: 8,
                outcome: "UNCHANGED",
            }),
        ).toEqual({ productListingId: "pl_01", expectedVersion: 8, outcome: "UNCHANGED" });
    });
});

describe("mapToBackendAdminProductListingPatch", () => {
    it("sends only the expected version for an empty patch", () => {
        expect(mapToBackendAdminProductListingPatch({}, 7)).toEqual({ expectedVersion: 7 });
    });

    it("keeps explicit clears distinct from omission", () => {
        const body = mapToBackendAdminProductListingPatch(
            { price: null, priceEstimateMax: null, availability: null, images: [] },
            7,
        );

        expect(body).toEqual({
            expectedVersion: 7,
            price: null,
            priceEstimateMax: null,
            availability: null,
            images: [],
        });
        expect(body).not.toHaveProperty("priceEstimateMin");
        expect(body).not.toHaveProperty("url");
        expect(body).not.toHaveProperty("auction");
    });

    it("sends replaced and cleared original text with its own language", () => {
        const body = mapToBackendAdminProductListingPatch(
            { title: { text: "Nussbaumschrank", language: "de" }, description: null },
            7,
        );

        expect(body).toEqual({
            expectedVersion: 7,
            title: { text: "Nussbaumschrank", language: "de" },
            description: null,
        });
        expect(mapToBackendAdminProductListingPatch({ price: null }, 7)).not.toHaveProperty(
            "title",
        );
    });

    it("maps monetary and on-request prices explicitly", () => {
        expect(
            mapToBackendAdminProductListingPatch(
                {
                    price: { type: "MONETARY", amount: 5_000_000, currency: "JPY" },
                    priceEstimateMin: { amount: 1, currency: "EUR" },
                    url: "https://galerie.example/new",
                    images: ["https://galerie.example/a.jpg", "https://galerie.example/b.jpg"],
                },
                2,
            ),
        ).toEqual({
            expectedVersion: 2,
            price: { type: "MONETARY", amount: 5_000_000, currency: "JPY" },
            priceEstimateMin: { amount: 1, currency: "EUR" },
            url: "https://galerie.example/new",
            images: ["https://galerie.example/a.jpg", "https://galerie.example/b.jpg"],
        });
        expect(
            mapToBackendAdminProductListingPatch({ price: { type: "ON_REQUEST" } }, 2).price,
        ).toEqual({ type: "ON_REQUEST" });
    });

    it("detaches an auction without touching lot facts and clears instants individually", () => {
        expect(
            mapToBackendAdminProductListingPatch(
                { auction: { auctionId: null, timing: { scheduledCloses: null } } },
                4,
            ),
        ).toEqual({
            expectedVersion: 4,
            auction: { auctionId: null, timing: { scheduledCloses: null } },
        });
        expect(
            mapToBackendAdminProductListingPatch(
                {
                    auction: {
                        lotNumber: "12B",
                        cataloguePosition: null,
                        timing: { biddingOpens: new Date("2026-10-10T08:00:00.000Z") },
                    },
                },
                4,
            ).auction,
        ).toEqual({
            lotNumber: "12B",
            cataloguePosition: null,
            timing: { biddingOpens: "2026-10-10T08:00:00.000Z" },
        });
    });
});
