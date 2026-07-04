import {
    BARNEBYS_COMPARISON_FAQ_KEYS,
    BarnebysComparisonPage,
    getBarnebysComparisonTranslationKey,
} from "@/features/comparison/components/BarnebysComparisonPage.tsx";
import { env } from "@/env";
import i18n from "@/i18n/i18n.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { createFileRoute } from "@tanstack/react-router";

const CANONICAL_URL = `${env.VITE_APP_URL}/compare/barnebys`;

export const Route = createFileRoute("/compare/barnebys")({
    head: () => {
        const head = generatePageHeadMeta({
            pageKey: "compareBarnebys",
            url: CANONICAL_URL,
        });
        const title = i18n.t("meta.compareBarnebys.title");
        const description = i18n.t("meta.compareBarnebys.description");

        return {
            ...head,
            scripts: [
                {
                    type: "application/ld+json",
                    children: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: title,
                        description,
                        url: CANONICAL_URL,
                        about: [
                            i18n.t(
                                getBarnebysComparisonTranslationKey(
                                    "structuredData.about.searchEngine",
                                ),
                            ),
                            i18n.t(
                                getBarnebysComparisonTranslationKey(
                                    "structuredData.about.auctionAggregation",
                                ),
                            ),
                            i18n.t(
                                getBarnebysComparisonTranslationKey(
                                    "structuredData.about.multilingualSearch",
                                ),
                            ),
                            i18n.t(
                                getBarnebysComparisonTranslationKey(
                                    "structuredData.about.realTimeAlerts",
                                ),
                            ),
                            i18n.t(
                                getBarnebysComparisonTranslationKey(
                                    "structuredData.about.aiDiscovery",
                                ),
                            ),
                        ],
                    }),
                },
                {
                    type: "application/ld+json",
                    children: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: BARNEBYS_COMPARISON_FAQ_KEYS.map((faqKey) => ({
                            "@type": "Question",
                            name: i18n.t(
                                getBarnebysComparisonTranslationKey(`faq.items.${faqKey}.question`),
                            ),
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: i18n.t(
                                    getBarnebysComparisonTranslationKey(
                                        `faq.items.${faqKey}.answer`,
                                    ),
                                ),
                            },
                        })),
                    }),
                },
            ],
        };
    },
    component: BarnebysComparisonPage,
});
