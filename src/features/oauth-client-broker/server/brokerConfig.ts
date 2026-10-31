import { env } from "@/env.ts";
import { getWooCommerceBrokerCallbackUrl } from "@/features/oauth-client-broker/lib/brokerUrls.ts";

// The token endpoint accepts only canonical OAuthClient IDs (`oc_` TypeIDs), not bare UUIDs.
export const OAUTH_CLIENT_ID_PATTERN = /^oc_[0-9a-z]{26}$/;

/** Trusted identities of the WooCommerce broker: never taken from a request. */
export interface WooCommerceBrokerConfig {
    readonly clientId: string;
    readonly clientSecret: string;
    /** The exact redirect URI registered for the client, on this deployment's own origin. */
    readonly callbackUrl: string;
}

/** The configured client, or `undefined` (logged) so every caller fails closed. */
export function getWooCommerceBrokerConfig(): WooCommerceBrokerConfig | undefined {
    const clientId = env.OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_ID;
    const clientSecret = env.OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("[OAuth broker] Client credentials are not configured.");
        return undefined;
    }

    if (!OAUTH_CLIENT_ID_PATTERN.test(clientId)) {
        console.error("[OAuth broker] Configured client ID is not a canonical OAuthClient ID.");
        return undefined;
    }

    return { clientId, clientSecret, callbackUrl: getWooCommerceBrokerCallbackUrl() };
}
