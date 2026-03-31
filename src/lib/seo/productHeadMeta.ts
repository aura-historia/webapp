import type { PersonalizedGetProductData } from "@/client";
import { generateProductJsonLdScript } from "@/lib/seo/productJsonLd.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { env } from "@/env.ts";
import { generateHreflangLinks } from "@/lib/seo/hreflangLinks.ts";

type HeadMeta = {
    meta: Array<
        | { title: string }
        | { name: string; content: string }
        | { property: string; content: string }
    >;
    links: Array<{ rel: string; href: string; hreflang?: string }>;
    scripts: Array<{ type: string; children: string }>;
};

type ProductHeadParams = {
    shopSlugId: string;
    productSlugId: string;
};

/**
 * Generates head metadata (meta tags, Open Graph, Twitter Cards, and JSON-LD)
 * for a product detail page.
 */
export function generateProductHeadMeta(
    loaderData: PersonalizedGetProductData | undefined,
    params: ProductHeadParams,
): HeadMeta {
    const productTitle = loaderData?.item.title.text ?? "Product";
    const productDescription = loaderData?.item.description?.text;
    const productImage =
        loaderData?.item.images?.find((img) => img.prohibitedContent === "NONE")?.url ??
        BANNER_IMAGE_URL;
    const productUrl = `${env.VITE_APP_URL}/shops/${params.shopSlugId}/products/${params.productSlugId}`;

    return {
        meta: [
            {
                title: `${productTitle} | Aura Historia`,
            },
            ...(productDescription
                ? [
                      {
                          name: "description",
                          content: productDescription,
                      },
                  ]
                : []),
            // Open Graph tags
            {
                property: "og:title",
                content: productTitle,
            },
            ...(productDescription
                ? [
                      {
                          property: "og:description",
                          content: productDescription,
                      },
                  ]
                : []),
            {
                property: "og:type",
                content: "product",
            },
            {
                property: "og:url",
                content: productUrl,
            },
            {
                property: "og:image",
                content: productImage,
            },
            // Twitter Card tags
            {
                name: "twitter:card",
                content: "summary_large_image",
            },
            {
                name: "twitter:url",
                content: productUrl,
            },
            {
                name: "twitter:title",
                content: productTitle,
            },
            ...(productDescription
                ? [
                      {
                          name: "twitter:description",
                          content: productDescription,
                      },
                  ]
                : []),
            {
                name: "twitter:image",
                content: productImage,
            },
        ],
        links: [
            { rel: "canonical", href: productUrl },
            ...generateHreflangLinks(
                `/shops/${params.shopSlugId}/products/${params.productSlugId}`,
            ),
        ],
        scripts: loaderData
            ? [
                  {
                      type: "application/ld+json",
                      children: generateProductJsonLdScript(loaderData),
                  },
              ]
            : [],
    };
}
