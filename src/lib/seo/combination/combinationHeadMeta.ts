import { getCombinationDescription } from "@/lib/seo/combination/combinationDescription.ts";
import { generateCombinationJsonLdScript } from "@/lib/seo/combination/combinationJsonLd.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { generateHreflangLinks } from "@/lib/seo/hreflangLinks.ts";
import { env } from "@/env.ts";
import i18n from "@/i18n/i18n.ts";
import type { Combination } from "@/data/combinations/combinations.ts";

type HeadMeta = {
    meta: Array<
        | { title: string }
        | { name: string; content: string }
        | { property: string; content: string }
    >;
    links: Array<{ rel: string; href: string; hreflang?: string }>;
    scripts: Array<{ type: string; children: string }>;
};

export function generateCombinationHeadMeta(combination: Combination | undefined): HeadMeta {
    const slug = combination?.slug ?? "";
    const combinationUrl = `${env.VITE_APP_URL}/collections/${slug}`;
    const combinationPath = `/collections/${slug}`;

    const name = combination
        ? i18n.t(`combination.names.${combination.slug}`, { defaultValue: combination.slug })
        : i18n.t("meta.combination.defaultName");
    const description = getCombinationDescription(combination?.slug);
    const siteName = i18n.t("meta.siteName");

    return {
        meta: [
            { title: `${name} | ${siteName}` },
            ...(description ? [{ name: "description", content: description }] : []),
            // Open Graph
            { property: "og:title", content: name },
            ...(description ? [{ property: "og:description", content: description }] : []),
            { property: "og:type", content: "website" },
            { property: "og:url", content: combinationUrl },
            { property: "og:image", content: BANNER_IMAGE_URL },
            { property: "og:image:alt", content: name },
            // Twitter Card
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: name },
            ...(description ? [{ name: "twitter:description", content: description }] : []),
            { name: "twitter:url", content: combinationUrl },
            { name: "twitter:image", content: BANNER_IMAGE_URL },
            { name: "twitter:image:alt", content: name },
        ],
        links: [
            { rel: "canonical", href: combinationUrl },
            ...generateHreflangLinks(combinationPath),
        ],
        scripts: combination
            ? [
                  {
                      type: "application/ld+json",
                      children: generateCombinationJsonLdScript(name, slug, combinationUrl),
                  },
              ]
            : [],
    };
}
