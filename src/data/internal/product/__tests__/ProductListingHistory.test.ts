import type { ProductListingHistoryEntryData } from "@/client";
import { describe, expect, it } from "vitest";
import { mapProductListingHistory } from "../ProductListingHistory.ts";

const discoveredEntry = {
    eventType: "PRODUCT_LISTING_DISCOVERED",
    productListingId: "plist_123",
    eventId: "event_discovered",
    timestamp: "2026-09-01T10:00:00Z",
    payload: {
        listingSourceId: "lsource_123",
        sourceListingId: "source-item-1",
        pricing: {
            price: { type: "ON_REQUEST" },
            priceEstimateMin: { amount: 120000, currency: "EUR" },
        },
        availability: "AVAILABLE",
        url: "https://example.com/item",
        imageCount: 2,
        auction: {
            auctionId: "auction_123",
            lotNumber: "A-12",
            cataloguePosition: 5,
            biddingOpens: "2026-09-10T08:00:00Z",
            scheduledCloses: null,
            reportedClosedAt: null,
        },
    },
} satisfies ProductListingHistoryEntryData;

const changedEntry = {
    eventType: "PRODUCT_LISTING_CHANGED",
    productListingId: "plist_123",
    eventId: "event_changed",
    timestamp: "2026-09-02T10:00:00Z",
    payload: {
        changes: [
            {
                type: "MAIN_PRICE_CHANGED",
                previous: { type: "MONETARY", amount: 120000, currency: "EUR" },
                current: { type: "ON_REQUEST" },
            },
            {
                type: "MINIMUM_ESTIMATE_CHANGED",
                previous: null,
                current: { amount: 100000, currency: "EUR" },
            },
            {
                type: "MAXIMUM_ESTIMATE_CHANGED",
                previous: { amount: 250000, currency: "EUR" },
                current: null,
            },
            { type: "AVAILABILITY_CHANGED", previous: "AVAILABLE", current: "RESERVED" },
            {
                type: "URL_CHANGED",
                previous: "https://example.com/old",
                current: "https://example.com/new",
            },
            { type: "IMAGES_CHANGED", previousCount: 2, currentCount: 4 },
            {
                type: "AUCTION_CHANGED",
                previous: null,
                current: {
                    lotNumber: "A-12",
                    cataloguePosition: 5,
                    biddingOpens: "2026-09-10T08:00:00Z",
                    scheduledCloses: null,
                    reportedClosedAt: null,
                },
            },
            { type: "WITHDRAWN", previousAvailability: "RESERVED" },
            { type: "RESTORED" },
            {
                type: "SALE_OBSERVED",
                observation: { observedAt: "2026-09-02T08:00:00Z", fxRateId: "fxrate_42" },
            },
            {
                type: "SALE_OBSERVATION_RETRACTED",
                observation: { observedAt: "2026-09-02T08:00:00Z", fxRateId: "fxrate_42" },
            },
        ],
    },
} satisfies ProductListingHistoryEntryData;

describe("mapProductListingHistory", () => {
    it("maps discovery snapshots and keeps on-request prices and auction timestamps", () => {
        const [entry] = mapProductListingHistory([discoveredEntry]);

        expect(entry?.payload.kind).toBe("DISCOVERED");
        if (entry?.payload.kind !== "DISCOVERED") throw new Error("Expected a discovery entry");
        expect(entry.timestamp).toEqual(new Date("2026-09-01T10:00:00Z"));
        expect(entry.payload.discovery.pricing.price).toEqual({ type: "ON_REQUEST" });
        expect(entry.payload.discovery.auction?.biddingOpens).toEqual(
            new Date("2026-09-10T08:00:00Z"),
        );
        expect(entry.payload.discovery.auction?.scheduledCloses).toBeNull();
    });

    it("maps every typed change in its original event without splitting it", () => {
        const [entry] = mapProductListingHistory([changedEntry]);

        expect(entry?.payload.kind).toBe("CHANGED");
        if (entry?.payload.kind !== "CHANGED") throw new Error("Expected a changed entry");
        expect(entry.payload.changes).toHaveLength(11);
        expect(entry.payload.changes[0]).toEqual({
            type: "MAIN_PRICE_CHANGED",
            previous: { type: "MONETARY", amount: 120000, currency: "EUR" },
            current: { type: "ON_REQUEST" },
        });
        expect(entry.payload.changes[9]).toEqual({
            type: "SALE_OBSERVED",
            observation: { observedAt: new Date("2026-09-02T08:00:00Z"), fxRateId: "fxrate_42" },
        });
        expect(entry.payload.changes[10]?.type).toBe("SALE_OBSERVATION_RETRACTED");
    });

    it("retains an unknown future change as a safe fallback", () => {
        const futureEntry = {
            ...changedEntry,
            payload: { changes: [{ type: "FUTURE_CHANGE" }] },
        } as unknown as ProductListingHistoryEntryData;

        const [entry] = mapProductListingHistory([futureEntry]);

        expect(entry?.payload).toEqual({
            kind: "CHANGED",
            changes: [{ type: "UNKNOWN", sourceType: "FUTURE_CHANGE" }],
        });
    });
});
