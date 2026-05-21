import PartnerCustomIntegrationPage from "@/components/partners/PartnerCustomIntegrationPage.tsx";
import { env } from "@/env";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/partners/custom-integration")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "partners",
            url: `${env.VITE_APP_URL}/partners/custom-integration`,
        }),
    component: PartnerCustomIntegrationPage,
});
