import type { TFunction } from "i18next";

import {
    type ComparisonDefinition,
    getComparisonFaq,
} from "@/features/comparison/config/comparisonDefinition.ts";

type ComparisonStructuredDataInput = {
    readonly definition: ComparisonDefinition;
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
 * JSON-LD for a comparison page: an Article (headline, description, the page's fixed review date)
 * and an FAQPage built from the same strings the page shows, the shared AI-assistants item included.
 */
export function buildComparisonStructuredData({
    definition,
    t,
    siteUrl,
    pageUrl,
    language,
}: ComparisonStructuredDataInput) {
    const ns = definition.namespace;
    const organization = { "@type": "Organization", name: "Aura Historia", url: siteUrl };
    const article = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: stripInlineMarkup(t(`${ns}.hero.title`)),
        description: t(`${ns}.hero.subtitle`),
        dateModified: definition.lastReviewed,
        inLanguage: language,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        author: organization,
        publisher: organization,
        about: definition.structuredDataTopics.map((topic) =>
            t(`${ns}.structuredData.about.${topic}`),
        ),
    };
    const faqPage = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: getComparisonFaq(definition).map((item) => ({
            "@type": "Question",
            name: t(item.questionKey),
            acceptedAnswer: {
                "@type": "Answer",
                text: t(item.answerKey),
            },
        })),
    };

    return [article, faqPage] as const;
}
