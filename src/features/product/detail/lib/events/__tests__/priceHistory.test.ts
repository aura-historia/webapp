import type { ProductListingHistoryEntry } from "@/data/internal/product/ProductListingHistory.ts";
import { describe, expect, it } from "vitest";
import { getPriceHistorySeries } from "../priceHistory.ts";

function discovery(
    eventId: string,
    timestamp: string,
    price:
        | { readonly type: "MONETARY"; readonly amount: number; readonly currency: string }
        | { readonly type: "ON_REQUEST" }
        | null,
): ProductListingHistoryEntry {
    return {
        eventType: "PRODUCT_LISTING_DISCOVERED",
        productListingId: "plist_123",
        eventId,
        timestamp: new Date(timestamp),
        payload: {
            kind: "DISCOVERED",
            discovery: {
                listingSourceId: "lsource_123",
                sourceListingId: "source-item-1",
                pricing: { price },
                availability: null,
                url: "https://example.com/item",
                imageCount: 0,
                auction: null,
            },
        },
    };
}

function mainPriceChange(
    eventId: string,
    timestamp: string,
    previous:
        | { readonly type: "MONETARY"; readonly amount: number; readonly currency: string }
        | { readonly type: "ON_REQUEST" }
        | null,
    current:
        | { readonly type: "MONETARY"; readonly amount: number; readonly currency: string }
        | { readonly type: "ON_REQUEST" }
        | null,
): ProductListingHistoryEntry {
    return {
        eventType: "PRODUCT_LISTING_CHANGED",
        productListingId: "plist_123",
        eventId,
        timestamp: new Date(timestamp),
        payload: {
            kind: "CHANGED",
            changes: [{ type: "MAIN_PRICE_CHANGED", previous, current }],
        },
    };
}

describe("getPriceHistorySeries", () => {
    it("uses source currencies separately and ends a currency series at a currency change", () => {
        const series = getPriceHistorySeries([
            discovery("1", "2026-01-01T00:00:00Z", {
                type: "MONETARY",
                amount: 1000,
                currency: "EUR",
            }),
            mainPriceChange(
                "2",
                "2026-01-02T00:00:00Z",
                { type: "MONETARY", amount: 1000, currency: "EUR" },
                { type: "MONETARY", amount: 2500, currency: "GBP" },
            ),
        ]);

        expect(series).toEqual([
            {
                currency: "EUR",
                data: [
                    { x: new Date("2026-01-01T00:00:00Z").getTime(), y: 10 },
                    { x: new Date("2026-01-02T00:00:00Z").getTime(), y: null },
                ],
            },
            {
                currency: "GBP",
                data: [{ x: new Date("2026-01-02T00:00:00Z").getTime(), y: 25 }],
            },
        ]);
    });

    it("uses a null gap for on-request prices and does not plot them as zero", () => {
        const series = getPriceHistorySeries([
            discovery("1", "2026-01-01T00:00:00Z", {
                type: "MONETARY",
                amount: 9999,
                currency: "EUR",
            }),
            mainPriceChange(
                "2",
                "2026-01-02T00:00:00Z",
                { type: "MONETARY", amount: 9999, currency: "EUR" },
                { type: "ON_REQUEST" },
            ),
            mainPriceChange(
                "3",
                "2026-01-03T00:00:00Z",
                { type: "ON_REQUEST" },
                { type: "MONETARY", amount: 12000, currency: "EUR" },
            ),
        ]);

        expect(series[0]?.data.map(({ y }) => y)).toEqual([99.99, null, 120]);
        expect(series[0]?.data.some(({ y }) => y === 0)).toBe(false);
    });

    it("scales zero-decimal source currencies using their own minor unit", () => {
        const series = getPriceHistorySeries([
            discovery("1", "2026-01-01T00:00:00Z", {
                type: "MONETARY",
                amount: 1500,
                currency: "JPY",
            }),
        ]);

        expect(series[0]?.data[0]?.y).toBe(1500);
    });

    it("puts the latest source currency last when a listing changes currency more than once", () => {
        const series = getPriceHistorySeries([
            discovery("1", "2026-01-01T00:00:00Z", {
                type: "MONETARY",
                amount: 1000,
                currency: "EUR",
            }),
            mainPriceChange(
                "2",
                "2026-01-02T00:00:00Z",
                { type: "MONETARY", amount: 1000, currency: "EUR" },
                { type: "MONETARY", amount: 2000, currency: "GBP" },
            ),
            mainPriceChange(
                "3",
                "2026-01-03T00:00:00Z",
                { type: "MONETARY", amount: 2000, currency: "GBP" },
                { type: "MONETARY", amount: 3000, currency: "EUR" },
            ),
        ]);

        expect(series.at(-1)?.currency).toBe("EUR");
    });
});
