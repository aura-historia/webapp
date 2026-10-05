import { describe, expect, it, vi } from "vitest";
import { makeProductListingDetail } from "@/test/fixtures.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { generateProductHeadMeta } from "../productHeadMeta.ts";

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
});
