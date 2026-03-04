import { formatPrice } from "@/data/internal/price/Price.ts";

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

    it("handles negative amounts correctly", () => {
        expect(formatPrice({ amount: -123456, currency: "EUR" }, locale)).toBe("-1.234,56 €");
    });
});
