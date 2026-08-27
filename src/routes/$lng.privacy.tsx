import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/features/legal/pages/PrivacyPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";

export const Route = createFileRoute("/$lng/privacy")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "privacy",
            url: `${env.VITE_APP_URL}/privacy`,
            noIndex: true,
        }),
    component: PrivacyPage,
});
