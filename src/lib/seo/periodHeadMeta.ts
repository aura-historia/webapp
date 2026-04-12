import type { GetPeriodData } from "@/client";
import { getPeriodDescription } from "@/lib/seo/periodDescription.ts";
import { generatePeriodJsonLdScript } from "@/lib/seo/periodJsonLd.ts";
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

type PeriodHeadParams = {
    periodId: string;
};

/**
 * Generates head metadata (meta tags, Open Graph, Twitter Cards, canonical link, hreflang, and JSON-LD)
 * for a period detail page using i18n for translations.
 *
 * When `loaderData` is undefined (SSR fallback / error state) sensible defaults are used so
 * the page always emits valid, non-empty meta tags.
 */
export function generatePeriodHeadMeta(
    loaderData: GetPeriodData | undefined,
    params: PeriodHeadParams,
): HeadMeta {
    const periodUrl = `${env.VITE_APP_URL}/periods/${params.periodId}`;
    const periodPath = `/periods/${params.periodId}`;

    const name = loaderData?.name.text || i18n.t("meta.period.defaultName");
    const description = getPeriodDescription(loaderData?.periodKey ?? params.periodId);
    const siteName = i18n.t("meta.siteName");

    return {
        meta: [
            { title: `${name} | ${siteName}` },
            ...(description ? [{ name: "description", content: description }] : []),
            // Open Graph
            { property: "og:title", content: name },
            ...(description ? [{ property: "og:description", content: description }] : []),
            { property: "og:type", content: "website" },
            { property: "og:url", content: periodUrl },
            { property: "og:image", content: BANNER_IMAGE_URL },
            { property: "og:image:alt", content: name },
            // Twitter Card
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: name },
            ...(description ? [{ name: "twitter:description", content: description }] : []),
            { name: "twitter:url", content: periodUrl },
            { name: "twitter:image", content: BANNER_IMAGE_URL },
            { name: "twitter:image:alt", content: name },
        ],
        links: [{ rel: "canonical", href: periodUrl }, ...generateHreflangLinks(periodPath)],
        scripts: loaderData
            ? [
                  {
                      type: "application/ld+json",
                      children: generatePeriodJsonLdScript(loaderData, periodUrl),
                  },
              ]
            : [],
    };
}
