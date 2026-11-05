import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import { generateProductJsonLdScript } from "./productJsonLd.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { env } from "@/env.ts";
import { generateHreflangLinks } from "@/lib/seo/hreflangLinks.ts";
import i18n from "@/i18n/i18n.ts";
import { localizeUrl } from "@/i18n/routing.ts";
import { getProductListingPath } from "@/features/product/catalog/lib/productListingUrl.ts";

/** Search engines show about this many characters of a meta description. */
const META_DESCRIPTION_MAX_LENGTH = 160;

/** One line of at most `META_DESCRIPTION_MAX_LENGTH` characters, cut at a word where possible. */
export function toMetaDescription(description: string): string | undefined {
    const text = description.replace(/\s+/g, " ").trim();
    if (text.length <= META_DESCRIPTION_MAX_LENGTH) return text || undefined;

    const cut = text.slice(0, META_DESCRIPTION_MAX_LENGTH - 1);
    const lastSpace = cut.lastIndexOf(" ");
    return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

type ProductHeadParams = {
    lng: string;
    productListingTitleSlugId: string;
};

export function generateProductHeadMeta(
    product: ProductListingDetail | undefined,
    params: ProductHeadParams,
) {
    const productTitle = product?.title ?? i18n.getFixedT(params.lng)("product.untitled");
    const productImage =
        product?.images.find((image) => image.prohibitedContentType === "NONE" && image.url)?.url
            ?.href ?? BANNER_IMAGE_URL;
    // The detail mapping keeps only a description in the page's language (#1232); without one,
    // the root's generic description stays.
    const description = product?.description ? toMetaDescription(product.description) : undefined;
    const listingPath = getProductListingPath(params.productListingTitleSlugId);
    const productUrl = localizeUrl(new URL(listingPath, env.VITE_APP_URL).toString(), params.lng);

    return {
        meta: [
            { title: `${productTitle} | Aura Historia` },
            ...(description ? [{ name: "description", content: description }] : []),
            { property: "og:title", content: productTitle },
            ...(description ? [{ property: "og:description", content: description }] : []),
            { property: "og:type", content: "product" },
            { property: "og:url", content: productUrl },
            { property: "og:image", content: productImage },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:url", content: productUrl },
            { name: "twitter:title", content: productTitle },
            ...(description ? [{ name: "twitter:description", content: description }] : []),
            { name: "twitter:image", content: productImage },
        ],
        links: [{ rel: "canonical", href: productUrl }, ...generateHreflangLinks(listingPath)],
        scripts: product
            ? [
                  {
                      type: "application/ld+json",
                      children: generateProductJsonLdScript(product, productUrl),
                  },
              ]
            : [],
    };
}
