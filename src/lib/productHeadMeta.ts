import type { PersonalizedGetProductData } from "@/client";
import { generateProductJsonLdScript } from "@/lib/productJsonLd.ts";

type HeadMeta = {
    meta: Array<
        | { title: string }
        | { name: string; content: string }
        | { property: string; content: string }
    >;
    links: Array<{ rel: string; href: string }>;
    scripts: Array<{ type: string; children: string }>;
};

type ProductHeadParams = {
    shopId: string;
    shopsProductId: string;
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
    const productImage = loaderData?.item.images?.find(
        (img) => img.prohibitedContent === "NONE",
    )?.url;
    const productUrl = `https://aura-historia.com/product/${params.shopId}/${params.shopsProductId}`;

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
            ...(productImage
                ? [
                      {
                          property: "og:image",
                          content: productImage,
                      },
                  ]
                : []),
            // Twitter Card tags
            {
                name: "twitter:card",
                content: productImage ? "summary_large_image" : "summary",
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
            ...(productImage
                ? [
                      {
                          name: "twitter:image",
                          content: productImage,
                      },
                  ]
                : []),
        ],
        links: [{ rel: "canonical", href: productUrl }],
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
