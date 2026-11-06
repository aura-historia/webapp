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
    it("puts a description in the page's language into the description tags", () => {
        const head = generateProductHeadMeta(
            makeProductListingDetail({ description: "Imari charger,\n\nunderglaze blue." }),
            { lng: "de", productListingTitleSlugId: "chair-pl_01TEST" },
        );
        const content = "Imari charger, underglaze blue.";
        expect(head.meta).toContainEqual({ name: "description", content });
        expect(head.meta).toContainEqual({ property: "og:description", content });
        expect(head.meta).toContainEqual({ name: "twitter:description", content });
    });

    it("leaves the description tags to the root when the listing has no description in the page's language", () => {
        const head = generateProductHeadMeta(makeProductListingDetail({ description: undefined }), {
            lng: "de",
            productListingTitleSlugId: "chair-pl_01TEST",
        });
        const names = head.meta.map((tag) =>
            "name" in tag ? tag.name : "property" in tag ? tag.property : "title",
        );
        expect(names).not.toContain("description");
        expect(names).not.toContain("og:description");
        expect(names).not.toContain("twitter:description");
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
