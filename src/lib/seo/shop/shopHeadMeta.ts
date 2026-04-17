import type { GetShopData } from "@/client";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { generateHreflangLinks } from "@/lib/seo/hreflangLinks.ts";
import { env } from "@/env.ts";
import i18n from "@/i18n/i18n.ts";

type HeadMeta = {
    meta: Array<
        | { title: string }
        | { name: string; content: string }
        | { property: string; content: string }
    >;
    links: Array<{ rel: string; href: string; hreflang?: string }>;
    scripts: Array<{ type: string; children: string }>;
};

type ShopHeadParams = {
    shopSlugId: string;
};

type ShopCollectionPageJsonLd = {
    "@context": "https://schema.org/";
    "@type": "CollectionPage";
    name: string;
    url: string;
    image: string;
    dateCreated: string;
    dateModified: string;
};

function generateShopJsonLd(data: GetShopData, shopUrl: string): ShopCollectionPageJsonLd {
    return {
        "@context": "https://schema.org/",
        "@type": "CollectionPage",
        name: data.name,
        url: shopUrl,
        image: data.image ?? BANNER_IMAGE_URL,
        dateCreated: data.created,
        dateModified: data.updated,
    };
}

/**
 * Generates head metadata (meta tags, Open Graph, Twitter Cards, canonical link, hreflang, and JSON-LD)
 * for a shop detail page using i18n for translations.
 *
 * When `loaderData` is undefined (SSR fallback / error state) sensible defaults are used so
 * the page always emits valid, non-empty meta tags.
 */
export function generateShopHeadMeta(
    loaderData: GetShopData | undefined,
    params: ShopHeadParams,
): HeadMeta {
    const shopUrl = `${env.VITE_APP_URL}/shops/${params.shopSlugId}`;
    const shopPath = `/shops/${params.shopSlugId}`;

    const name = loaderData?.name ?? i18n.t("meta.shop.defaultName");
    const siteName = i18n.t("meta.siteName");
    const description = i18n.t("shop.header.metaDescription", { shop: name });

    return {
        meta: [
            { title: `${name} | ${siteName}` },
            { name: "description", content: description },
            // Open Graph
            { property: "og:title", content: name },
            { property: "og:description", content: description },
            { property: "og:type", content: "website" },
            { property: "og:url", content: shopUrl },
            { property: "og:image", content: loaderData?.image ?? BANNER_IMAGE_URL },
            { property: "og:image:alt", content: name },
            // Twitter Card
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: name },
            { name: "twitter:description", content: description },
            { name: "twitter:url", content: shopUrl },
            { name: "twitter:image", content: loaderData?.image ?? BANNER_IMAGE_URL },
            { name: "twitter:image:alt", content: name },
        ],
        links: [{ rel: "canonical", href: shopUrl }, ...generateHreflangLinks(shopPath)],
        scripts: loaderData
            ? [
                  {
                      type: "application/ld+json",
                      children: JSON.stringify(generateShopJsonLd(loaderData, shopUrl)),
                  },
              ]
            : [],
    };
}
