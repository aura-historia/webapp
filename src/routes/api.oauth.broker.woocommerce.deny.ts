import { createFileRoute } from "@tanstack/react-router";
import { postWooCommerceBrokerDeny } from "@/features/oauth-client-broker/api/brokerConsentHandlers.ts";

export const Route = createFileRoute("/api/oauth/broker/woocommerce/deny")({
    server: {
        handlers: {
            POST: postWooCommerceBrokerDeny,
        },
    },
});
