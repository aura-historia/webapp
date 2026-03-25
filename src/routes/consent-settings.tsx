import { createFileRoute } from "@tanstack/react-router";
import { ConsentSettings } from "@/components/consent/ConsentSettings.tsx";
import { generatePageHeadMeta } from "@/lib/pageHeadMeta.ts";
import { env } from "@/env";

export const Route = createFileRoute("/consent-settings")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "consentSettings",
            url: `${env.VITE_APP_URL}/consent-settings`,
            noIndex: true,
        }),
    component: ConsentSettings,
});
