import { createFileRoute } from "@tanstack/react-router";
import { PartnerApplicationsPage } from "@/features/partner/application-management/pages/PartnerApplicationsPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/partners/applications")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "partnerApplications",
            noIndex: true,
        }),
    component: PartnerApplicationsPage,
});
