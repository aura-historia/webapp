import { vi } from "vitest";
import type { DurableObjectId } from "cloudflare:workers";
import { env as workerEnv, exports as workerExports } from "@/test/cloudflareWorkersStub.ts";
import { createSqliteDurableObjectState } from "@/test/durableObjectState.ts";
import { WooCommerceOAuthBrokerTransaction } from "@/features/oauth-client-broker/server/WooCommerceOAuthBrokerTransaction.ts";
import {
    BROKER_RATE_LIMITER_BINDING,
    BROKER_TRANSACTIONS_EXPORT,
} from "@/features/oauth-client-broker/server/brokerBindings.ts";

export const APP_ORIGIN = "https://aura-historia.com";
export const API_ORIGIN = "https://api.test.example";
export const CALLBACK_URL = `${APP_ORIGIN}/api/oauth/client/redirect-broker/woocommerce`;
export const CLIENT_ID = "oc_7b0gwc1x49e0mvbt3tfexfqgb5";
export const CLIENT_SECRET = "broker-client-secret";
export const MERCHANT_REDIRECT_URI =
    "https://shop.example/wp-admin/admin.php?page=aura-historia-partner-connect";
export const LISTING_SOURCE_ID = "ls_6rd827eqfefsva9teecmwa3ate";
export const OTHER_LISTING_SOURCE_ID = "ls_11j55nbvjfe7ds34s7gya899a9";
export const USER_SUB = "user-sub-1";
export const ACCESS_TOKEN = "aurahistoria_issued_access_token";
export const USER_JWT = "user-access-jwt";

/** The env the broker reads; tests mock `@/env.ts` with it. */
export function createBrokerEnv() {
    return {
        VITE_API_URL: API_ORIGIN,
        VITE_APP_URL: APP_ORIGIN,
        OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_ID: CLIENT_ID as string | undefined,
        OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_SECRET: CLIENT_SECRET as string | undefined,
    };
}

/**
 * Durable Object namespace with one real SQLite-backed object per name, like the runtime: every
 * handler call for the same transaction reaches the same object.
 */
export function installBrokerBindings() {
    const objects = new Map<string, WooCommerceOAuthBrokerTransaction>();
    const states = new Map<string, ReturnType<typeof createSqliteDurableObjectState>>();
    const limit = vi.fn(async (_options: { key: string }) => ({ success: true }));

    workerExports[BROKER_TRANSACTIONS_EXPORT] = {
        idFromName: (name: string): DurableObjectId => ({ toString: () => name }),
        get: (id: DurableObjectId) => {
            const name = id.toString();
            let object = objects.get(name);
            if (!object) {
                const state = createSqliteDurableObjectState();
                object = new WooCommerceOAuthBrokerTransaction(state.ctx, {});
                objects.set(name, object);
                states.set(name, state);
            }
            return object;
        },
    };
    workerEnv[BROKER_RATE_LIMITER_BINDING] = { limit };

    return {
        objects,
        states,
        limit,
        /** Fires the object's alarm, as the runtime does once its time has come. */
        async fireAlarm(transactionId: string) {
            await objects.get(transactionId)?.alarm();
        },
    };
}

export function removeBrokerBindings() {
    delete workerExports[BROKER_TRANSACTIONS_EXPORT];
    delete workerEnv[BROKER_RATE_LIMITER_BINDING];
}

export function formRequest(
    url: string,
    fields: Iterable<readonly [string, string]> | Record<string, string>,
    headers: Record<string, string> = {},
): Request {
    const entries = Symbol.iterator in fields ? [...fields] : Object.entries(fields);
    const body = new URLSearchParams(entries.map(([key, value]) => [key, value])).toString();
    // Browsers and WordPress send the length; the runtime passes it on to the Worker.
    return new Request(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": String(new TextEncoder().encode(body).length),
            ...headers,
        },
        body,
    });
}

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...headers },
    });
}

export function requestUrl(input: RequestInfo | URL): URL {
    return new URL(input instanceof Request ? input.url : input.toString());
}

export interface BackendScript {
    /** Granted source pages, in order. */
    sourcePages?: Array<{
        items: Array<{ id: string; slug: string; name: string }>;
        next?: string;
    }>;
    /** Registered website per slug. */
    registeredUrls?: Record<string, string | undefined>;
    authorize?: (url: URL) => Response;
    token?: (body: URLSearchParams) => Response;
    revoke?: (body: URLSearchParams) => Response;
}

/** A backend double answering the broker's requests; records each call. */
export function createBackend(script: BackendScript = {}) {
    const calls: Array<{ path: string; url: URL; body?: URLSearchParams; headers: Headers }> = [];
    const sourcePages = script.sourcePages ?? [
        { items: [{ id: LISTING_SOURCE_ID, slug: "shop-example", name: "Shop Example" }] },
    ];
    const registeredUrls = script.registeredUrls ?? { "shop-example": "https://shop.example/" };

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = requestUrl(input);
        const headers = new Headers(input instanceof Request ? input.headers : init?.headers);
        const rawBody = init?.body ?? (input instanceof Request ? await input.text() : undefined);
        const body = rawBody === undefined ? undefined : new URLSearchParams(rawBody.toString());
        calls.push({ path: url.pathname, url, body, headers });

        if (url.pathname === "/v1/oauth/authorize") {
            return (
                script.authorize?.(url) ??
                new Response(null, {
                    status: 302,
                    headers: {
                        Location: `${url.searchParams.get("redirect_uri")}?code=backend-code&state=${encodeURIComponent(url.searchParams.get("state") ?? "")}`,
                    },
                })
            );
        }
        if (url.pathname === "/v1/oauth/token") {
            return (
                script.token?.(body ?? new URLSearchParams()) ??
                jsonResponse({
                    access_token: ACCESS_TOKEN,
                    token_type: "Bearer",
                    scope: "product-listings:write",
                    third_party_exchange_code: "01970f22-2bf0-7000-8000-000000000099",
                })
            );
        }
        if (url.pathname === "/v1/oauth/revoke") {
            return (
                script.revoke?.(body ?? new URLSearchParams()) ??
                new Response(null, { status: 200 })
            );
        }
        if (url.pathname === "/v1/me/listing-sources") {
            const after = url.searchParams.get("after");
            const index = after ? Number(after.replace("page-", "")) : 0;
            const page = sourcePages[index] ?? { items: [] };
            return jsonResponse({
                items: page.items.map((item) => ({
                    listingSourceId: item.id,
                    listingSourceSlugId: item.slug,
                    name: item.name,
                })),
                ...(page.next === undefined ? {} : { next: page.next }),
            });
        }
        if (url.pathname.startsWith("/v1/listing-sources/by-slug/")) {
            const slug = decodeURIComponent(url.pathname.split("/").pop() ?? "");
            const registered = registeredUrls[slug];
            return jsonResponse({
                listingSourceId: LISTING_SOURCE_ID,
                listingSourceSlugId: slug,
                name: "Shop Example",
                operator: { name: "Operator" },
                ...(registered === undefined ? {} : { url: registered }),
            });
        }
        return new Response(null, { status: 404 });
    });

    return {
        fetchMock,
        calls,
        callsTo: (path: string) => calls.filter((call) => call.path === path),
    };
}
