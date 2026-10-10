import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import {
    currencyMinorUnitDigits,
    formatPrice,
    toMajorCurrencyAmount,
    toMinorCurrencyAmount,
} from "@/data/internal/price/Price.ts";

const normalizeSpaces = (value: string) => value.replace(/[\u00a0\u202f]/g, " ");

describe("currency minor units", () => {
    it.each(CURRENCIES)("uses the backend ISO exponent for %s", (currency) => {
        const expectedDigits = currency === "JPY" || currency === "KRW" ? 0 : 2;
        expect(currencyMinorUnitDigits(currency)).toBe(expectedDigits);
        expect(toMajorCurrencyAmount(0, currency)).toBe(0);
        expect(toMinorCurrencyAmount(toMajorCurrencyAmount(12345, currency), currency)).toBe(12345);
    });

    it.each([
        ["KRW", 12345],
        ["JPY", 12345],
        ["SEK", 123.45],
        ["TWD", 123.45],
        ["HUF", 123.45],
    ] as const)("converts 12345 minor %s units to %s major units", (currency, major) => {
        expect(toMajorCurrencyAmount(12345, currency)).toBe(major);
    });

    it.each([
        [12345, "KRW", 12345],
        [123.45, "INR", 12345],
        [123.45, "ZAR", 12345],
    ] as const)("converts %s major %s units to %s minor units", (major, currency, minor) => {
        expect(toMinorCurrencyAmount(major, currency)).toBe(minor);
    });

    it("keeps rounding minor amounts to whole units", () => {
        expect(toMinorCurrencyAmount(123.456, "SEK")).toBe(12346);
        expect(toMinorCurrencyAmount(123.4, "KRW")).toBe(123);
    });
});

describe("formatPrice", () => {
    const locale = "de-DE";

    it("formats AUD currency correctly", () => {
        expect(formatPrice({ amount: 123456, currency: "AUD" }, locale)).toBe("1.234,56 AU$");
    });

    it("formats USD currency correctly", () => {
        expect(formatPrice({ amount: 123456, currency: "USD" }, locale)).toBe("1.234,56 $");
    });

    it("formats EUR currency correctly", () => {
        expect(formatPrice({ amount: 123456, currency: "EUR" }, locale)).toBe("1.234,56 €");
    });

    it("formats GBP currency correctly", () => {
        expect(formatPrice({ amount: 123456, currency: "GBP" }, locale)).toBe("1.234,56 £");
    });

    it("formats CAD currency correctly", () => {
        expect(formatPrice({ amount: 123456, currency: "CAD" }, locale)).toBe("1.234,56 CA$");
    });

    it("formats NZD currency correctly", () => {
        expect(formatPrice({ amount: 123456, currency: "NZD" }, locale)).toBe("1.234,56 NZ$");
    });

    it("handles zero amount correctly", () => {
        expect(formatPrice({ amount: 0, currency: "USD" }, locale)).toBe("0,00 $");
    });

    it.each([
        ["KRW", 12345, "12.345 ₩"],
        ["KRW", 0, "0 ₩"],
        ["JPY", 12345, "12.345 ¥"],
        ["SEK", 12345, "123,45 SEK"],
        ["SEK", 0, "0,00 SEK"],
        ["HUF", 12345, "123,45 Ft"],
        ["TWD", 12345, "123,45 NT$"],
        ["ZAR", 12345, "123,45 R"],
        ["INR", 12345, "123,45 ₹"],
    ] as const)("formats %s %s minor units in de-DE", (currency, amount, expected) => {
        expect(normalizeSpaces(formatPrice({ amount, currency }, locale))).toBe(expected);
    });

    it("keeps two HUF fraction digits even where Intl defaults to whole forints", () => {
        expect(normalizeSpaces(formatPrice({ amount: 12345, currency: "HUF" }, "en-US"))).toBe(
            "Ft 123.45",
        );
    });

    it("handles negative amounts correctly", () => {
        expect(formatPrice({ amount: -123456, currency: "EUR" }, locale)).toBe("-1.234,56 €");
    });
});
