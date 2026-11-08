import { createFileRoute } from "@tanstack/react-router";
import { AccessTokensPage } from "@/features/partner/access-token-management/pages/AccessTokensPage.tsx";
import { validatePartnerCreateSearch } from "@/features/partner/common/lib/partnerCreateSearch.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/partners/access-tokens")({
    validateSearch: validatePartnerCreateSearch,
    head: () =>
        generatePageHeadMeta({
            pageKey: "partnerAccessTokens",
            noIndex: true,
        }),
    component: AccessTokensPage,
});
