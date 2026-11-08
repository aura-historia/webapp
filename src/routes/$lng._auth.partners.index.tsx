import { createFileRoute } from "@tanstack/react-router";
import { PartnerOverviewPage } from "@/features/partner/overview/pages/PartnerOverviewPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/partners/")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "partnerDashboard",
            noIndex: true,
        }),
    component: PartnerOverviewPage,
});
