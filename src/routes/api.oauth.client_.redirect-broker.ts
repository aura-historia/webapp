import { getOAuthClientRedirectBroker } from "@/features/oauth-client-broker/api/oauthClientRedirectBrokerHandler.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/oauth/client_/redirect-broker")({
    server: {
        handlers: {
            GET: getOAuthClientRedirectBroker,
        },
    },
});
