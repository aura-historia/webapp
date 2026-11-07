import type { TFunction } from "i18next";

import {
    BARNEBYS_FAQ_ITEMS,
    BARNEBYS_STRUCTURED_DATA_TOPICS,
} from "@/features/comparison/config/barnebysComparison.data.ts";
import { BARNEBYS_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/barnebysComparisonReview.ts";

type BarnebysComparisonStructuredDataInput = {
    readonly t: TFunction;
    /** The site origin, e.g. `https://aura-historia.com`. */
    readonly siteUrl: string;
    /** The localized canonical URL of the comparison page. */
    readonly pageUrl: string;
    readonly language: string;
};

/** Headlines carry `<em>` and the verdict `<strong>` for the page; JSON-LD wants plain text. */
export function stripInlineMarkup(value: string): string {
    return value.replace(/<\/?(em|strong)>/g, "");
}

/**
 * JSON-LD for the comparison: an Article (headline, description, the fixed review date) and an
 * FAQPage built from the same strings the page shows.
 */
export function buildBarnebysComparisonStructuredData({
    t,
    siteUrl,
    pageUrl,
    language,
}: BarnebysComparisonStructuredDataInput) {
    const organization = { "@type": "Organization", name: "Aura Historia", url: siteUrl };
    const article = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: stripInlineMarkup(t("compareBarnebysPage.hero.title")),
        description: t("compareBarnebysPage.hero.subtitle"),
        dateModified: BARNEBYS_COMPARISON_LAST_REVIEWED,
        inLanguage: language,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        author: organization,
        publisher: organization,
        about: BARNEBYS_STRUCTURED_DATA_TOPICS.map((topic) =>
            t(`compareBarnebysPage.structuredData.about.${topic}`),
        ),
    };
    const faqPage = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: BARNEBYS_FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: t(`compareBarnebysPage.faq.items.${item.key}.question`),
            acceptedAnswer: {
                "@type": "Answer",
                text: t(`compareBarnebysPage.faq.items.${item.key}.answer`),
            },
        })),
    };

    return [article, faqPage] as const;
}
