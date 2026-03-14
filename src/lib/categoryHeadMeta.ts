import type { GetCategoryData } from "@/client";
import { generateCategoryJsonLdScript } from "@/lib/categoryJsonLd.ts";
import { BANNER_IMAGE_URL } from "@/lib/seoConstants.ts";
import { env } from "@/env";

type HeadMeta = {
    meta: Array<
        | { title: string }
        | { name: string; content: string }
        | { property: string; content: string }
    >;
    links: Array<{ rel: string; href: string }>;
    scripts: Array<{ type: string; children: string }>;
};

type CategoryHeadParams = {
    categoryId: string;
};

/**
 * Generates head metadata (meta tags, Open Graph, Twitter Cards, canonical link, and JSON-LD)
 * for a category detail page.
 *
 * When `loaderData` is undefined (SSR fallback / error state) sensible defaults are used so
 * the page always emits valid, non-empty meta tags.
 */
export function generateCategoryHeadMeta(
    loaderData: GetCategoryData | undefined,
    params: CategoryHeadParams,
): HeadMeta {
    const categoryUrl = `${env.VITE_APP_URL}/categories/${params.categoryId}`;

    const name = loaderData?.name.text ?? "Category";
    const description = loaderData?.description.text;

    return {
        meta: [
            { title: `${name} | Aura Historia` },
            ...(description ? [{ name: "description", content: description }] : []),
            // Open Graph
            { property: "og:title", content: name },
            ...(description ? [{ property: "og:description", content: description }] : []),
            { property: "og:type", content: "website" },
            { property: "og:url", content: categoryUrl },
            { property: "og:image", content: BANNER_IMAGE_URL },
            { property: "og:image:alt", content: name },
            // Twitter Card
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: name },
            ...(description ? [{ name: "twitter:description", content: description }] : []),
            { name: "twitter:url", content: categoryUrl },
            { name: "twitter:image", content: BANNER_IMAGE_URL },
            { name: "twitter:image:alt", content: name },
        ],
        links: [{ rel: "canonical", href: categoryUrl }],
        scripts: loaderData
            ? [
                  {
                      type: "application/ld+json",
                      children: generateCategoryJsonLdScript(loaderData, categoryUrl),
                  },
              ]
            : [],
    };
}
