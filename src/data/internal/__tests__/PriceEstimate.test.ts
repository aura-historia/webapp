import { describe, expect, it } from "vitest";
import { parsePriceEstimate } from "../quality-indicators/PriceEstimate.ts";
import type { PriceData } from "@/client";

describe("parsePriceEstimate", () => {
    const locale = "de-DE";

    it("returns undefined when both min and max are undefined", () => {
        expect(parsePriceEstimate(undefined, undefined, locale)).toBeUndefined();
    });

    it("returns undefined when both min and max are null-ish", () => {
        expect(parsePriceEstimate(undefined, undefined)).toBeUndefined();
    });

    it("returns formatted min and max when both are provided", () => {
        const min: PriceData = { amount: 10000, currency: "EUR" };
        const max: PriceData = { amount: 50000, currency: "EUR" };

        const result = parsePriceEstimate(min, max, locale);

        expect(result).toEqual({
            min: "100,00 €",
            max: "500,00 €",
        });
    });

    it("returns only min when max is undefined", () => {
        const min: PriceData = { amount: 10000, currency: "EUR" };

        const result = parsePriceEstimate(min, undefined, locale);

        expect(result).toEqual({
            min: "100,00 €",
            max: undefined,
        });
    });

    it("returns only max when min is undefined", () => {
        const max: PriceData = { amount: 50000, currency: "EUR" };

        const result = parsePriceEstimate(undefined, max, locale);

        expect(result).toEqual({
            min: undefined,
            max: "500,00 €",
        });
    });

    it("formats USD currency correctly", () => {
        const min: PriceData = { amount: 10000, currency: "USD" };
        const max: PriceData = { amount: 50000, currency: "USD" };

        const result = parsePriceEstimate(min, max, locale);

        expect(result).toEqual({
            min: "100,00 $",
            max: "500,00 $",
        });
    });

    it("formats GBP currency correctly", () => {
        const min: PriceData = { amount: 10000, currency: "GBP" };
        const max: PriceData = { amount: 50000, currency: "GBP" };

        const result = parsePriceEstimate(min, max, locale);

        expect(result).toEqual({
            min: "100,00 £",
            max: "500,00 £",
        });
    });

    it("handles different currencies for min and max", () => {
        const min: PriceData = { amount: 10000, currency: "EUR" };
        const max: PriceData = { amount: 50000, currency: "USD" };

        const result = parsePriceEstimate(min, max, locale);

        expect(result).toEqual({
            min: "100,00 €",
            max: "500,00 $",
        });
    });

    it("handles zero amounts correctly", () => {
        const min: PriceData = { amount: 0, currency: "EUR" };
        const max: PriceData = { amount: 50000, currency: "EUR" };

        const result = parsePriceEstimate(min, max, locale);

        expect(result).toEqual({
            min: "0,00 €",
            max: "500,00 €",
        });
    });

    it("handles small amounts correctly (cents)", () => {
        const min: PriceData = { amount: 99, currency: "EUR" };
        const max: PriceData = { amount: 199, currency: "EUR" };

        const result = parsePriceEstimate(min, max, locale);

        expect(result).toEqual({
            min: "0,99 €",
            max: "1,99 €",
        });
    });

    it("handles large amounts correctly", () => {
        const min: PriceData = { amount: 100000000, currency: "EUR" };
        const max: PriceData = { amount: 500000000, currency: "EUR" };

        const result = parsePriceEstimate(min, max, locale);

        expect(result).toEqual({
            min: "1.000.000,00 €",
            max: "5.000.000,00 €",
        });
    });
});
