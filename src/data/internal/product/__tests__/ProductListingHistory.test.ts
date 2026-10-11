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

    describe("historical display projections", () => {
        const snapshot = {
            fxRateId: "fx_0cwktgjtwnf4tb6hf2f8zm0x5k",
            capturedAt: "2026-09-01T10:00:00Z",
        };
        const provenance = {
            fxRateId: "fx_0cwktgjtwnf4tb6hf2f8zm0x5k",
            capturedAt: new Date("2026-09-01T10:00:00Z"),
        };

        it("keeps discovery source values and attaches their projections", () => {
            const [entry] = mapProductListingHistory([
                {
                    ...discoveredEntry,
                    payload: {
                        ...discoveredEntry.payload,
                        pricing: {
                            price: {
                                type: "MONETARY",
                                amount: 3000,
                                currency: "EUR",
                                display: { currency: "KRW", amount: 44123, ...snapshot },
                            },
                            priceEstimateMin: {
                                amount: 120000,
                                currency: "EUR",
                                display: { currency: "KRW", amount: 1764920, ...snapshot },
                            },
                            priceEstimateMax: { amount: 250000, currency: "EUR" },
                        },
                    },
                },
            ]);

            if (entry?.payload.kind !== "DISCOVERED") throw new Error("Expected a discovery entry");
            expect(entry.payload.discovery.pricing).toEqual({
                price: {
                    type: "MONETARY",
                    amount: 3000,
                    currency: "EUR",
                    display: { currency: "KRW", amount: 44123, ...provenance },
                },
                priceEstimateMin: {
                    amount: 120000,
                    currency: "EUR",
                    display: { currency: "KRW", amount: 1764920, ...provenance },
                },
                priceEstimateMax: { amount: 250000, currency: "EUR" },
            });
            expect(entry.payload.discovery.pricing.priceEstimateMax).not.toHaveProperty("display");
        });

        it("keeps both sides of a source-currency change with the entry snapshot", () => {
            const [entry] = mapProductListingHistory([
                {
                    ...changedEntry,
                    timestamp: "2026-09-01T10:15:00Z",
                    payload: {
                        changes: [
                            {
                                type: "MAIN_PRICE_CHANGED",
                                previous: {
                                    type: "MONETARY",
                                    currency: "EUR",
                                    amount: 3000,
                                    display: { currency: "RON", amount: 15000, ...snapshot },
                                },
                                current: {
                                    type: "MONETARY",
                                    currency: "SEK",
                                    amount: 29999,
                                    display: { currency: "RON", amount: 15000, ...snapshot },
                                },
                            },
                            {
                                type: "MAXIMUM_ESTIMATE_CHANGED",
                                previous: {
                                    amount: 250000,
                                    currency: "EUR",
                                    display: { currency: "RON", amount: 1250000, ...snapshot },
                                },
                                current: {
                                    amount: 300000,
                                    currency: "SEK",
                                    display: { currency: "RON", amount: 150000, ...snapshot },
                                },
                            },
                        ],
                    },
                },
            ]);

            if (entry?.payload.kind !== "CHANGED") throw new Error("Expected a changed entry");
            expect(entry.payload.changes).toEqual([
                {
                    type: "MAIN_PRICE_CHANGED",
                    previous: {
                        type: "MONETARY",
                        amount: 3000,
                        currency: "EUR",
                        display: { currency: "RON", amount: 15000, ...provenance },
                    },
                    current: {
                        type: "MONETARY",
                        amount: 29999,
                        currency: "SEK",
                        display: { currency: "RON", amount: 15000, ...provenance },
                    },
                },
                {
                    type: "MAXIMUM_ESTIMATE_CHANGED",
                    previous: {
                        amount: 250000,
                        currency: "EUR",
                        display: { currency: "RON", amount: 1250000, ...provenance },
                    },
                    current: {
                        amount: 300000,
                        currency: "SEK",
                        display: { currency: "RON", amount: 150000, ...provenance },
                    },
                },
            ]);
        });

        it("keeps a missing projection absent instead of zeroing or substituting EUR", () => {
            // A legacy 19-currency snapshot has no RON quote, so the backend omits `display`.
            const [entry] = mapProductListingHistory([
                {
                    ...changedEntry,
                    payload: {
                        changes: [
                            {
                                type: "MAIN_PRICE_CHANGED",
                                previous: { type: "MONETARY", amount: 3000, currency: "EUR" },
                                current: { type: "MONETARY", amount: 2999, currency: "EUR" },
                            },
                            {
                                type: "MINIMUM_ESTIMATE_CHANGED",
                                previous: null,
                                current: { amount: 100000, currency: "SEK" },
                            },
                        ],
                    },
                },
            ]);

            if (entry?.payload.kind !== "CHANGED") throw new Error("Expected a changed entry");
            expect(entry.payload.changes).toEqual([
                {
                    type: "MAIN_PRICE_CHANGED",
                    previous: { type: "MONETARY", amount: 3000, currency: "EUR" },
                    current: { type: "MONETARY", amount: 2999, currency: "EUR" },
                },
                {
                    type: "MINIMUM_ESTIMATE_CHANGED",
                    previous: null,
                    current: { amount: 100000, currency: "SEK" },
                },
            ]);
            for (const change of entry.payload.changes) {
                if (change.type !== "MAIN_PRICE_CHANGED") continue;
                expect(change.previous).not.toHaveProperty("display");
                expect(change.current).not.toHaveProperty("display");
            }
        });

        it("never projects on-request or null prices", () => {
            const [entry] = mapProductListingHistory([
                {
                    ...changedEntry,
                    payload: {
                        changes: [
                            {
                                type: "MAIN_PRICE_CHANGED",
                                previous: null,
                                current: {
                                    type: "ON_REQUEST",
                                    display: { currency: "RON", amount: 0, ...snapshot },
                                },
                            },
                        ],
                    },
                } as unknown as ProductListingHistoryEntryData,
            ]);

            if (entry?.payload.kind !== "CHANGED") throw new Error("Expected a changed entry");
            expect(entry.payload.changes).toEqual([
                { type: "MAIN_PRICE_CHANGED", previous: null, current: { type: "ON_REQUEST" } },
            ]);
        });

        it("drops a malformed or unsupported projection rather than coercing it", () => {
            const [entry] = mapProductListingHistory([
                {
                    ...changedEntry,
                    payload: {
                        changes: [
                            {
                                type: "MAIN_PRICE_CHANGED",
                                previous: {
                                    type: "MONETARY",
                                    amount: 3000,
                                    currency: "EUR",
                                    display: { currency: "XYZ", amount: 15000, ...snapshot },
                                },
                                current: {
                                    type: "MONETARY",
                                    amount: 2999,
                                    currency: "EUR",
                                    display: { currency: "RON", amount: 1.5, ...snapshot },
                                },
                            },
                        ],
                    },
                } as unknown as ProductListingHistoryEntryData,
            ]);

            if (entry?.payload.kind !== "CHANGED") throw new Error("Expected a changed entry");
            expect(entry.payload.changes).toEqual([
                {
                    type: "MAIN_PRICE_CHANGED",
                    previous: { type: "MONETARY", amount: 3000, currency: "EUR" },
                    current: { type: "MONETARY", amount: 2999, currency: "EUR" },
                },
            ]);
        });
    });
});
