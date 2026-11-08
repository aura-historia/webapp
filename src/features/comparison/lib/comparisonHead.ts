import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { buildComparisonStructuredData } from "@/features/comparison/lib/comparisonStructuredData.ts";
import { env } from "@/env";
import i18n from "@/i18n/i18n.ts";
import { localizeUrl } from "@/i18n/routing.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { jsonLdScript } from "@/lib/seo/jsonLd.ts";

/**
 * A comparison route's head: title, description, canonical and hreflang from `meta.<metaKey>`, and
 * the page's Article and FAQPage JSON-LD in the current language.
 */
export function buildComparisonHead(definition: ComparisonDefinition) {
    const canonicalUrl = `${env.VITE_APP_URL}/compare/${definition.slug}`;
    const language = i18n.resolvedLanguage ?? i18n.language;

    return {
        ...generatePageHeadMeta({
            pageKey: definition.metaKey,
            url: canonicalUrl,
            type: "article",
        }),
        scripts: buildComparisonStructuredData({
            definition,
            t: i18n.t.bind(i18n),
            siteUrl: env.VITE_APP_URL,
            pageUrl: localizeUrl(canonicalUrl, language),
            language,
        }).map(jsonLdScript),
    };
}
