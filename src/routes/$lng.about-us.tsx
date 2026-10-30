import { createFileRoute } from "@tanstack/react-router";

import { buildAboutStructuredData } from "@/features/about/lib/aboutStructuredData.ts";
import { AboutPage } from "@/features/about/pages/AboutPage";
import { env } from "@/env";
import i18n from "@/i18n/i18n.ts";
import { localizeUrl } from "@/i18n/routing.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta";

const CANONICAL_URL = `${env.VITE_APP_URL}/about-us`;

export const Route = createFileRoute("/$lng/about-us")({
    head: () => ({
        ...generatePageHeadMeta({
            pageKey: "about",
            url: CANONICAL_URL,
        }),
        scripts: buildAboutStructuredData({
            t: i18n.t.bind(i18n),
            siteUrl: env.VITE_APP_URL,
            pageUrl: localizeUrl(CANONICAL_URL, i18n.resolvedLanguage ?? i18n.language),
        }).map((data) => ({
            type: "application/ld+json",
            children: JSON.stringify(data),
        })),
    }),
    component: AboutPage,
});
