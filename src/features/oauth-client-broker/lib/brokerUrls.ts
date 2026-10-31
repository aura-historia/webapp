import { env } from "@/env.ts";
import type { BrokerConsentError } from "@/features/oauth-client-broker/lib/brokerProtocol.ts";

/** The broker callback registered for the WooCommerce OAuth client; keep this path stable. */
export const WOOCOMMERCE_BROKER_CALLBACK_PATH = "/api/oauth/client/redirect-broker/woocommerce";
export const WOOCOMMERCE_BROKER_INITIATE_PATH = "/api/oauth/broker/woocommerce/initiate";
export const WOOCOMMERCE_BROKER_CONSENT_PATH = "/api/oauth/broker/woocommerce/consent";
export const WOOCOMMERCE_BROKER_APPROVE_PATH = "/api/oauth/broker/woocommerce/approve";
export const WOOCOMMERCE_BROKER_DENY_PATH = "/api/oauth/broker/woocommerce/deny";
export const WOOCOMMERCE_BROKER_COMPLETE_PATH = "/api/oauth/broker/woocommerce/complete";

const AUTHORIZE_PAGE_PATH = "/oauth/authorize";

/**
 * The broker's own origin, from the build-time `VITE_APP_URL` of each deployment. It anchors the
 * callback, the browser entry and the cookie scope; request hosts are never trusted for it.
 */
export function getBrokerAppOrigin(): string {
    return new URL(env.VITE_APP_URL).origin;
}

export function getWooCommerceBrokerCallbackUrl(): string {
    return new URL(WOOCOMMERCE_BROKER_CALLBACK_PATH, getBrokerAppOrigin()).toString();
}

/** A direct authorization request for the broker callback, which only a transaction may use. */
export function isWooCommerceBrokerCallback(redirectUri: string): boolean {
    try {
        const url = new URL(redirectUri);
        return (
            url.origin === getBrokerAppOrigin() && url.pathname === WOOCOMMERCE_BROKER_CALLBACK_PATH
        );
    } catch {
        return false;
    }
}

/** Local development only: a broker served from loopback HTTP may return to loopback HTTP shops. */
export function isLoopbackBrokerOrigin(): boolean {
    const url = new URL(getBrokerAppOrigin());
    return url.protocol === "http:" && isLoopbackHostname(url.hostname);
}

export function isLoopbackHostname(hostname: string): boolean {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

/**
 * Consent page for a transaction. Without a language the app redirects to the visitor's preferred
 * one; the reference is the only protocol value in the URL.
 */
export function getBrokerConsentPageUrl(params: {
    readonly transactionId?: string;
    readonly error?: BrokerConsentError;
    readonly lng?: string;
}): string {
    const url = new URL(
        params.lng ? `/${params.lng}${AUTHORIZE_PAGE_PATH}` : AUTHORIZE_PAGE_PATH,
        getBrokerAppOrigin(),
    );
    if (params.transactionId) url.searchParams.set("transaction_id", params.transactionId);
    if (params.error) url.searchParams.set("broker_error", params.error);
    return url.toString();
}
