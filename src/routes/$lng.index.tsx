import LandingPage from "@/features/landing/pages/LandingPage.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { jsonLdScript } from "@/lib/seo/jsonLd.ts";
import { buildLandingStructuredData } from "@/features/landing/lib/landingStructuredData.ts";
import i18n from "@/i18n/i18n.ts";
import { localizeUrl } from "@/i18n/routing.ts";
import { env } from "@/env";

const CANONICAL_URL = `${env.VITE_APP_URL}/`;

export const Route = createFileRoute("/$lng/")({
    head: () => {
        const language = i18n.resolvedLanguage ?? i18n.language;

        return {
            ...generatePageHeadMeta({
                pageKey: "home",
                url: CANONICAL_URL,
            }),
            scripts: buildLandingStructuredData({
                t: i18n.t.bind(i18n),
                siteUrl: env.VITE_APP_URL,
                pageUrl: localizeUrl(CANONICAL_URL, language),
                language,
            }).map(jsonLdScript),
        };
    },
    component: LandingPage,
});
