import { env } from "@/env.ts";
import type { BrokerConsentError } from "@/features/oauth-client-broker/lib/brokerProtocol.ts";

/** The broker callback registered for the WooCommerce OAuth client; keep this path stable. */
export const WOOCOMMERCE_BROKER_CALLBACK_PATH = "/api/oauth/client/redirect-broker/woocommerce";
/** Server-to-server endpoints the WooCommerce extension calls; renaming them breaks the plugin. */
export const WOOCOMMERCE_BROKER_INITIATE_PATH = `${WOOCOMMERCE_BROKER_CALLBACK_PATH}/transactions`;
export const WOOCOMMERCE_BROKER_COMPLETE_PATH = `${WOOCOMMERCE_BROKER_INITIATE_PATH}/complete`;
/** Endpoints of Aura Historia's own consent page. */
export const WOOCOMMERCE_BROKER_CONSENT_PATH = "/api/oauth/broker/woocommerce/consent";
export const WOOCOMMERCE_BROKER_APPROVE_PATH = "/api/oauth/broker/woocommerce/approve";
export const WOOCOMMERCE_BROKER_DENY_PATH = "/api/oauth/broker/woocommerce/deny";

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
 * The browser entry initiation returns. The WooCommerce extension follows only an OAuth-shaped
 * authorization URL on this origin that names its client, `response_type=code` and its exact
 * scope, so the entry is a request for the broker callback whose `state` is the opaque transaction
 * reference. The consent page recognizes exactly this shape and reads every protocol value from
 * the stored transaction, never from the URL. Without a language the app redirects to the
 * visitor's preferred one.
 */
export function getBrokerAuthorizationUrl(params: {
    readonly transactionId: string;
    readonly clientId: string;
    readonly scope: string;
}): string {
    const url = new URL(AUTHORIZE_PAGE_PATH, getBrokerAppOrigin());
    url.searchParams.set("client_id", params.clientId);
    url.searchParams.set("redirect_uri", getWooCommerceBrokerCallbackUrl());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", params.scope);
    url.searchParams.set("state", params.transactionId);
    return url.toString();
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
