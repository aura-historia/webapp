import { createFileRoute } from "@tanstack/react-router";
import { oauthAuthorizeSearchSchema } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { OAuthAuthorizePage } from "@/features/oauth/pages/OAuthAuthorizePage.tsx";
import { parseBrokerConsentSearch } from "@/features/oauth-client-broker/lib/brokerConsentSearchParams.ts";
import { WooCommerceBrokerConsentPage } from "@/features/oauth-client-broker/pages/WooCommerceBrokerConsentPage.tsx";

export const Route = createFileRoute("/$lng/_auth/oauth/authorize")({
    ssr: false,
    head: () => ({
        meta: [{ name: "robots", content: "noindex, nofollow" }],
    }),
    // A WooCommerce broker transaction is read by its reference alone; any other request is OAuth.
    validateSearch: (search: Record<string, unknown>) =>
        parseBrokerConsentSearch(search) ?? oauthAuthorizeSearchSchema.parse(search),
    component: RouteComponent,
});

function RouteComponent() {
    const searchParams = Route.useSearch();
    // The router merges the raw query into the validated search, so the broker's OAuth-shaped
    // entry still carries `client_id` here: decide by the parsed shape, not by a single key.
    const brokerSearch = parseBrokerConsentSearch(searchParams);
    if (brokerSearch) {
        return <WooCommerceBrokerConsentPage searchParams={brokerSearch} />;
    }
    if (!("client_id" in searchParams)) {
        return <WooCommerceBrokerConsentPage searchParams={searchParams} />;
    }
    return <OAuthAuthorizePage searchParams={searchParams} />;
}
