import { createFileRoute } from "@tanstack/react-router";
import { postWooCommerceBrokerInitiate } from "@/features/oauth-client-broker/api/brokerInitiateHandler.ts";

// The WooCommerce extension's initiation endpoint; keep the path stable.
export const Route = createFileRoute(
    "/api/oauth/client_/redirect-broker/woocommerce_/transactions",
)({
    server: {
        handlers: {
            POST: postWooCommerceBrokerInitiate,
        },
    },
});
