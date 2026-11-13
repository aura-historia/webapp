import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { env } from "@/env.ts";
import { generateHreflangLinks } from "@/lib/seo/hreflangLinks.ts";
import i18n from "@/i18n/i18n.ts";
import { localizeUrl } from "@/i18n/routing.ts";
import { getProductListingPath } from "@/features/product/catalog/lib/productListingUrl.ts";
import { getShopProfilePath } from "@/features/shop/profile/lib/shopProfileUrl.ts";
import { jsonLdScript } from "@/lib/seo/jsonLd.ts";
import { generateProductJsonLd } from "./productJsonLd.ts";

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
    const t = i18n.getFixedT(params.lng);
    const productTitle = product?.title ?? t("product.untitled");
    // Link previews copy the image they name, so only partner listings use the seller's image;
    // non-partner listings use Aura Historia's own banner (copyright review of #1323).
    const sellerImage = product?.source.partner
        ? product.images.find((image) => image.prohibitedContentType === "NONE" && image.url)?.url
              ?.href
        : undefined;
    const productImage = sellerImage ?? BANNER_IMAGE_URL;
    const productImageAlt = sellerImage ? productTitle : t("meta.siteName");
    // The backend returns no listing description, so a sentence naming the object and its source
    // describes the page; listings do not share one generic description.
    const description = product
        ? toMetaDescription(
              t("meta.product.description", {
                  title: productTitle,
                  source: product.source.name,
                  interpolation: { escapeValue: false },
              }),
          )
        : undefined;
    const listingPath = getProductListingPath(params.productListingTitleSlugId);
    const productUrl = localizeUrl(new URL(listingPath, env.VITE_APP_URL).toString(), params.lng);
    const sellerUrl = product
        ? localizeUrl(
              new URL(getShopProfilePath(product.source.slugId), env.VITE_APP_URL).toString(),
              params.lng,
          )
        : undefined;

    return {
        meta: [
            { title: `${productTitle} | Aura Historia` },
            ...(description ? [{ name: "description", content: description }] : []),
            { property: "og:title", content: productTitle },
            ...(description ? [{ property: "og:description", content: description }] : []),
            { property: "og:type", content: "product" },
            { property: "og:url", content: productUrl },
            { property: "og:image", content: productImage },
            { property: "og:image:alt", content: productImageAlt },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:url", content: productUrl },
            { name: "twitter:title", content: productTitle },
            ...(description ? [{ name: "twitter:description", content: description }] : []),
            { name: "twitter:image", content: productImage },
            { name: "twitter:image:alt", content: productImageAlt },
        ],
        links: [{ rel: "canonical", href: productUrl }, ...generateHreflangLinks(listingPath)],
        scripts: product
            ? [
                  jsonLdScript(
                      generateProductJsonLd(product, { canonicalUrl: productUrl, sellerUrl }),
                  ),
              ]
            : [],
    };
}
