import type { TFunction } from "i18next";

import {
    buildOrganizationNode,
    buildWebSiteNode,
    webSiteId,
} from "@/features/app-shell/lib/siteStructuredData.ts";
import { FAQ_DATA } from "@/features/landing/components/faq-section/FAQSection.data.ts";

type LandingStructuredDataInput = {
    readonly t: TFunction;
    /** The site origin, e.g. `https://aura-historia.com`. */
    readonly siteUrl: string;
    /** The localized canonical URL of the home page. */
    readonly pageUrl: string;
    readonly language: string;
};

/**
 * JSON-LD for the home page: the organization and website (which names the site in search
 * results), the page itself, and the visible questions as an FAQPage.
 */
export function buildLandingStructuredData({
    t,
    siteUrl,
    pageUrl,
    language,
}: LandingStructuredDataInput) {
    const graph = {
        "@context": "https://schema.org",
        "@graph": [
            buildOrganizationNode(siteUrl),
            buildWebSiteNode(siteUrl, language),
            {
                "@type": "WebPage",
                "@id": pageUrl,
                url: pageUrl,
                name: t("meta.home.title"),
                description: t("meta.home.description"),
                inLanguage: language,
                isPartOf: { "@id": webSiteId(siteUrl) },
            },
        ],
    };
    const faqPage = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_DATA.map((item) => ({
            "@type": "Question",
            name: t(item.questionKey),
            acceptedAnswer: {
                "@type": "Answer",
                text: t(item.answerKey),
            },
        })),
    };

    return [graph, faqPage] as const;
}
