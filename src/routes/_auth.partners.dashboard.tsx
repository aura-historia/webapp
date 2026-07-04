import { createFileRoute } from "@tanstack/react-router";
import { PartnerDashboardPage } from "@/features/partner-dashboard/pages/PartnerDashboardPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/_auth/partners/dashboard")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "partnerDashboard",
            noIndex: true,
        }),
    component: PartnerDashboardPage,
});
