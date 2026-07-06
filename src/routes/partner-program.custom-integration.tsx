import PartnerCustomIntegrationPage from "@/features/partner/partner-program/pages/PartnerCustomIntegrationPage.tsx";
import { env } from "@/env";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/partner-program/custom-integration")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "partnerProgram",
            url: `${env.VITE_APP_URL}/partner-program/custom-integration`,
        }),
    component: PartnerCustomIntegrationPage,
});
