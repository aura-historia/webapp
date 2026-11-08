import { createFileRoute } from "@tanstack/react-router";

import { buildBarnebysComparisonStructuredData } from "@/features/comparison/lib/barnebysComparisonStructuredData.ts";
import { BarnebysComparisonPage } from "@/features/comparison/pages/BarnebysComparisonPage.tsx";
import { env } from "@/env";
import i18n from "@/i18n/i18n.ts";
import { localizeUrl } from "@/i18n/routing.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { jsonLdScript } from "@/lib/seo/jsonLd.ts";

const CANONICAL_URL = `${env.VITE_APP_URL}/compare/barnebys`;

export const Route = createFileRoute("/$lng/compare/barnebys")({
    head: () => {
        const language = i18n.resolvedLanguage ?? i18n.language;

        return {
            ...generatePageHeadMeta({
                pageKey: "compareBarnebys",
                url: CANONICAL_URL,
                type: "article",
            }),
            scripts: buildBarnebysComparisonStructuredData({
                t: i18n.t.bind(i18n),
                siteUrl: env.VITE_APP_URL,
                pageUrl: localizeUrl(CANONICAL_URL, language),
                language,
            }).map(jsonLdScript),
        };
    },
    component: BarnebysComparisonPage,
});
