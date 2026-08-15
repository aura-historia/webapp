import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateHreflangLinks } from "../hreflangLinks.ts";

vi.mock("@/env", () => ({
    env: { VITE_APP_URL: "https://aura-historia.com" },
}));

vi.mock("@/i18n/languages.ts", () => ({
    DEFAULT_LANGUAGE: "en",
    SUPPORTED_LANGUAGES: [
        { code: "de" },
        { code: "en" },
        { code: "fr" },
        { code: "es" },
        { code: "it" },
    ],
}));

describe("generateHreflangLinks", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns one entry per supported language plus x-default", () => {
        const links = generateHreflangLinks("/");

        // 5 languages + x-default
        expect(links).toHaveLength(6);
    });

    it("sets rel=alternate on every entry", () => {
        const links = generateHreflangLinks("/search");

        for (const link of links) {
            expect(link.rel).toBe("alternate");
        }
    });

    it("generates a language-prefixed href for each language", () => {
        const links = generateHreflangLinks("/search");

        expect(links).toContainEqual({
            rel: "alternate",
            hrefLang: "de",
            href: "https://aura-historia.com/de/search",
        });
        expect(links).toContainEqual({
            rel: "alternate",
            hrefLang: "en",
            href: "https://aura-historia.com/en/search",
        });
        expect(links).toContainEqual({
            rel: "alternate",
            hrefLang: "fr",
            href: "https://aura-historia.com/fr/search",
        });
    });

    it("includes x-default pointing at the default language variant", () => {
        const links = generateHreflangLinks("/");

        expect(links).toContainEqual({
            rel: "alternate",
            hrefLang: "x-default",
            href: "https://aura-historia.com/en",
        });
    });

    it("handles nested paths correctly", () => {
        const links = generateHreflangLinks("/shops/antique-shop-1/products/vase-123");

        expect(links).toContainEqual({
            rel: "alternate",
            hrefLang: "de",
            href: "https://aura-historia.com/de/shops/antique-shop-1/products/vase-123",
        });
    });

    it("strips trailing slash from base URL to avoid double slashes", () => {
        const links = generateHreflangLinks("/search");

        for (const link of links) {
            expect(link.href).not.toContain("//search");
        }
    });
});
