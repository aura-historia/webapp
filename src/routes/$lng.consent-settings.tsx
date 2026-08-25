import { createFileRoute } from "@tanstack/react-router";
import { ConsentSettingsPage } from "@/features/consent-management/pages/ConsentSettingsPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";

export const Route = createFileRoute("/$lng/consent-settings")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "consentSettings",
            url: `${env.VITE_APP_URL}/consent-settings`,
            noIndex: true,
        }),
    component: ConsentSettingsPage,
});
