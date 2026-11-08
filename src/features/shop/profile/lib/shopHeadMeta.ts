import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { generateHreflangLinks } from "@/lib/seo/hreflangLinks.ts";
import { env } from "@/env.ts";
import i18n from "@/i18n/i18n.ts";
import { localizeUrl } from "@/i18n/routing.ts";
import { SITE_NAME, webSiteId } from "@/features/app-shell/lib/siteStructuredData.ts";
import { getShopProfilePath } from "@/features/shop/profile/lib/shopProfileUrl.ts";
import { type JsonLdScript, jsonLdScript } from "@/lib/seo/jsonLd.ts";

type HeadMeta = {
    meta: Array<
        | { title: string }
        | { name: string; content: string }
        | { property: string; content: string }
    >;
    links: Array<{ rel: string; href: string; hreflang?: string }>;
    scripts: JsonLdScript[];
};

type ShopHeadParams = {
    shopSlugId: string;
};

type ShopCollectionPageJsonLd = {
    "@context": "https://schema.org/";
    "@type": "CollectionPage";
    name: string;
    description: string;
    url: string;
    inLanguage: string;
    image?: string;
    isPartOf: { "@id": string };
    about: {
        "@type": "Organization";
        name: string;
        image?: string;
        sameAs?: string;
    };
};

/**
 * The page lists one source's current listings: a CollectionPage about the source. Only the
 * allowlisted public fields appear; the source's own website is its `sameAs`.
 */
export function generateShopJsonLd(
    data: PublicListingSource,
    page: { url: string; description: string; language: string },
): ShopCollectionPageJsonLd {
    const about: ShopCollectionPageJsonLd["about"] = { "@type": "Organization", name: data.name };
    if (data.image) about.image = data.image;
    if (data.url) about.sameAs = data.url;

    const jsonLd: ShopCollectionPageJsonLd = {
        "@context": "https://schema.org/",
        "@type": "CollectionPage",
        name: data.name,
        description: page.description,
        url: page.url,
        inLanguage: page.language,
        isPartOf: { "@id": webSiteId(env.VITE_APP_URL) },
        about,
    };
    if (data.image) jsonLd.image = data.image;
    return jsonLd;
}

/**
 * Generates head metadata for a public listing-source page using its allowlisted fields.
 *
 * When `loaderData` is undefined (SSR fallback / error state) sensible defaults are used so
 * the page always emits valid, non-empty meta tags.
 */
export function generateShopHeadMeta(
    loaderData: PublicListingSource | undefined,
    params: ShopHeadParams,
): HeadMeta {
    const language = i18n.resolvedLanguage ?? i18n.language;
    const shopPath = getShopProfilePath(params.shopSlugId);
    const shopUrl = localizeUrl(new URL(shopPath, env.VITE_APP_URL).toString(), language);

    const name = loaderData?.name ?? i18n.t("meta.shop.defaultName");
    const description = i18n.t("meta.shop.description", {
        shop: name,
        interpolation: { escapeValue: false },
    });

    return {
        meta: [
            { title: `${name} | ${SITE_NAME}` },
            { name: "description", content: description },
            // Open Graph
            { property: "og:title", content: name },
            { property: "og:description", content: description },
            { property: "og:type", content: "website" },
            { property: "og:url", content: shopUrl },
            // Without a source image the root's banner and its alt text stay.
            ...(loaderData?.image
                ? [
                      { property: "og:image", content: loaderData.image },
                      { property: "og:image:alt", content: name },
                  ]
                : []),
            // Twitter Card
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: name },
            { name: "twitter:description", content: description },
            { name: "twitter:url", content: shopUrl },
            ...(loaderData?.image
                ? [
                      { name: "twitter:image", content: loaderData.image },
                      { name: "twitter:image:alt", content: name },
                  ]
                : []),
        ],
        links: [{ rel: "canonical", href: shopUrl }, ...generateHreflangLinks(shopPath)],
        scripts: loaderData
            ? [
                  jsonLdScript(
                      generateShopJsonLd(loaderData, { url: shopUrl, description, language }),
                  ),
              ]
            : [],
    };
}
