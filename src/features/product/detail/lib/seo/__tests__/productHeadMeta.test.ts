import { describe, expect, it, vi } from "vitest";
import { makeProductListingDetail } from "@/test/fixtures.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { generateProductHeadMeta, toMetaDescription } from "../productHeadMeta.ts";

vi.mock("@/env", () => ({ env: { VITE_APP_URL: "https://aura-historia.com" } }));

describe("generateProductHeadMeta", () => {
    it.each(["de", "en", "es", "fr", "it"])(
        "uses the route locale for canonical and sharing URLs in %s",
        (lng) => {
            const head = generateProductHeadMeta(makeProductListingDetail(), {
                lng,
                productListingTitleSlugId: "chair-pl_01TEST",
            });
            expect(head.links[0]).toEqual({
                rel: "canonical",
                href: `https://aura-historia.com/${lng}/products/chair-pl_01TEST`,
            });
            expect(head.meta).toContainEqual({ property: "og:url", content: head.links[0].href });
        },
    );

    it("uses the fallback for sensitive images even when the viewer can display them", () => {
        const product = makeProductListingDetail({
            images: [
                {
                    url: new URL("https://example.com/sensitive.jpg"),
                    prohibitedContentType: "NAZI_GERMANY",
                },
                {
                    url: new URL("https://example.com/nudity.jpg"),
                    prohibitedContentType: "NUDITY",
                },
                {
                    url: new URL("https://example.com/unassessed.jpg"),
                    prohibitedContentType: "UNKNOWN",
                },
            ],
        });
        const head = generateProductHeadMeta(product, {
            lng: "de",
            productListingTitleSlugId: "chair-pl_01TEST",
        });
        expect(head.meta).toContainEqual({ property: "og:image", content: BANNER_IMAGE_URL });
        expect(head.meta).toContainEqual({ name: "twitter:image", content: BANNER_IMAGE_URL });
    });
    it("describes the page by naming the object and its source, in every description tag", () => {
        const product = makeProductListingDetail();
        const head = generateProductHeadMeta(product, {
            lng: "de",
            productListingTitleSlugId: "chair-pl_01TEST",
        });
        const description = head.meta.find(
            (tag): tag is { name: string; content: string } =>
                "name" in tag && tag.name === "description",
        )?.content;

        expect(description).toContain(product.title);
        expect(description).toContain(product.source.name);
        expect(description?.length).toBeLessThanOrEqual(160);
        expect(head.meta).toContainEqual({ property: "og:description", content: description });
        expect(head.meta).toContainEqual({ name: "twitter:description", content: description });
    });

    it("shares a partner listing's image, described with the listing title", () => {
        const base = makeProductListingDetail();
        const product = makeProductListingDetail({
            source: { ...base.source, partner: true },
            images: [
                {
                    url: new URL("https://partner.example/chair.jpg"),
                    prohibitedContentType: "NONE",
                },
            ],
        });
        const head = generateProductHeadMeta(product, {
            lng: "en",
            productListingTitleSlugId: "chair-pl_01TEST",
        });

        expect(head.meta).toContainEqual({
            property: "og:image",
            content: "https://partner.example/chair.jpg",
        });
        expect(head.meta).toContainEqual({ property: "og:image:alt", content: product.title });
        expect(head.meta).toContainEqual({ name: "twitter:image:alt", content: product.title });
    });

    it("shares Aura Historia's banner instead of a non-partner seller's image", () => {
        const product = makeProductListingDetail({
            images: [
                { url: new URL("https://seller.example/chair.jpg"), prohibitedContentType: "NONE" },
            ],
        });
        const head = generateProductHeadMeta(product, {
            lng: "en",
            productListingTitleSlugId: "chair-pl_01TEST",
        });

        expect(head.meta).toContainEqual({ property: "og:image", content: BANNER_IMAGE_URL });
        expect(head.meta).toContainEqual({ name: "twitter:image", content: BANNER_IMAGE_URL });
        // The banner is described as the site, not as the object it does not show.
        const alt = head.meta.find((tag) => "property" in tag && tag.property === "og:image:alt");
        expect(alt && "content" in alt ? alt.content : undefined).toMatch(/^Aura Historia/);
        expect(head.meta).not.toContainEqual({ property: "og:image:alt", content: product.title });
        expect(JSON.stringify(head.meta)).not.toContain("seller.example");
    });

    it("links the offer to the source's profile in the page's language", () => {
        const product = makeProductListingDetail();
        const head = generateProductHeadMeta(product, {
            lng: "fr",
            productListingTitleSlugId: "chair-pl_01TEST",
        });
        const jsonLd = JSON.parse(head.scripts[0].children);

        expect(jsonLd["@type"]).toBe("Product");
        expect(jsonLd.offers.seller).toEqual({
            "@type": "Organization",
            name: product.source.name,
            url: `https://aura-historia.com/fr/shops/${product.source.slugId}`,
        });
    });
});

describe("toMetaDescription", () => {
    it("keeps a short text on one line", () => {
        expect(toMetaDescription("  A  short\ntext ")).toBe("A short text");
        expect(toMetaDescription(" \n ")).toBeUndefined();
    });

    it("cuts a long text at a word within 160 characters", () => {
        const result = toMetaDescription(`${"word ".repeat(40)}end`);
        expect(result).toBeDefined();
        expect(result?.length).toBeLessThanOrEqual(160);
        expect(result?.endsWith("word…")).toBe(true);
    });
});
