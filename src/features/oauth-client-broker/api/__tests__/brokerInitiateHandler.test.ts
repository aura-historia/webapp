import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postWooCommerceBrokerInitiate } from "@/features/oauth-client-broker/api/brokerInitiateHandler.ts";
import {
    APP_ORIGIN,
    CLIENT_ID,
    createBrokerEnv,
    formRequest,
    installBrokerBindings,
    MERCHANT_REDIRECT_URI,
    removeBrokerBindings,
} from "@/features/oauth-client-broker/__tests__/brokerTestHarness.ts";
import { env as workerEnv } from "@/test/cloudflareWorkersStub.ts";

const mockEnv = vi.hoisted(() => ({}) as Record<string, string | undefined>);
vi.mock("@/env.ts", () => ({ env: mockEnv }));

const INITIATE_URL = `${APP_ORIGIN}/api/oauth/broker/woocommerce/initiate`;
const VALID_FIELDS = {
    protocol_version: "2",
    client_id: CLIENT_ID,
    merchant_redirect_uri: MERCHANT_REDIRECT_URI,
    client_state: "s".repeat(43),
    scope: "product-listings:write",
    completion_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    completion_challenge_method: "S256",
};

let bindings: ReturnType<typeof installBrokerBindings>;

async function initiate(
    fields: Iterable<readonly [string, string]> | Record<string, string | undefined>,
    request?: Request,
) {
    const entries = Symbol.iterator in fields ? [...fields] : Object.entries(fields);
    const response = await postWooCommerceBrokerInitiate({
        request:
            request ??
            formRequest(
                INITIATE_URL,
                entries.filter((entry): entry is [string, string] => entry[1] !== undefined),
            ),
    });
    return { status: response.status, response, body: await response.json() };
}

describe("POST /api/oauth/broker/woocommerce/initiate", () => {
    beforeEach(() => {
        Object.assign(mockEnv, createBrokerEnv());
        bindings = installBrokerBindings();
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        removeBrokerBindings();
        vi.restoreAllMocks();
    });

    it("registers a transaction and returns only an opaque browser entry", async () => {
        const { status, body, response } = await initiate(VALID_FIELDS);

        expect(status).toBe(201);
        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(response.headers.get("Pragma")).toBe("no-cache");
        expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
        expect(body).toEqual({
            protocol_version: 2,
            transaction_id: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
            authorization_url: `${APP_ORIGIN}/oauth/authorize?transaction_id=${body.transaction_id}`,
            expires_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        });
        expect(Date.parse(body.expires_at) - Date.now()).toBeGreaterThan(890_000);
        expect(bindings.objects.has(body.transaction_id)).toBe(true);
    });

    it("issues independent transactions for the same request", async () => {
        const first = await initiate(VALID_FIELDS);
        const second = await initiate(VALID_FIELDS);

        expect(first.body.transaction_id).not.toBe(second.body.transaction_id);
    });

    it.each([
        ["another protocol version", { protocol_version: "1" }, "unsupported_protocol_version"],
        ["no protocol version", { protocol_version: undefined }, "invalid_request"],
        ["another client", { client_id: "oc_00000000000000000000000000" }, "invalid_client"],
        [
            "a bare UUID client",
            { client_id: "01970f22-2bf0-7000-8000-000000000010" },
            "invalid_client",
        ],
        ["a short client state", { client_state: "short" }, "invalid_request"],
        ["a client state with padding", { client_state: `${"s".repeat(43)}=` }, "invalid_request"],
        ["no client state", { client_state: undefined }, "invalid_request"],
        ["an unknown scope", { scope: "products:write" }, "invalid_scope"],
        ["a repeated scope", { scope: "users:read users:read" }, "invalid_scope"],
        ["a double space in scope", { scope: "users:read  users:write" }, "invalid_scope"],
        ["no scope", { scope: undefined }, "invalid_scope"],
        ["an HTTP resource", { resource: "http://api.aura-historia.com" }, "invalid_target"],
        ["a relative resource", { resource: "/v1" }, "invalid_target"],
        [
            "a resource with a fragment",
            { resource: "https://api.aura-historia.com#x" },
            "invalid_target",
        ],
        [
            "a plain challenge method",
            { completion_challenge_method: "plain" },
            "invalid_completion_challenge",
        ],
        [
            "no challenge method",
            { completion_challenge_method: undefined },
            "invalid_completion_challenge",
        ],
        ["a short challenge", { completion_challenge: "abc" }, "invalid_completion_challenge"],
        [
            "a padded challenge",
            { completion_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-c=" },
            "invalid_completion_challenge",
        ],
        ["no challenge", { completion_challenge: undefined }, "invalid_completion_challenge"],
    ])("rejects %s", async (_, override, error) => {
        const { status, body } = await initiate({ ...VALID_FIELDS, ...override });

        expect(status).toBe(400);
        expect(body).toEqual({ protocol_version: 2, error, retryable: false });
        expect(bindings.objects.size).toBe(0);
    });

    it.each([
        ["plain HTTP", "http://shop.example/wp-admin/admin.php?page=aura-historia"],
        ["loopback HTTP on a public broker", "http://localhost:8080/wp-admin/admin.php"],
        ["credentials", "https://user:pass@shop.example/wp-admin/admin.php"],
        ["a fragment", "https://shop.example/wp-admin/admin.php?page=aura#top"],
        ["an empty fragment", "https://shop.example/wp-admin/admin.php#"],
        ["a relative URI", "/wp-admin/admin.php"],
        ["an uppercase host", "https://SHOP.example/wp-admin/admin.php"],
        ["a default port", "https://shop.example:443/wp-admin/admin.php"],
        ["a dot segment", "https://shop.example/wp-admin/../admin.php"],
        ["a backslash", "https://shop.example\\wp-admin/admin.php"],
        ["whitespace", "https://shop.example/wp admin/admin.php"],
        ["a reserved state parameter", "https://shop.example/wp-admin/admin.php?state=x"],
        [
            "a reserved completion_code parameter",
            "https://shop.example/admin.php?completion_code=x",
        ],
        ["an encoded reserved parameter", "https://shop.example/admin.php?st%61te=x"],
        ["a reserved parameter in another case", "https://shop.example/admin.php?Transaction_ID=x"],
        ["a reserved listing_source_id", "https://shop.example/admin.php?listing_source_id=ls_x"],
        ["a duplicate parameter", "https://shop.example/admin.php?page=a&page=b"],
        ["an empty query", "https://shop.example/admin.php?"],
        ["an empty query segment", "https://shop.example/admin.php?page=a&&tab=b"],
        ["a trailing separator", "https://shop.example/admin.php?page=a&"],
        ["an overlong URI", `https://shop.example/${"a".repeat(2048)}`],
        ["another scheme", "javascript:alert(1)"],
    ])("rejects a merchant redirect URI with %s", async (_, merchantRedirectUri) => {
        const { body } = await initiate({
            ...VALID_FIELDS,
            merchant_redirect_uri: merchantRedirectUri,
        });

        expect(body.error).toBe("invalid_redirect_uri");
        expect(bindings.objects.size).toBe(0);
    });

    it.each([
        ["a custom domain with a port", "https://shop.example:8443/wp-admin/admin.php?page=aura"],
        [
            "a WordPress subdirectory",
            "https://shop.example/store/wp-admin/admin.php?page=aura&tab=connect",
        ],
        ["no query", "https://shop.example/wp-admin/admin.php"],
    ])("accepts a merchant redirect URI with %s", async (_, merchantRedirectUri) => {
        const { status } = await initiate({
            ...VALID_FIELDS,
            merchant_redirect_uri: merchantRedirectUri,
        });

        expect(status).toBe(201);
    });

    it("accepts loopback HTTP only when the broker itself runs on loopback", async () => {
        mockEnv.VITE_APP_URL = "http://localhost:3000";

        const { status, body } = await initiate({
            ...VALID_FIELDS,
            merchant_redirect_uri: "http://localhost:8080/wp-admin/admin.php?page=aura",
        });

        expect(status).toBe(201);
        expect(body.authorization_url).toMatch(/^http:\/\/localhost:3000\/oauth\/authorize\?/);
    });

    it("rejects unknown and repeated fields", async () => {
        expect(
            (await initiate({ ...VALID_FIELDS, code_verifier: "v".repeat(43) })).body.error,
        ).toBe("invalid_request");
        expect(
            (await initiate([...Object.entries(VALID_FIELDS), ["client_state", "t".repeat(43)]]))
                .body.error,
        ).toBe("invalid_request");
    });

    it("rejects another content type and an oversized body", async () => {
        const json = new Request(INITIATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(VALID_FIELDS),
        });
        expect((await initiate({}, json)).body.error).toBe("invalid_request");

        const oversized = formRequest(INITIATE_URL, {
            ...VALID_FIELDS,
            resource: `https://a.example/${"a".repeat(9000)}`,
        });
        expect((await initiate({}, oversized)).body.error).toBe("invalid_request");
    });

    it("keeps the requested scope and resource exactly", async () => {
        const { body } = await initiate({
            ...VALID_FIELDS,
            scope: "listing-sources:write product-listings:write",
            resource: "https://api.aura-historia.com",
        });

        const view = await bindings.objects.get(body.transaction_id)?.getConsentView();
        expect(view).toMatchObject({
            status: "pending",
            context: {
                scope: "listing-sources:write product-listings:write",
                resource: "https://api.aura-historia.com",
            },
        });
    });

    it("rate-limits allocation per client address and deployment", async () => {
        bindings.limit.mockResolvedValueOnce({ success: false });

        const { status, body, response } = await initiate(
            VALID_FIELDS,
            formRequest(INITIATE_URL, VALID_FIELDS, { "CF-Connecting-IP": "203.0.113.7" }),
        );

        expect(status).toBe(429);
        expect(response.headers.get("Retry-After")).toBe("60");
        expect(body).toEqual({ protocol_version: 2, error: "rate_limited", retryable: true });
        expect(bindings.limit).toHaveBeenCalledWith({
            key: `${APP_ORIGIN}|initiate|203.0.113.7`,
        });
        expect(bindings.objects.size).toBe(0);
    });

    it.each([
        ["the client secret", "OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_SECRET", undefined],
        [
            "a canonical client ID",
            "OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_ID",
            "01970f22-2bf0-7000-8000-000000000010",
        ],
    ])("fails closed without %s", async (_, key, value) => {
        mockEnv[key] = value;

        const { status, body } = await initiate(VALID_FIELDS);

        expect(status).toBe(500);
        expect(body).toEqual({ protocol_version: 2, error: "server_error", retryable: false });
        expect(bindings.objects.size).toBe(0);
    });

    it("fails closed without transaction storage or rate limiter bindings", async () => {
        delete workerEnv.OAUTH_BROKER_WOOCOMMERCE_TRANSACTIONS;
        expect((await initiate(VALID_FIELDS)).body.error).toBe("server_error");

        delete workerEnv.OAUTH_BROKER_WOOCOMMERCE_RATE_LIMITER;
        expect((await initiate(VALID_FIELDS)).body.error).toBe("rate_limited");
    });

    it("reports unavailable storage as retryable", async () => {
        workerEnv.OAUTH_BROKER_WOOCOMMERCE_TRANSACTIONS = {
            idFromName: (name: string) => ({ toString: () => name }),
            get: () => ({
                create: async () => {
                    throw new Error("Durable Object reset");
                },
            }),
        };

        const { status, body } = await initiate(VALID_FIELDS);

        expect(status).toBe(503);
        expect(body).toEqual({
            protocol_version: 2,
            error: "temporarily_unavailable",
            retryable: true,
        });
    });
});
