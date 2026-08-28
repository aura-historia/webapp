import LandingPage from "@/features/landing/pages/LandingPage.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";

export const Route = createFileRoute("/$lng/")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "home",
            url: `${env.VITE_APP_URL}/`,
        }),
    component: LandingPage,
});
