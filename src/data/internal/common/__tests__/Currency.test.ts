import { describe, expect, it } from "vitest";
import {
    CURRENCIES,
    type Currency,
    inferCurrencyFromLocale,
    mapToBackendCurrency,
    parseCurrency,
} from "../Currency.ts";

describe("CURRENCIES", () => {
    it("should contain all 18 supported currencies", () => {
        expect(CURRENCIES).toHaveLength(18);
        expect(CURRENCIES).toEqual([
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
        ]);
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
});

describe("mapToBackendCurrency", () => {
    it("should return null for undefined", () => {
        expect(mapToBackendCurrency(undefined)).toBeNull();
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

    it("should fall back to EUR for unknown locale", () => {
        expect(inferCurrencyFromLocale("xx-XX")).toBe("EUR");
    });
});
