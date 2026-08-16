import { describe, expect, it } from "vitest";
import {
    getLanguageFromPathname,
    isLocalizedAppPath,
    localizeHref,
    localizePathname,
    stripLanguageFromPathname,
} from "@/i18n/routing.ts";

describe("language routing", () => {
    it("reads supported language prefixes", () => {
        expect(getLanguageFromPathname("/de")).toBe("de");
        expect(getLanguageFromPathname("/en/shops/example")).toBe("en");
        expect(getLanguageFromPathname("/nl/shops/example")).toBeUndefined();
    });

    it("removes existing language prefixes", () => {
        expect(stripLanguageFromPathname("/de")).toBe("/");
        expect(stripLanguageFromPathname("/de/search/shops")).toBe("/search/shops");
        expect(stripLanguageFromPathname("/search")).toBe("/search");
    });

    it("builds localized paths without duplicating an existing prefix", () => {
        expect(localizePathname("/", "de")).toBe("/de");
        expect(localizePathname("/shops/example", "en")).toBe("/en/shops/example");
        expect(localizePathname("/de/shops/example", "fr")).toBe("/fr/shops/example");
    });

    it("preserves search and hash while changing the path language", () => {
        expect(localizeHref("/de/search?q=vase#results", "en")).toBe("/en/search?q=vase#results");
    });

    it("keeps API routes outside the localized route tree", () => {
        expect(isLocalizedAppPath("/search")).toBe(true);
        expect(isLocalizedAppPath("/api")).toBe(false);
        expect(isLocalizedAppPath("/api/oauth/authorize/approve")).toBe(false);
    });
});
