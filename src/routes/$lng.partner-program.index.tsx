import PartnerProgramPage from "@/features/partner/partner-program/pages/PartnerProgramPage.tsx";
import { env } from "@/env";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$lng/partner-program/")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "partnerProgram",
            url: `${env.VITE_APP_URL}/partner-program`,
        }),
    component: PartnerProgramPage,
});
