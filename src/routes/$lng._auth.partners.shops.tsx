import { createFileRoute } from "@tanstack/react-router";
import { PartnerShopsPage } from "@/features/partner/shop-management/pages/PartnerShopsPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

// Retained compatibility URL for granted-source access; see docs/api-migration/own-listing-source-contracts.md.
export const Route = createFileRoute("/$lng/_auth/partners/shops")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "partnerShops",
            noIndex: true,
        }),
    component: PartnerShopsPage,
});
