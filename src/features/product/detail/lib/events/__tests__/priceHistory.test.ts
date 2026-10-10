import type { Currency } from "@/data/internal/common/Currency.ts";
import type { ProductListingHistoryEntry } from "@/data/internal/product/ProductListingHistory.ts";
import { describe, expect, it } from "vitest";
import { formatHistoryMoney, formatHistoryPrice, getPriceHistorySeries } from "../priceHistory.ts";

function discovery(
    eventId: string,
    timestamp: string,
    price:
        | { readonly type: "MONETARY"; readonly amount: number; readonly currency: Currency }
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
        | { readonly type: "MONETARY"; readonly amount: number; readonly currency: Currency }
        | { readonly type: "ON_REQUEST" }
        | null,
    current:
        | { readonly type: "MONETARY"; readonly amount: number; readonly currency: Currency }
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

    it.each([
        ["HUF", 12345, 123.45],
        ["TWD", 12345, 123.45],
        ["SEK", 12345, 123.45],
        ["KRW", 12345, 12345],
    ] as const)("scales %s history amounts with the backend exponent", (currency, amount, y) => {
        const series = getPriceHistorySeries([
            discovery("1", "2026-01-01T00:00:00Z", { type: "MONETARY", amount, currency }),
        ]);

        expect(series).toEqual([
            { currency, data: [{ x: new Date("2026-01-01T00:00:00Z").getTime(), y }] },
        ]);
    });

    it("keeps new-currency series separate without converting and preserves null gaps", () => {
        const series = getPriceHistorySeries([
            discovery("1", "2026-01-01T00:00:00Z", {
                type: "MONETARY",
                amount: 1500000,
                currency: "KRW",
            }),
            mainPriceChange(
                "2",
                "2026-01-02T00:00:00Z",
                { type: "MONETARY", amount: 1500000, currency: "KRW" },
                { type: "ON_REQUEST" },
            ),
            mainPriceChange(
                "3",
                "2026-01-03T00:00:00Z",
                { type: "ON_REQUEST" },
                { type: "MONETARY", amount: 1250050, currency: "HUF" },
            ),
            mainPriceChange(
                "4",
                "2026-01-04T00:00:00Z",
                { type: "MONETARY", amount: 1250050, currency: "HUF" },
                { type: "MONETARY", amount: 99950, currency: "SEK" },
            ),
        ]);

        const t = (day: number) => new Date(`2026-01-0${day}T00:00:00Z`).getTime();
        expect(series).toEqual([
            {
                currency: "KRW",
                data: [
                    { x: t(1), y: 1500000 },
                    { x: t(2), y: null },
                ],
            },
            {
                currency: "HUF",
                data: [
                    { x: t(3), y: 12500.5 },
                    { x: t(4), y: null },
                ],
            },
            { currency: "SEK", data: [{ x: t(4), y: 999.5 }] },
        ]);
    });
});

describe("formatHistoryMoney", () => {
    const normalise = (value: string) => value.replace(/[\u00a0\u202f]/g, " ");

    it("shows HUF with two fraction digits from integer minor units", () => {
        const formatted = formatHistoryMoney({ amount: 12345, currency: "HUF" }, "en-US");
        expect(normalise(formatted)).toMatch(/^HUF 123\.45$/);
    });

    it("shows HUF with two fraction digits in a German locale", () => {
        const formatted = normalise(formatHistoryMoney({ amount: 100, currency: "HUF" }, "de-DE"));
        expect(formatted).toMatch(/^1,00 (HUF|Ft)$/);
    });

    it("shows TWD with two fraction digits and KRW without fraction digits", () => {
        expect(normalise(formatHistoryMoney({ amount: 12345, currency: "TWD" }, "en-US"))).toBe(
            "NT$123.45",
        );
        expect(normalise(formatHistoryMoney({ amount: 12345, currency: "KRW" }, "en-US"))).toBe(
            "₩12,345",
        );
    });

    it("labels on-request and missing prices instead of formatting an amount", () => {
        const labels = { onRequest: "On request", notProvided: "Not provided" };
        expect(formatHistoryPrice({ type: "ON_REQUEST" }, "en-US", labels)).toBe("On request");
        expect(formatHistoryPrice(null, "en-US", labels)).toBe("Not provided");
        expect(
            normalise(
                formatHistoryPrice(
                    { type: "MONETARY", amount: 12345, currency: "SEK" },
                    "en-US",
                    labels,
                ),
            ),
        ).toBe("SEK 123.45");
    });
});
