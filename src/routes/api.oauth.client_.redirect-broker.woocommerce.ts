import { getWooCommerceBrokerCallback } from "@/features/oauth-client-broker/api/brokerCallbackHandler.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/oauth/client_/redirect-broker/woocommerce")({
    server: {
        handlers: {
            GET: getWooCommerceBrokerCallback,
        },
    },
});
