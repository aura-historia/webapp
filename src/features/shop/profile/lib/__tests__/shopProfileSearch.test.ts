import { describe, expect, it } from "vitest";
import { type RawShopProfileSearch, validateShopProfileSearch } from "../shopProfileSearch.ts";

/** URL search input as the router hands it over, before validation. */
function validate(search: { q?: unknown }) {
    return validateShopProfileSearch(search as RawShopProfileSearch);
}

describe("validateShopProfileSearch", () => {
    it("keeps a query of at least three characters", () => {
        expect(validate({ q: "vase" })).toEqual({ q: "vase" });
        expect(validate({ q: "abc" })).toEqual({ q: "abc" });
    });

    it("trims the query", () => {
        expect(validate({ q: "  art deco  " })).toEqual({ q: "art deco" });
    });

    it("keeps short queries and drops blank ones after trimming", () => {
        expect(validate({ q: "va" })).toEqual({ q: "va" });
        expect(validate({ q: "  v  " })).toEqual({ q: "v" });
        expect(validate({ q: "   " })).toEqual({});
        expect(validate({ q: "" })).toEqual({});
    });

    it("drops a missing or non-string query", () => {
        expect(validate({})).toEqual({});
        expect(validate({ q: 1234 })).toEqual({});
        expect(validate({ q: ["vase"] })).toEqual({});
        expect(validate({ q: null })).toEqual({});
    });
});
