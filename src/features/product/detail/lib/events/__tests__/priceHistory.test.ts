import type { Currency } from "@/data/internal/common/Currency.ts";
import type {
    HistoryListingPrice,
    ProductListingHistoryEntry,
} from "@/data/internal/product/ProductListingHistory.ts";
import { describe, expect, it } from "vitest";
import {
    formatHistoryMoney,
    getDisplayPriceHistorySeries,
    getHistoryDisplayPrice,
    getPriceHistorySeries,
} from "../priceHistory.ts";

function discovery(
    eventId: string,
    timestamp: string,
    price: HistoryListingPrice | null,
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
    previous: HistoryListingPrice | null,
    current: HistoryListingPrice | null,
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

const snapshotAt = new Date("2026-01-01T00:00:00Z");

function projected(
    amount: number,
    currency: Currency,
    display: { readonly amount: number; readonly currency: Currency; readonly fxRateId?: string },
): HistoryListingPrice {
    return {
        type: "MONETARY",
        amount,
        currency,
        display: { fxRateId: "fx_1", capturedAt: snapshotAt, ...display },
    };
}

describe("getHistoryDisplayPrice", () => {
    it("returns only a projection into the requested currency", () => {
        const price = projected(3000, "EUR", { amount: 15000, currency: "RON" });

        expect(getHistoryDisplayPrice(price, "RON")).toEqual({
            amount: 15000,
            currency: "RON",
            fxRateId: "fx_1",
            capturedAt: snapshotAt,
        });
        expect(getHistoryDisplayPrice(price, "EUR")).toBeUndefined();
        expect(getHistoryDisplayPrice(price, undefined)).toBeUndefined();
        expect(getHistoryDisplayPrice({ type: "ON_REQUEST" }, "RON")).toBeUndefined();
        expect(getHistoryDisplayPrice(null, "RON")).toBeUndefined();
    });
});

describe("getDisplayPriceHistorySeries", () => {
    const t = (day: number) => new Date(`2026-01-0${day}T00:00:00Z`).getTime();

    it("keeps a same-currency projection and its snapshot amount", () => {
        expect(
            getDisplayPriceHistorySeries(
                [
                    discovery(
                        "1",
                        "2026-01-01T00:00:00Z",
                        projected(2999, "EUR", { amount: 2999, currency: "EUR" }),
                    ),
                ],
                "EUR",
            ),
        ).toEqual({ currency: "EUR", data: [{ x: t(1), y: 29.99 }] });
    });

    it("continues one requested-currency series across a source-currency change", () => {
        const series = getDisplayPriceHistorySeries(
            [
                discovery(
                    "1",
                    "2026-01-01T00:00:00Z",
                    projected(3000, "EUR", { amount: 14925, currency: "RON" }),
                ),
                mainPriceChange(
                    "2",
                    "2026-01-02T00:00:00Z",
                    projected(3000, "EUR", { amount: 15000, currency: "RON", fxRateId: "fx_2" }),
                    projected(29999, "SEK", { amount: 15000, currency: "RON", fxRateId: "fx_2" }),
                ),
            ],
            "RON",
        );

        expect(series).toEqual({
            currency: "RON",
            data: [
                { x: t(1), y: 149.25 },
                { x: t(2), y: 150 },
            ],
        });
    });

    it("leaves gaps for missing projections and on-request prices instead of source amounts", () => {
        // The second entry predates any snapshot with a RON quote (e.g. a legacy 19-currency one).
        const series = getDisplayPriceHistorySeries(
            [
                discovery(
                    "1",
                    "2026-01-01T00:00:00Z",
                    projected(3000, "EUR", { amount: 15000, currency: "RON" }),
                ),
                mainPriceChange(
                    "2",
                    "2026-01-02T00:00:00Z",
                    projected(3000, "EUR", { amount: 15000, currency: "RON" }),
                    { type: "MONETARY", amount: 2500, currency: "EUR" },
                ),
                mainPriceChange(
                    "3",
                    "2026-01-03T00:00:00Z",
                    { type: "MONETARY", amount: 2500, currency: "EUR" },
                    { type: "ON_REQUEST" },
                ),
                mainPriceChange("4", "2026-01-04T00:00:00Z", { type: "ON_REQUEST" }, null),
                mainPriceChange(
                    "5",
                    "2026-01-05T00:00:00Z",
                    null,
                    projected(2000, "EUR", { amount: 10000, currency: "RON" }),
                ),
            ],
            "RON",
        );

        expect(series?.data.map(({ y }) => y)).toEqual([150, null, null, null, 100]);
        expect(series?.data.some(({ y }) => y === 0 || y === 25)).toBe(false);
    });

    it.each([
        ["JPY", 4567, 4567],
        ["KRW", 44123, 44123],
        ["RON", 12345, 123.45],
        ["SEK", 12345, 123.45],
    ] as const)("scales a %s projection once with its own exponent", (currency, amount, y) => {
        const series = getDisplayPriceHistorySeries(
            [discovery("1", "2026-01-01T00:00:00Z", projected(3000, "EUR", { amount, currency }))],
            currency,
        );

        expect(series).toEqual({ currency, data: [{ x: t(1), y }] });
    });

    it("has no series without a projection into the requested currency", () => {
        const history = [
            discovery("1", "2026-01-01T00:00:00Z", {
                type: "MONETARY",
                amount: 3000,
                currency: "EUR",
            }),
            discovery(
                "2",
                "2026-01-02T00:00:00Z",
                projected(3000, "EUR", { amount: 15000, currency: "RON" }),
            ),
        ];

        expect(getDisplayPriceHistorySeries(history, "KRW")).toBeUndefined();
        expect(getDisplayPriceHistorySeries(history, undefined)).toBeUndefined();
    });

    it("leaves the source-currency series unchanged by projections", () => {
        const history = [
            discovery(
                "1",
                "2026-01-01T00:00:00Z",
                projected(3000, "EUR", { amount: 15000, currency: "RON" }),
            ),
            mainPriceChange(
                "2",
                "2026-01-02T00:00:00Z",
                projected(3000, "EUR", { amount: 15000, currency: "RON" }),
                projected(29999, "SEK", { amount: 15000, currency: "RON" }),
            ),
        ];

        expect(getPriceHistorySeries(history)).toEqual([
            {
                currency: "EUR",
                data: [
                    { x: t(1), y: 30 },
                    { x: t(2), y: null },
                ],
            },
            { currency: "SEK", data: [{ x: t(2), y: 299.99 }] },
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
});
