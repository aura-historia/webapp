import {
    BARNEBYS_COMPARISON_DESCRIPTION,
    BARNEBYS_COMPARISON_FAQS,
    BARNEBYS_COMPARISON_TITLE,
    BarnebysComparisonPage,
} from "@/features/comparison/components/BarnebysComparisonPage.tsx";
import { env } from "@/env";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { createFileRoute } from "@tanstack/react-router";

const CANONICAL_URL = `${env.VITE_APP_URL}/compare/barnebys`;

export const Route = createFileRoute("/compare/barnebys")({
    head: () => {
        const head = generatePageHeadMeta({
            pageKey: "compareBarnebys",
            url: CANONICAL_URL,
        });

        return {
            ...head,
            scripts: [
                {
                    type: "application/ld+json",
                    children: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: BARNEBYS_COMPARISON_TITLE,
                        description: BARNEBYS_COMPARISON_DESCRIPTION,
                        url: CANONICAL_URL,
                        about: [
                            "antiques search engine",
                            "auction aggregation",
                            "multilingual antiques search",
                            "near real-time antiques alerts",
                            "AI-assisted antiques discovery",
                        ],
                    }),
                },
                {
                    type: "application/ld+json",
                    children: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: BARNEBYS_COMPARISON_FAQS.map((faq) => ({
                            "@type": "Question",
                            name: faq.question,
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: faq.answer,
                            },
                        })),
                    }),
                },
            ],
        };
    },
    component: BarnebysComparisonPage,
});
