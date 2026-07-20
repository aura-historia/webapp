import { getWooCommerceOAuthClientRedirectBroker } from "@/features/oauth-client-broker/api/oauthClientRedirectBrokerHandler.ts";
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/start-client-core";

export const Route = createFileRoute("/api/oauth/client_/redirect-broker/woocommerce")({
    server: {
        handlers: {
            GET: getWooCommerceOAuthClientRedirectBroker,
        },
    },
});
