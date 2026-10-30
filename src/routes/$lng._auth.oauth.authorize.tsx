import { createFileRoute } from "@tanstack/react-router";
import { oauthAuthorizeSearchSchema } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { OAuthAuthorizePage } from "@/features/oauth/pages/OAuthAuthorizePage.tsx";
import {
    brokerConsentSearchSchema,
    isBrokerConsentSearch,
} from "@/features/oauth-client-broker/lib/brokerConsentSearchParams.ts";
import { WooCommerceBrokerConsentPage } from "@/features/oauth-client-broker/pages/WooCommerceBrokerConsentPage.tsx";

export const Route = createFileRoute("/$lng/_auth/oauth/authorize")({
    ssr: false,
    head: () => ({
        meta: [{ name: "robots", content: "noindex, nofollow" }],
    }),
    // A WooCommerce broker transaction carries only its reference; any other request is OAuth.
    validateSearch: (search: Record<string, unknown>) =>
        isBrokerConsentSearch(search)
            ? brokerConsentSearchSchema.parse(search)
            : oauthAuthorizeSearchSchema.parse(search),
    component: RouteComponent,
});

function RouteComponent() {
    const searchParams = Route.useSearch();
    if ("client_id" in searchParams) {
        return <OAuthAuthorizePage searchParams={searchParams} />;
    }
    return <WooCommerceBrokerConsentPage searchParams={searchParams} />;
}
