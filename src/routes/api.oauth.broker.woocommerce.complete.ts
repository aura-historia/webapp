import { createFileRoute } from "@tanstack/react-router";
import { postWooCommerceBrokerComplete } from "@/features/oauth-client-broker/api/brokerCompleteHandler.ts";

export const Route = createFileRoute("/api/oauth/broker/woocommerce/complete")({
    server: {
        handlers: {
            POST: postWooCommerceBrokerComplete,
        },
    },
});
