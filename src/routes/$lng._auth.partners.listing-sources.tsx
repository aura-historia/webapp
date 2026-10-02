import { createFileRoute } from "@tanstack/react-router";
import { PartnerListingSourcesPage } from "@/features/partner/listing-source-access/pages/PartnerListingSourcesPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/partners/listing-sources")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "partnerListingSources",
            noIndex: true,
        }),
    component: PartnerListingSourcesPage,
});
