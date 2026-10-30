import { createFileRoute } from "@tanstack/react-router";
import { postWooCommerceBrokerInitiate } from "@/features/oauth-client-broker/api/brokerInitiateHandler.ts";

export const Route = createFileRoute("/api/oauth/broker/woocommerce/initiate")({
    server: {
        handlers: {
            POST: postWooCommerceBrokerInitiate,
        },
    },
});
