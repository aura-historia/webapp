import { createFileRoute } from "@tanstack/react-router";
import { postWooCommerceBrokerApprove } from "@/features/oauth-client-broker/api/brokerConsentHandlers.ts";

export const Route = createFileRoute("/api/oauth/broker/woocommerce/approve")({
    server: {
        handlers: {
            POST: postWooCommerceBrokerApprove,
        },
    },
});
