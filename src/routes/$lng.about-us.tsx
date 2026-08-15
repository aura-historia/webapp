import { createFileRoute } from "@tanstack/react-router";

import { AboutPage } from "@/features/about/pages/AboutPage";
import { env } from "@/env";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta";

export const Route = createFileRoute("/$lng/about-us")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "about",
            url: `${env.VITE_APP_URL}/about-us`,
        }),
    component: AboutPage,
});
