import { createFileRoute } from "@tanstack/react-router";
import { postWooCommerceBrokerComplete } from "@/features/oauth-client-broker/api/brokerCompleteHandler.ts";

// The WooCommerce extension's completion endpoint; keep the path stable.
export const Route = createFileRoute(
    "/api/oauth/client_/redirect-broker/woocommerce_/transactions_/complete",
)({
    server: {
        handlers: {
            POST: postWooCommerceBrokerComplete,
        },
    },
});
