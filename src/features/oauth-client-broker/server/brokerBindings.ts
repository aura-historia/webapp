import { env as workerEnv, type DurableObjectNamespace, type RateLimit } from "cloudflare:workers";
import { getBrokerAppOrigin } from "@/features/oauth-client-broker/lib/brokerUrls.ts";
import type { WooCommerceOAuthBrokerTransaction } from "@/features/oauth-client-broker/server/WooCommerceOAuthBrokerTransaction.ts";

/** Binding names in `wrangler.jsonc`. */
export const BROKER_TRANSACTIONS_BINDING = "OAUTH_BROKER_WOOCOMMERCE_TRANSACTIONS";
export const BROKER_RATE_LIMITER_BINDING = "OAUTH_BROKER_WOOCOMMERCE_RATE_LIMITER";

/**
 * The transaction's Durable Object, or `undefined` (logged) when the binding is missing, so every
 * caller fails closed rather than falling back to another store.
 */
export function getBrokerTransaction(transactionId: string) {
    const namespace = workerEnv[BROKER_TRANSACTIONS_BINDING] as
        | DurableObjectNamespace<WooCommerceOAuthBrokerTransaction>
        | undefined;
    if (!namespace) {
        console.error("[OAuth broker] Transaction storage binding is not configured.");
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
