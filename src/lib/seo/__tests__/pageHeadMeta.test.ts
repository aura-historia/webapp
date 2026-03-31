import { beforeAll, describe, expect, it } from "vitest";
import { generatePageHeadMeta } from "../pageHeadMeta.ts";
import i18n from "@/i18n/i18n.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";

describe("pageHeadMeta", () => {
    beforeAll(async () => {
        await i18n.changeLanguage("de");
    });

    describe("generatePageHeadMeta", () => {
        describe("basic metadata generation", () => {
            it("should generate basic meta tags for home page", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(result.meta).toContainEqual({
                    title: "Aura Historia | Führende Suchmaschine für Antiquitäten",
                });
                expect(result.meta).toContainEqual({
                    name: "description",
                    content:
                        "Finden Sie Antiquitäten mit Aura Historia. Echtzeit-Daten von über 1000 Auktionshäusern, Händlern und Marktplätzen. Ihre Suche beginnt hier.",
                });
            });

            it("should generate basic meta tags for search page", () => {
                const result = generatePageHeadMeta({ pageKey: "search" });

                expect(result.meta).toContainEqual({
                    title: "Antiquitäten suchen | Aura Historia",
                });
                expect(result.meta).toContainEqual({
                    name: "description",
                    content:
                        "Suchen und entdecken Sie einzigartige Antiquitäten von vertrauenswürdigen Händlern auf Aura Historia.",
                });
            });

            it("should generate basic meta tags for login page", () => {
                const result = generatePageHeadMeta({ pageKey: "login" });

                expect(result.meta).toContainEqual({
                    title: "Anmelden | Aura Historia",
                });
                expect(result.meta).toContainEqual({
                    name: "description",
                    content:
                        "Melden Sie sich bei Ihrem Aura Historia-Konto an, um Ihre Merkliste und Einstellungen zu verwalten.",
                });
            });

            it("should generate basic meta tags for imprint page", () => {
                const result = generatePageHeadMeta({ pageKey: "imprint" });

                expect(result.meta).toContainEqual({
                    title: "Impressum | Aura Historia",
                });
                expect(result.meta).toContainEqual({
                    name: "description",
                    content: "Rechtliche Informationen und Impressum für Aura Historia.",
                });
            });

            it("should generate basic meta tags for privacy page", () => {
                const result = generatePageHeadMeta({ pageKey: "privacy" });

                expect(result.meta).toContainEqual({
                    title: "Datenschutzerklärung | Aura Historia",
                });
                expect(result.meta).toContainEqual({
                    name: "description",
                    content:
                        "Datenschutzrichtlinie und Datenschutzinformationen für Aura Historia.",
                });
            });

            it("should generate basic meta tags for account page without description", () => {
                const result = generatePageHeadMeta({ pageKey: "account" });

                expect(result.meta).toContainEqual({
                    title: "Mein Konto | Aura Historia",
                });
                // Should not have description meta tag
                expect(
                    result.meta.find((tag) => "name" in tag && tag.name === "description"),
                ).toBeUndefined();
            });

            it("should generate basic meta tags for watchlist page without description", () => {
                const result = generatePageHeadMeta({ pageKey: "watchlist" });

                expect(result.meta).toContainEqual({
                    title: "Meine Merkliste | Aura Historia",
                });
                // Should not have description meta tag
                expect(
                    result.meta.find((tag) => "name" in tag && tag.name === "description"),
                ).toBeUndefined();
            });
        });

        describe("Open Graph tags", () => {
            it("should include Open Graph title", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(result.meta).toContainEqual({
                    property: "og:title",
                    content: "Aura Historia | Führende Suchmaschine für Antiquitäten",
                });
            });

            it("should include Open Graph description when available", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(result.meta).toContainEqual({
                    property: "og:description",
                    content:
                        "Finden Sie Antiquitäten mit Aura Historia. Echtzeit-Daten von über 1000 Auktionshäusern, Händlern und Marktplätzen. Ihre Suche beginnt hier.",
                });
            });

            it("should not include Open Graph description when not available", () => {
                const result = generatePageHeadMeta({ pageKey: "account" });

                expect(
                    result.meta.find(
                        (tag) => "property" in tag && tag.property === "og:description",
                    ),
                ).toBeUndefined();
            });

            it("should include default Open Graph type as website", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(result.meta).toContainEqual({
                    property: "og:type",
                    content: "website",
                });
            });

            it("should allow custom Open Graph type", () => {
                const result = generatePageHeadMeta({
                    pageKey: "home",
                    type: "article",
                });

                expect(result.meta).toContainEqual({
                    property: "og:type",
                    content: "article",
                });
            });

            it("should include Open Graph URL when provided", () => {
                const result = generatePageHeadMeta({
                    pageKey: "home",
                    url: "https://example.com/home",
                });

                expect(result.meta).toContainEqual({
                    property: "og:url",
                    content: "https://example.com/home",
                });
            });

            it("should not include Open Graph URL when not provided", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(
                    result.meta.find((tag) => "property" in tag && tag.property === "og:url"),
                ).toBeUndefined();
            });

            it("should include Open Graph image when provided", () => {
                const result = generatePageHeadMeta({
                    pageKey: "home",
                    image: "https://example.com/image.jpg",
                });

                expect(result.meta).toContainEqual({
                    property: "og:image",
                    content: "https://example.com/image.jpg",
                });
            });

            it("should include default banner image as Open Graph image when none provided", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(result.meta).toContainEqual({
                    property: "og:image",
                    content: BANNER_IMAGE_URL,
                });
            });
        });

        describe("Twitter Card tags", () => {
            it("should include summary_large_image card type when no image explicitly provided (banner fallback)", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(result.meta).toContainEqual({
                    name: "twitter:card",
                    content: "summary_large_image",
                });
            });

            it("should include summary_large_image card type when image provided", () => {
                const result = generatePageHeadMeta({
                    pageKey: "home",
                    image: "https://example.com/image.jpg",
                });

                expect(result.meta).toContainEqual({
                    name: "twitter:card",
                    content: "summary_large_image",
                });
            });

            it("should include Twitter title", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(result.meta).toContainEqual({
                    name: "twitter:title",
                    content: "Aura Historia | Führende Suchmaschine für Antiquitäten",
                });
            });

            it("should include Twitter description when available", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(result.meta).toContainEqual({
                    name: "twitter:description",
                    content:
                        "Finden Sie Antiquitäten mit Aura Historia. Echtzeit-Daten von über 1000 Auktionshäusern, Händlern und Marktplätzen. Ihre Suche beginnt hier.",
                });
            });

            it("should not include Twitter description when not available", () => {
                const result = generatePageHeadMeta({ pageKey: "account" });

                expect(
                    result.meta.find((tag) => "name" in tag && tag.name === "twitter:description"),
                ).toBeUndefined();
            });

            it("should include Twitter URL when provided", () => {
                const result = generatePageHeadMeta({
                    pageKey: "home",
                    url: "https://example.com/home",
                });

                expect(result.meta).toContainEqual({
                    name: "twitter:url",
                    content: "https://example.com/home",
                });
            });

            it("should not include Twitter URL when not provided", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(
                    result.meta.find((tag) => "name" in tag && tag.name === "twitter:url"),
                ).toBeUndefined();
            });

            it("should include Twitter image when provided", () => {
                const result = generatePageHeadMeta({
                    pageKey: "home",
                    image: "https://example.com/image.jpg",
                });

                expect(result.meta).toContainEqual({
                    name: "twitter:image",
                    content: "https://example.com/image.jpg",
                });
            });

            it("should include default banner image as Twitter image when none provided", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(result.meta).toContainEqual({
                    name: "twitter:image",
                    content: BANNER_IMAGE_URL,
                });
            });
        });

        describe("canonical links", () => {
            it("should include canonical link when URL provided", () => {
                const result = generatePageHeadMeta({
                    pageKey: "home",
                    url: "https://example.com/home",
                });

                expect(result.links).toContainEqual({
                    rel: "canonical",
                    href: "https://example.com/home",
                });
            });

            it("should return empty links array when URL not provided", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(result.links).toEqual([]);
            });

            it("should include hreflang alternate links for all supported languages when URL provided and page is indexable", () => {
                const result = generatePageHeadMeta({
                    pageKey: "home",
                    url: "https://example.com/home",
                });

                // One canonical + 5 language alternates + x-default = 7 total
                expect(result.links?.length).toBe(7);

                expect(result.links).toContainEqual({
                    rel: "alternate",
                    hrefLang: "de",
                    href: expect.stringContaining("?lng=de"),
                });
                expect(result.links).toContainEqual({
                    rel: "alternate",
                    hrefLang: "en",
                    href: expect.stringContaining("?lng=en"),
                });
                expect(result.links).toContainEqual({
                    rel: "alternate",
                    hrefLang: "fr",
                    href: expect.stringContaining("?lng=fr"),
                });
                expect(result.links).toContainEqual({
                    rel: "alternate",
                    hrefLang: "es",
                    href: expect.stringContaining("?lng=es"),
                });
                expect(result.links).toContainEqual({
                    rel: "alternate",
                    hrefLang: "it",
                    href: expect.stringContaining("?lng=it"),
                });
                expect(result.links).toContainEqual({
                    rel: "alternate",
                    hrefLang: "x-default",
                    href: expect.stringContaining("?lng=en"),
                });
            });

            it("should NOT include hreflang links when noIndex is true", () => {
                const result = generatePageHeadMeta({
                    pageKey: "imprint",
                    url: "https://example.com/imprint",
                    noIndex: true,
                });

                // Only the canonical link, no hreflang alternates
                expect(result.links?.length).toBe(1);
                expect(result.links).toContainEqual({
                    rel: "canonical",
                    href: "https://example.com/imprint",
                });
                const hasAlternate = result.links?.some((l) => l.rel === "alternate");
                expect(hasAlternate).toBe(false);
            });
        });

        describe("robots meta tag", () => {
            it("should not include robots meta tag by default", () => {
                const result = generatePageHeadMeta({ pageKey: "home" });

                expect(
                    result.meta.find((tag) => "name" in tag && tag.name === "robots"),
                ).toBeUndefined();
            });

            it("should include noindex, nofollow when noIndex is true", () => {
                const result = generatePageHeadMeta({
                    pageKey: "home",
                    noIndex: true,
                });

                expect(result.meta).toContainEqual({
                    name: "robots",
                    content: "noindex, nofollow",
                });
            });

            it("should place robots meta tag before description", () => {
                const result = generatePageHeadMeta({
                    pageKey: "home",
                    noIndex: true,
                });

                const robotsIndex = result.meta.findIndex(
                    (tag) => "name" in tag && tag.name === "robots",
                );
                const descriptionIndex = result.meta.findIndex(
                    (tag) => "name" in tag && tag.name === "description",
                );

                expect(robotsIndex).toBeGreaterThan(-1);
                expect(descriptionIndex).toBeGreaterThan(-1);
                expect(robotsIndex).toBeLessThan(descriptionIndex);
            });
        });

        describe("complete metadata structure", () => {
            it("should generate complete metadata with all options", () => {
                const result = generatePageHeadMeta({
                    pageKey: "search",
                    url: "https://example.com/search",
                    image: "https://example.com/search-image.jpg",
                    type: "website",
                    noIndex: false,
                });

                // Verify meta array structure
                expect(result.meta).toBeDefined();
                expect(Array.isArray(result.meta)).toBe(true);
                expect(result.meta.length).toBeGreaterThan(0);

                // Verify links array structure (canonical + hreflang alternates)
                expect(result.links).toBeDefined();
                expect(Array.isArray(result.links)).toBe(true);
                expect(result.links?.length).toBeGreaterThanOrEqual(1);

                // Verify title is first
                expect(result.meta[0]).toHaveProperty("title");
            });

            it("should generate minimal metadata with only required pageKey", () => {
                const result = generatePageHeadMeta({
                    pageKey: "account",
                });

                // Should still have title and Open Graph tags
                expect(result.meta.length).toBeGreaterThan(0);
                expect(result.meta).toContainEqual({
                    title: "Mein Konto | Aura Historia",
                });

                // Should have empty links array
                expect(result.links).toEqual([]);
            });
        });
    });
});
