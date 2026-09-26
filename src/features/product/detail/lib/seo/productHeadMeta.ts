import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import { generateProductJsonLdScript } from "./productJsonLd.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { env } from "@/env.ts";
import { generateHreflangLinks } from "@/lib/seo/hreflangLinks.ts";
import i18n from "@/i18n/i18n.ts";
import { localizeUrl } from "@/i18n/routing.ts";
import { getProductListingPath } from "@/features/product/catalog/lib/productListingUrl.ts";

type ProductHeadParams = {
    lng: string;
    productListingTitleSlugId: string;
};

export function generateProductHeadMeta(
    product: ProductListingDetail | undefined,
    params: ProductHeadParams,
) {
    const productTitle = product?.title ?? i18n.getFixedT(params.lng)("product.untitled");
    const productImage = product?.images.find((image) => image.url)?.url?.href ?? BANNER_IMAGE_URL;
    const listingPath = getProductListingPath(params.productListingTitleSlugId);
    const productUrl = localizeUrl(new URL(listingPath, env.VITE_APP_URL).toString(), params.lng);

    return {
        meta: [
            { title: `${productTitle} | Aura Historia` },
            { property: "og:title", content: productTitle },
            { property: "og:type", content: "product" },
            { property: "og:url", content: productUrl },
            { property: "og:image", content: productImage },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:url", content: productUrl },
            { name: "twitter:title", content: productTitle },
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
