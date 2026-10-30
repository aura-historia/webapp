import { createFileRoute } from "@tanstack/react-router";
import { getWooCommerceBrokerConsent } from "@/features/oauth-client-broker/api/brokerConsentHandlers.ts";

export const Route = createFileRoute("/api/oauth/broker/woocommerce/consent")({
    server: {
        handlers: {
            GET: getWooCommerceBrokerConsent,
        },
    },
});
