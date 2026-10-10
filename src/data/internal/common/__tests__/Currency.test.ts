import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { CurrencyData } from "@/client";
import {
    CURRENCIES,
    CURRENCY_MINOR_UNIT_EXPONENTS,
    CURRENCY_SYMBOLS,
    type Currency,
    inferCurrencyFromLocale,
    mapToBackendCurrency,
    parseCurrency,
    toSupportedCurrency,
} from "../Currency.ts";

const EXPECTED_CURRENCIES = [
    "EUR",
    "GBP",
    "USD",
    "AUD",
    "CAD",
    "NZD",
    "CNY",
    "BRL",
    "PLN",
    "TRY",
    "JPY",
    "CZK",
    "RUB",
    "AED",
    "SAR",
    "HKD",
    "SGD",
    "CHF",
    "ZAR",
    "SEK",
    "DKK",
    "NOK",
    "KRW",
    "INR",
    "TWD",
    "HUF",
    "RON",
    "MXN",
    "THB",
] as const;

describe("CURRENCIES", () => {
    it("should contain exactly the 29 backend currencies in canonical order", () => {
        expect(CURRENCIES).toHaveLength(29);
        expect(CURRENCIES).toEqual(EXPECTED_CURRENCIES);
        expect(new Set(CURRENCIES).size).toBe(CURRENCIES.length);
    });

    it("should agree with the generated API currency type", () => {
        expectTypeOf<Currency>().toEqualTypeOf<CurrencyData>();
    });

    it("should agree with the pinned OpenAPI contract", () => {
        const contract = readFileSync(
            resolve(process.cwd(), "public/partner-products.openapi.json"),
            "utf-8",
        );
        const schemas = JSON.parse(contract).components.schemas as Record<
            string,
            { enum?: string[] }
        >;
        expect(schemas.CurrencyData.enum).toEqual(EXPECTED_CURRENCIES);
    });
});

describe("CURRENCY_SYMBOLS", () => {
    it("should define a non-empty symbol for every supported currency", () => {
        expect(Object.keys(CURRENCY_SYMBOLS).sort()).toEqual([...CURRENCIES].sort());
        for (const currency of CURRENCIES) {
            expect(CURRENCY_SYMBOLS[currency].trim()).not.toBe("");
        }
    });

    it.each([
        ["ZAR", "R"],
        ["SEK", "SEK"],
        ["DKK", "DKK"],
        ["NOK", "NOK"],
        ["KRW", "₩"],
        ["INR", "₹"],
        ["TWD", "NT$"],
        ["HUF", "Ft"],
        ["RON", "lei"],
        ["MXN", "MX$"],
        ["THB", "฿"],
    ] as const)("should use %s -> %s", (currency, symbol) => {
        expect(CURRENCY_SYMBOLS[currency]).toBe(symbol);
    });
});

describe("CURRENCY_MINOR_UNIT_EXPONENTS", () => {
    it("should use exponent 0 only for JPY and KRW", () => {
        expect(Object.keys(CURRENCY_MINOR_UNIT_EXPONENTS).sort()).toEqual([...CURRENCIES].sort());
        for (const currency of CURRENCIES) {
            expect(CURRENCY_MINOR_UNIT_EXPONENTS[currency]).toBe(
                currency === "JPY" || currency === "KRW" ? 0 : 2,
            );
        }
    });
});

describe("parseCurrency", () => {
    it("should return EUR for undefined", () => {
        expect(parseCurrency(undefined)).toBe("EUR");
    });

    it("should return EUR for empty string", () => {
        expect(parseCurrency("")).toBe("EUR");
    });

    it("should return EUR for unknown currency", () => {
        expect(parseCurrency("XYZ")).toBe("EUR");
    });

    it("should handle mixed case input", () => {
        expect(parseCurrency("uSd")).toBe("USD");
        expect(parseCurrency("gbP")).toBe("GBP");
    });

    it.each(EXPECTED_CURRENCIES)(
        "should preserve %s in upper, lower and mixed case",
        (currency) => {
            const mixed = currency[0] + currency.slice(1).toLowerCase();
            expect(parseCurrency(currency)).toBe(currency);
            expect(parseCurrency(currency.toLowerCase())).toBe(currency);
            expect(parseCurrency(mixed)).toBe(currency);
        },
    );
});

describe("toSupportedCurrency", () => {
    it("should canonicalise supported codes", () => {
        expect(toSupportedCurrency(" sek ")).toBe("SEK");
        expect(toSupportedCurrency("Krw")).toBe("KRW");
    });

    it.each([undefined, null, "", "XYZ", "EURO"])(
        "should return undefined instead of EUR for %s",
        (value) => {
            expect(toSupportedCurrency(value)).toBeUndefined();
        },
    );
});

describe("mapToBackendCurrency", () => {
    it("should return null for undefined", () => {
        expect(mapToBackendCurrency(undefined)).toBeNull();
    });

    it.each(EXPECTED_CURRENCIES)("should return %s unchanged", (currency) => {
        expect(mapToBackendCurrency(currency)).toBe(currency);
    });
});

describe("inferCurrencyFromLocale", () => {
    it("should infer EUR for German locale", () => {
        expect(inferCurrencyFromLocale("de")).toBe("EUR");
    });

    it("should infer GBP for British English locale", () => {
        expect(inferCurrencyFromLocale("en-GB")).toBe("GBP");
    });

    it("should infer USD for US English locale", () => {
        expect(inferCurrencyFromLocale("en-US")).toBe("USD");
    });

    it("should infer JPY for Japanese locale", () => {
        expect(inferCurrencyFromLocale("ja-JP")).toBe("JPY");
    });

    it("should infer BRL for Brazilian Portuguese locale", () => {
        expect(inferCurrencyFromLocale("pt-BR")).toBe("BRL");
    });

    it("should infer PLN for Polish locale", () => {
        expect(inferCurrencyFromLocale("pl")).toBe("PLN");
    });

    it("should infer CHF for Swiss German locale", () => {
        expect(inferCurrencyFromLocale("de-CH")).toBe("CHF");
    });

    it.each([
        ["sv-SE", "SEK"],
        ["da-DK", "DKK"],
        ["nb-NO", "NOK"],
        ["ko-KR", "KRW"],
        ["en-IN", "INR"],
        ["zh-TW", "TWD"],
        ["hu-HU", "HUF"],
        ["ro-RO", "RON"],
        ["es-MX", "MXN"],
        ["th-TH", "THB"],
        ["en-ZA", "ZAR"],
    ] as const)("should infer the newly supported currency for %s", (locale, currency) => {
        expect(inferCurrencyFromLocale(locale)).toBe(currency);
    });

    it("should fall back to EUR when locale-currency resolves a language-only tag to an unsupported region", () => {
        // locale-currency reads "sv" as the El Salvador region code (SVC) and has no "nb" mapping.
        expect(inferCurrencyFromLocale("sv")).toBe("EUR");
        expect(inferCurrencyFromLocale("nb")).toBe("EUR");
    });

    it("should fall back to EUR for unknown locale", () => {
        expect(inferCurrencyFromLocale("xx-XX")).toBe("EUR");
    });
});
