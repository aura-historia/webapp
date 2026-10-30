import {
    type DurableObjectNamespace,
    type RateLimit,
    env as workerEnv,
    exports as workerExports,
} from "cloudflare:workers";
import { getBrokerAppOrigin } from "@/features/oauth-client-broker/lib/brokerUrls.ts";
import type { WooCommerceOAuthBrokerTransaction } from "@/features/oauth-client-broker/server/WooCommerceOAuthBrokerTransaction.ts";

/** The Durable Object class declared in `exports` in `wrangler.jsonc`. */
export const BROKER_TRANSACTIONS_EXPORT = "WooCommerceOAuthBrokerTransaction";
/** Rate limiter binding name in `wrangler.jsonc`. */
export const BROKER_RATE_LIMITER_BINDING = "OAUTH_BROKER_WOOCOMMERCE_RATE_LIMITER";

/**
 * The transaction's Durable Object, or `undefined` (logged) when the namespace is missing, so
 * every caller fails closed rather than falling back to another store. The namespace comes from
 * the Worker's own `exports` rather than an `env` binding: a version upload may not bind a class
 * that its deployment has yet to provision.
 */
export function getBrokerTransaction(transactionId: string) {
    const namespace = workerExports[BROKER_TRANSACTIONS_EXPORT] as
        | DurableObjectNamespace<WooCommerceOAuthBrokerTransaction>
        | undefined;
    if (!namespace) {
        console.error("[OAuth broker] Transaction storage is not configured.");
        return undefined;
    }
    return namespace.get(namespace.idFromName(transactionId));
}

export type BrokerRateLimitOperation = "initiate" | "complete";

/**
 * Limits unauthenticated allocation and guessing per client address. A missing binding counts as
 * exhausted, so a misconfigured deployment refuses instead of running unlimited.
 */
export async function isWithinBrokerRateLimit(
    request: Request,
    operation: BrokerRateLimitOperation,
): Promise<boolean> {
    const limiter = workerEnv[BROKER_RATE_LIMITER_BINDING] as RateLimit | undefined;
    if (!limiter) {
        console.error("[OAuth broker] Rate limiter binding is not configured.");
        return false;
    }

    const clientAddress = request.headers.get("CF-Connecting-IP") ?? "unknown";
    // Staging and production share the limiter namespace; the origin keeps their counters apart.
    const key = `${getBrokerAppOrigin()}|${operation}|${clientAddress}`;
    try {
        const { success } = await limiter.limit({ key });
        return success;
    } catch {
        console.error("[OAuth broker] Rate limiter is unavailable.");
        return false;
    }
}
