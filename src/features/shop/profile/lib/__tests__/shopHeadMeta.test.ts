import { beforeAll, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n/i18n.ts";
import { makePublicListingSource } from "@/test/fixtures.ts";
import { generateShopHeadMeta } from "../shopHeadMeta.ts";

vi.mock("@/env.ts", () => ({ env: { VITE_APP_URL: "https://aura-historia.com" } }));

describe("generateShopHeadMeta", () => {
    beforeAll(async () => {
        await i18n.changeLanguage("de");
    });

    it("titles the page with the source and the brand only", () => {
        const head = generateShopHeadMeta(makePublicListingSource(), {
            shopSlugId: "antique-store",
        });

        expect(head.meta).toContainEqual({ title: "Antique Store | Aura Historia" });
        expect(head.links[0]).toEqual({
            rel: "canonical",
            href: "https://aura-historia.com/de/shops/antique-store",
        });
    });

    it("describes the page with the source name, unescaped", () => {
        const head = generateShopHeadMeta(makePublicListingSource({ name: "Smith & Sons" }), {
            shopSlugId: "smith-sons",
        });
        const description = head.meta.find(
            (tag): tag is { name: string; content: string } =>
                "name" in tag && tag.name === "description",
        )?.content;

        expect(description).toContain("Smith & Sons");
        expect(description).not.toContain("&amp;");
    });

    it("publishes a CollectionPage about the source with only public fields", () => {
        const source = makePublicListingSource({ image: "https://example.com/logo.png" });
        const head = generateShopHeadMeta(source, { shopSlugId: "antique-store" });
        const jsonLd = JSON.parse(head.scripts[0].children);

        expect(jsonLd).toMatchObject({
            "@type": "CollectionPage",
            name: "Antique Store",
            url: "https://aura-historia.com/de/shops/antique-store",
            inLanguage: "de",
            isPartOf: { "@id": "https://aura-historia.com/#website" },
            about: {
                "@type": "Organization",
                name: "Antique Store",
                image: "https://example.com/logo.png",
                sameAs: "https://example.com",
            },
        });
        expect(JSON.stringify(jsonLd)).not.toContain(source.operatorName);
        // The canonical address stays untagged; only outbound clicks use the viewUrl.
        expect(source.viewUrl).toContain("utm_source=aura_historia");
        expect(JSON.stringify(jsonLd)).not.toContain("utm_source");
        expect(head.meta).toContainEqual({ property: "og:image:alt", content: "Antique Store" });
    });

    it("leaves the banner's image tags to the root when the source has no image", () => {
        const head = generateShopHeadMeta(makePublicListingSource({ image: undefined }), {
            shopSlugId: "antique-store",
        });
        const names = head.meta.map((tag) =>
            "name" in tag ? tag.name : "property" in tag ? tag.property : "title",
        );

        expect(names).not.toContain("og:image");
        expect(names).not.toContain("og:image:alt");
    });

    it("emits no structured data before the source has loaded", () => {
        expect(generateShopHeadMeta(undefined, { shopSlugId: "antique-store" }).scripts).toEqual(
            [],
        );
    });
});
