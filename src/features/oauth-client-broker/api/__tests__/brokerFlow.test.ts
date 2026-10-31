import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sha256Base64Url } from "@/features/oauth-client-broker/lib/brokerCrypto.ts";
import { postWooCommerceBrokerInitiate } from "@/features/oauth-client-broker/api/brokerInitiateHandler.ts";
import {
    getWooCommerceBrokerConsent,
    postWooCommerceBrokerApprove,
    postWooCommerceBrokerDeny,
} from "@/features/oauth-client-broker/api/brokerConsentHandlers.ts";
import { getWooCommerceBrokerCallback } from "@/features/oauth-client-broker/api/brokerCallbackHandler.ts";
import { postWooCommerceBrokerComplete } from "@/features/oauth-client-broker/api/brokerCompleteHandler.ts";
import {
    ACCESS_TOKEN,
    APP_ORIGIN,
    CALLBACK_URL,
    CLIENT_ID,
    COMPLETE_URL,
    createBackend,
    createBrokerEnv,
    formRequest,
    INITIATE_URL,
    installBrokerBindings,
    jsonRequest,
    jsonResponse,
    LISTING_SOURCE_ID,
    MERCHANT_REDIRECT_URI,
    OTHER_LISTING_SOURCE_ID,
    removeBrokerBindings,
    USER_JWT,
    USER_SUB,
} from "@/features/oauth-client-broker/__tests__/brokerTestHarness.ts";

const mockEnv = vi.hoisted(() => ({}) as Record<string, string | undefined>);
vi.mock("@/env.ts", () => ({ env: mockEnv }));

const getServerAuthIdentity = vi.hoisted(() => vi.fn());
vi.mock("@/lib/server/amplify.server.ts", () => ({ getServerAuthIdentity }));

const COMPLETION_SECRET = "W".repeat(43);
const CLIENT_STATE = "merchant-state-".padEnd(43, "x");
const SAME_ORIGIN = { "Sec-Fetch-Site": "same-origin" };

let bindings: ReturnType<typeof installBrokerBindings>;
let backend: ReturnType<typeof createBackend>;

function useBackend(script: Parameters<typeof createBackend>[0] = {}) {
    backend = createBackend(script);
    vi.stubGlobal("fetch", backend.fetchMock);
}

async function initiate(overrides: Record<string, unknown> = {}) {
    const response = await postWooCommerceBrokerInitiate({
        request: jsonRequest(INITIATE_URL, {
            protocol_version: 2,
            client_id: CLIENT_ID,
            merchant_redirect_uri: MERCHANT_REDIRECT_URI,
            client_state: CLIENT_STATE,
            scope: "product-listings:write listing-sources:write",
            completion_challenge: await sha256Base64Url(COMPLETION_SECRET),
            completion_challenge_method: "S256",
            ...overrides,
        }),
    });
    return { response, body: (await response.json()) as Record<string, string> };
}

function decide(
    action: "approve" | "deny",
    fields: Record<string, string>,
    headers: Record<string, string> = SAME_ORIGIN,
) {
    const handler = action === "approve" ? postWooCommerceBrokerApprove : postWooCommerceBrokerDeny;
    return handler({
        request: formRequest(
            `${APP_ORIGIN}/api/oauth/broker/woocommerce/${action}`,
            fields,
            headers,
        ),
    });
}

function callback(location: string, cookies: string[]) {
    return getWooCommerceBrokerCallback({
        request: new Request(location, {
            headers: { Cookie: cookies.map((cookie) => cookie.split(";")[0]).join("; ") },
        }),
    });
}

function complete(fields: Record<string, unknown>) {
    return postWooCommerceBrokerComplete({
        request: jsonRequest(COMPLETE_URL, fields),
    });
}

/** Initiation → approval → OAuth callback: returns the merchant handoff. */
async function runToHandoff(listingSourceId = LISTING_SOURCE_ID) {
    const { body } = await initiate();
    const transactionId = body.transaction_id;
    const approval = await decide("approve", {
        lng: "en",
        transaction_id: transactionId,
        listing_source_id: listingSourceId,
    });
    const cookies = approval.headers.getSetCookie();
    const handoffResponse = await callback(approval.headers.get("Location") ?? "", cookies);
    return {
        transactionId,
        approval,
        cookies,
        handoffResponse,
        handoff: new URL(handoffResponse.headers.get("Location") ?? ""),
    };
}

describe("WooCommerce OAuth broker protocol v2", () => {
    beforeEach(() => {
        Object.assign(mockEnv, createBrokerEnv());
        bindings = installBrokerBindings();
        useBackend();
        getServerAuthIdentity.mockResolvedValue({ accessToken: USER_JWT, userSub: USER_SUB });
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        removeBrokerBindings();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("completes initiation → consent → callback → completion with the bound source and token", async () => {
        const { response, body } = await initiate();
        expect(response.status).toBe(201);
        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(Object.keys(body).sort()).toEqual([
            "authorization_url",
            "expires_at",
            "protocol_version",
            "transaction_id",
        ]);
        const authorizationUrl = new URL(body.authorization_url);
        expect(`${authorizationUrl.origin}${authorizationUrl.pathname}`).toBe(
            `${APP_ORIGIN}/oauth/authorize`,
        );
        expect(Object.fromEntries(authorizationUrl.searchParams)).toEqual({
            client_id: CLIENT_ID,
            redirect_uri: CALLBACK_URL,
            response_type: "code",
            scope: "product-listings:write listing-sources:write",
            state: body.transaction_id,
        });
        expect(body.authorization_url).not.toContain(COMPLETION_SECRET);
        expect(body.authorization_url).not.toContain(CLIENT_STATE);

        const consent = await getWooCommerceBrokerConsent({
            request: new Request(
                `${APP_ORIGIN}/api/oauth/broker/woocommerce/consent?transaction_id=${body.transaction_id}`,
            ),
        });
        expect(await consent.json()).toEqual({
            status: "pending",
            transaction_id: body.transaction_id,
            client_id: CLIENT_ID,
            merchant_redirect_uri: MERCHANT_REDIRECT_URI,
            recipient: "https://shop.example/",
            scope: "product-listings:write listing-sources:write",
            expires_at: body.expires_at,
        });

        const approval = await decide("approve", {
            lng: "en",
            transaction_id: body.transaction_id,
            listing_source_id: LISTING_SOURCE_ID,
        });
        expect(approval.status).toBe(303);
        const callbackLocation = new URL(approval.headers.get("Location") ?? "");
        expect(`${callbackLocation.origin}${callbackLocation.pathname}`).toBe(CALLBACK_URL);
        expect(callbackLocation.searchParams.get("code")).toBe("backend-code");
        const [cookie] = approval.headers.getSetCookie();
        expect(cookie).toMatch(
            new RegExp(
                `^__Secure-ah-wc-${body.transaction_id}=[A-Za-z0-9_-]{43}; Path=/api/oauth/client/redirect-broker/woocommerce; Max-Age=(899|900); HttpOnly; Secure; SameSite=Strict$`,
            ),
        );

        const [authorizeCall] = backend.callsTo("/v1/oauth/authorize");
        expect(authorizeCall.headers.get("Authorization")).toBe(`Bearer ${USER_JWT}`);
        expect(Object.fromEntries(authorizeCall.url.searchParams)).toEqual({
            response_type: "code",
            client_id: CLIENT_ID,
            redirect_uri: CALLBACK_URL,
            scope: "product-listings:write listing-sources:write",
            state: callbackLocation.searchParams.get("state"),
            code_challenge: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
            code_challenge_method: "S256",
        });

        const handoffResponse = await callback(callbackLocation.toString(), [cookie]);
        expect(handoffResponse.status).toBe(303);
        expect(handoffResponse.headers.get("Referrer-Policy")).toBe("no-referrer");
        expect(handoffResponse.headers.getSetCookie()[0]).toContain("Max-Age=0");
        const location = handoffResponse.headers.get("Location") ?? "";
        expect(location.startsWith(`${MERCHANT_REDIRECT_URI}&`)).toBe(true);
        const handoff = new URL(location);
        expect([...handoff.searchParams.keys()]).toEqual([
            "page",
            "transaction_id",
            "state",
            "completion_code",
        ]);
        expect(handoff.searchParams.get("state")).toBe(CLIENT_STATE);
        expect(location).not.toContain(ACCESS_TOKEN);
        expect(location).not.toContain("third_party_exchange_code");
        expect(location).not.toContain("listing_source_id");

        const [tokenCall] = backend.callsTo("/v1/oauth/token");
        const tokenBody = Object.fromEntries(tokenCall.body ?? []);
        expect(tokenBody).toMatchObject({
            grant_type: "authorization_code",
            code: "backend-code",
            redirect_uri: CALLBACK_URL,
            client_id: CLIENT_ID,
            client_secret: "broker-client-secret",
        });
        expect(await sha256Base64Url(tokenBody.code_verifier)).toBe(
            authorizeCall.url.searchParams.get("code_challenge"),
        );

        const completion = await complete({
            protocol_version: 2,
            transaction_id: body.transaction_id,
            completion_code: handoff.searchParams.get("completion_code") ?? "",
            completion_secret: COMPLETION_SECRET,
        });
        expect(completion.status).toBe(200);
        expect(completion.headers.get("Cache-Control")).toBe("no-store");
        expect(await completion.json()).toEqual({
            protocol_version: 2,
            outcome: "approved",
            transaction_id: body.transaction_id,
            client_state: CLIENT_STATE,
            listing_source_id: LISTING_SOURCE_ID,
            access_token: ACCESS_TOKEN,
            token_type: "Bearer",
            scope: "product-listings:write",
        });

        const replay = await complete({
            protocol_version: 2,
            transaction_id: body.transaction_id,
            completion_code: handoff.searchParams.get("completion_code") ?? "",
            completion_secret: COMPLETION_SECRET,
        });
        expect(replay.status).toBe(409);
        expect(await replay.json()).toEqual({
            protocol_version: 2,
            error: "transaction_consumed",
            retryable: false,
        });
    });

    it("finds a selected source on a later page of the user's grants", async () => {
        useBackend({
            sourcePages: [
                {
                    items: [{ id: OTHER_LISTING_SOURCE_ID, slug: "other", name: "Other" }],
                    next: "page-1",
                },
                { items: [{ id: LISTING_SOURCE_ID, slug: "shop-example", name: "Shop" }] },
            ],
        });

        const { handoff } = await runToHandoff();

        expect(handoff.searchParams.get("completion_code")).toMatch(/^[A-Za-z0-9_-]{43}$/);
        expect(backend.callsTo("/v1/me/listing-sources")).toHaveLength(2);
        expect(backend.callsTo("/v1/me/listing-sources")[0].url.searchParams.get("size")).toBe(
            "100",
        );
    });

    describe("initiator cannot collect without the merchant callback", () => {
        it("refuses completion with the handle and its own secret while the result is ready", async () => {
            const { transactionId } = await runToHandoff();

            const guessed = await complete({
                protocol_version: 2,
                transaction_id: transactionId,
                completion_code: "g".repeat(43),
                completion_secret: COMPLETION_SECRET,
            });
            expect(guessed.status).toBe(400);
            expect(await guessed.json()).toEqual({
                protocol_version: 2,
                error: "invalid_completion_code",
                retryable: false,
            });
        });

        it("never returns a completion code or credential from the consent read", async () => {
            const { transactionId } = await runToHandoff();

            const consent = await getWooCommerceBrokerConsent({
                request: new Request(
                    `${APP_ORIGIN}/api/oauth/broker/woocommerce/consent?transaction_id=${transactionId}`,
                ),
            });
            expect(await consent.json()).toEqual({ status: "answered" });
        });

        it("reports early completion as pending without consuming the transaction", async () => {
            const { body } = await initiate();

            const early = await complete({
                protocol_version: 2,
                transaction_id: body.transaction_id,
                completion_code: "g".repeat(43),
                completion_secret: COMPLETION_SECRET,
            });
            expect(early.status).toBe(409);
            expect(await early.json()).toEqual({
                protocol_version: 2,
                error: "transaction_pending",
                retryable: true,
            });
        });
    });

    describe("destination authority", () => {
        it.each([
            ["another host", "https://attacker.example/"],
            ["another port", "https://shop.example:8443/"],
            ["plain HTTP", "http://shop.example/"],
            ["a subdomain", "https://www.shop.example/"],
            ["a sibling site on the same origin", "https://shop.example/other-shop/"],
            ["a site below the WordPress install", "https://shop.example/shop/"],
            ["no registered website", undefined],
        ])("refuses approval when the source's registered website is %s", async (_, registered) => {
            useBackend({ registeredUrls: { "shop-example": registered } });
            const { body } = await initiate();

            const approval = await decide("approve", {
                lng: "en",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            });

            const location = new URL(approval.headers.get("Location") ?? "");
            expect(location.pathname).toBe("/en/oauth/authorize");
            expect(location.searchParams.get("broker_error")).toBe("recipient_not_registered");
            expect(backend.callsTo("/v1/oauth/authorize")).toHaveLength(0);
            expect(approval.headers.getSetCookie()).toEqual([]);
        });

        it.each([
            ["with a trailing slash", "https://host.example/store/"],
            ["without a trailing slash", "https://host.example/store"],
            ["with a query", "https://host.example/store/?utm=x"],
        ])("accepts a WordPress subdirectory registered %s", async (_, registered) => {
            useBackend({ registeredUrls: { "shop-example": registered } });
            const { body } = await initiate({
                merchant_redirect_uri:
                    "https://host.example/store/wp-admin/admin.php?page=aura-historia-partner-connect",
            });

            const approval = await decide("approve", {
                lng: "en",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            });

            expect(approval.headers.get("Location")).toMatch(new RegExp(`^${CALLBACK_URL}\\?`));
        });

        it("refuses another shop's subdirectory on a shared origin", async () => {
            useBackend({ registeredUrls: { "shop-example": "https://host.example/shop-a/" } });
            const { body } = await initiate({
                merchant_redirect_uri:
                    "https://host.example/shop-b/wp-admin/admin.php?page=aura-historia-partner-connect",
            });

            const approval = await decide("approve", {
                lng: "en",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            });

            expect(approval.headers.get("Location")).toContain(
                "broker_error=recipient_not_registered",
            );
        });

        it("refuses a source that is no longer granted", async () => {
            const { body } = await initiate();

            const approval = await decide("approve", {
                lng: "de",
                transaction_id: body.transaction_id,
                listing_source_id: OTHER_LISTING_SOURCE_ID,
            });

            expect(approval.headers.get("Location")).toContain("broker_error=source_unavailable");
            expect(backend.callsTo("/v1/oauth/authorize")).toHaveLength(0);
        });

        it("keeps the transaction open after a refused approval", async () => {
            useBackend({ registeredUrls: { "shop-example": "https://elsewhere.example/" } });
            const { body } = await initiate();
            await decide("approve", {
                lng: "en",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            });

            const consent = await getWooCommerceBrokerConsent({
                request: new Request(
                    `${APP_ORIGIN}/api/oauth/broker/woocommerce/consent?transaction_id=${body.transaction_id}`,
                ),
            });
            expect((await consent.json()).status).toBe("pending");
        });
    });

    describe("consent decisions", () => {
        it.each([
            ["cross-site", { "Sec-Fetch-Site": "cross-site" }],
            ["sibling subdomain", { "Sec-Fetch-Site": "same-site" }],
            ["origin-less", {}],
            ["foreign origin", { Origin: "https://attacker.example" }],
        ])("rejects a %s approval before reading the session", async (_, headers) => {
            const { body } = await initiate();

            const approval = await decide(
                "approve",
                {
                    lng: "en",
                    transaction_id: body.transaction_id,
                    listing_source_id: LISTING_SOURCE_ID,
                },
                headers,
            );

            expect(approval.status).toBe(403);
            expect(getServerAuthIdentity).not.toHaveBeenCalled();
        });

        it("sends a signed-out user to sign-in with only the transaction reference", async () => {
            getServerAuthIdentity.mockResolvedValue(undefined);
            const { body } = await initiate();

            const approval = await decide("approve", {
                lng: "fr",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            });

            const location = new URL(approval.headers.get("Location") ?? "");
            expect(location.pathname).toBe("/fr/login");
            expect(location.searchParams.get("redirect")).toBe(
                `/fr/oauth/authorize?transaction_id=${body.transaction_id}`,
            );
        });

        it("ignores injected protocol fields and rejects repeated ones", async () => {
            const { body } = await initiate();

            const injected = await postWooCommerceBrokerApprove({
                request: formRequest(
                    `${APP_ORIGIN}/api/oauth/broker/woocommerce/approve`,
                    [
                        ["lng", "en"],
                        ["transaction_id", body.transaction_id],
                        ["listing_source_id", LISTING_SOURCE_ID],
                        ["redirect_uri", "https://attacker.example/"],
                    ],
                    SAME_ORIGIN,
                ),
            });
            expect(injected.headers.get("Location")).toContain("broker_error=invalid_request");

            const repeated = await postWooCommerceBrokerApprove({
                request: formRequest(
                    `${APP_ORIGIN}/api/oauth/broker/woocommerce/approve`,
                    [
                        ["lng", "en"],
                        ["transaction_id", body.transaction_id],
                        ["listing_source_id", LISTING_SOURCE_ID],
                        ["listing_source_id", OTHER_LISTING_SOURCE_ID],
                    ],
                    SAME_ORIGIN,
                ),
            });
            expect(repeated.headers.get("Location")).toContain("broker_error=invalid_request");
            expect(backend.callsTo("/v1/oauth/authorize")).toHaveLength(0);
        });

        it("approves a transaction only once across parallel approvals", async () => {
            const { body } = await initiate();
            const fields = {
                lng: "en",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            };

            const responses = await Promise.all([
                decide("approve", fields),
                decide("approve", fields),
            ]);

            const toCallback = responses.filter((response) =>
                response.headers.get("Location")?.startsWith(CALLBACK_URL),
            );
            expect(toCallback).toHaveLength(1);
        });

        it("hands off a denial for a verified recipient without requesting a code", async () => {
            const { body } = await initiate();

            const denial = await decide("deny", {
                lng: "en",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            });

            const handoff = new URL(denial.headers.get("Location") ?? "");
            expect(handoff.origin).toBe("https://shop.example");
            expect(backend.callsTo("/v1/oauth/authorize")).toHaveLength(0);
            expect(backend.callsTo("/v1/oauth/token")).toHaveLength(0);

            const completion = await complete({
                protocol_version: 2,
                transaction_id: body.transaction_id,
                completion_code: handoff.searchParams.get("completion_code") ?? "",
                completion_secret: COMPLETION_SECRET,
            });
            expect(await completion.json()).toEqual({
                protocol_version: 2,
                outcome: "denied",
                transaction_id: body.transaction_id,
                client_state: CLIENT_STATE,
                error: "access_denied",
            });
        });

        it("keeps a denial on Aura Historia when the recipient is not verified", async () => {
            useBackend({ registeredUrls: { "shop-example": "https://attacker.example/" } });
            const { body } = await initiate();

            const denial = await decide("deny", {
                lng: "en",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            });

            const location = new URL(denial.headers.get("Location") ?? "");
            expect(location.origin).toBe(APP_ORIGIN);
            expect(location.pathname).toBe("/en/oauth/authorize");
            expect(location.searchParams.get("broker_error")).toBeNull();
        });

        it("returns a backend scope refusal to the verified recipient as a failure", async () => {
            useBackend({ authorize: () => jsonResponse({ error: "invalid_scope" }, 400) });
            const { body } = await initiate();

            const approval = await decide("approve", {
                lng: "en",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            });
            const handoff = new URL(approval.headers.get("Location") ?? "");
            expect(handoff.origin).toBe("https://shop.example");

            const completion = await complete({
                protocol_version: 2,
                transaction_id: body.transaction_id,
                completion_code: handoff.searchParams.get("completion_code") ?? "",
                completion_secret: COMPLETION_SECRET,
            });
            expect(await completion.json()).toMatchObject({
                outcome: "failed",
                error: "invalid_scope",
            });
        });

        it.each([
            ["another callback", `https://attacker.example/cb?code=c&state=STATE`],
            ["a changed state", `${CALLBACK_URL}?code=c&state=other`],
            ["a repeated code", `${CALLBACK_URL}?code=c&code=d&state=STATE`],
            ["an extra parameter", `${CALLBACK_URL}?code=c&state=STATE&listing_source_id=x`],
        ])("does not forward a backend redirect to %s", async (_, location) => {
            useBackend({
                authorize: (url) =>
                    new Response(null, {
                        status: 302,
                        headers: {
                            Location: location.replace(
                                "STATE",
                                encodeURIComponent(url.searchParams.get("state") ?? ""),
                            ),
                        },
                    }),
            });
            const { body } = await initiate();

            const approval = await decide("approve", {
                lng: "en",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            });

            expect(approval.headers.get("Location")).toContain("broker_error=approval_failed");
            expect(approval.headers.getSetCookie()).toEqual([]);
        });
    });

    describe("callback integrity", () => {
        async function approved() {
            const { body } = await initiate();
            const approval = await decide("approve", {
                lng: "en",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            });
            return {
                transactionId: body.transaction_id,
                location: new URL(approval.headers.get("Location") ?? ""),
                cookies: approval.headers.getSetCookie(),
            };
        }

        function expectConsentError(response: Response, error: string) {
            const location = new URL(response.headers.get("Location") ?? "");
            expect(location.origin).toBe(APP_ORIGIN);
            expect(location.searchParams.get("broker_error")).toBe(error);
            expect(backend.callsTo("/v1/oauth/token")).toHaveLength(0);
        }

        it("rejects legacy unsigned state without exchanging a code", async () => {
            const legacyState = Buffer.from(
                JSON.stringify({
                    redirect_uri: "https://attacker.example/",
                    code_verifier: "v".repeat(64),
                }),
            ).toString("base64url");

            const response = await callback(`${CALLBACK_URL}?code=c&state=${legacyState}`, []);

            expectConsentError(response, "invalid_request");
        });

        it.each([
            ["a missing state", (url: URL) => url.searchParams.delete("state")],
            [
                "a repeated state",
                (url: URL) => url.searchParams.append("state", url.searchParams.get("state") ?? ""),
            ],
            ["a missing code", (url: URL) => url.searchParams.delete("code")],
            ["an error parameter", (url: URL) => url.searchParams.set("error", "access_denied")],
        ])("rejects %s", async (_, change) => {
            const { location, cookies } = await approved();
            change(location);

            expectConsentError(await callback(location.toString(), cookies), "invalid_request");
        });

        it("rejects a callback on another route or host", async () => {
            const { location, cookies } = await approved();
            const elsewhere = new URL(location);
            elsewhere.host = "aura-historia.evil.example";

            expectConsentError(await callback(elsewhere.toString(), cookies), "invalid_request");
        });

        it("rejects a callback without the approving browser's binding", async () => {
            const { location } = await approved();

            expectConsentError(await callback(location.toString(), []), "session_mismatch");
        });

        it("keeps the approving browser's binding after a forged attempt", async () => {
            const { location, cookies } = await approved();
            const forged = new URL(location);
            forged.searchParams.set(
                "state",
                `${forged.searchParams.get("state")?.split(".")[0]}.${"f".repeat(43)}`,
            );

            const rejected = await callback(forged.toString(), cookies);
            expectConsentError(rejected, "session_mismatch");
            expect(rejected.headers.getSetCookie()).toEqual([]);

            const legitimate = await callback(location.toString(), cookies);
            expect(new URL(legitimate.headers.get("Location") ?? "").origin).toBe(
                "https://shop.example",
            );
        });

        it("rejects a callback in another account", async () => {
            const { location, cookies } = await approved();
            getServerAuthIdentity.mockResolvedValue({ accessToken: USER_JWT, userSub: "intruder" });

            expectConsentError(await callback(location.toString(), cookies), "session_mismatch");
        });

        it("rejects another transaction's binding cookie", async () => {
            const first = await approved();
            const second = await approved();
            const swapped = first.cookies[0].replace(first.transactionId, second.transactionId);

            expectConsentError(
                await callback(second.location.toString(), [swapped]),
                "session_mismatch",
            );
        });

        it("ignores injected verifier, source and destination parameters", async () => {
            const { location, cookies, transactionId } = await approved();
            location.searchParams.set("code_verifier", "i".repeat(43));
            location.searchParams.set("redirect_uri", "https://attacker.example/");
            location.searchParams.set("listing_source_id", OTHER_LISTING_SOURCE_ID);

            const response = await callback(location.toString(), cookies);
            const handoff = new URL(response.headers.get("Location") ?? "");
            expect(handoff.origin).toBe("https://shop.example");
            expect(
                Object.fromEntries(backend.callsTo("/v1/oauth/token")[0].body ?? []).code_verifier,
            ).not.toBe("i".repeat(43));

            const completion = await complete({
                protocol_version: 2,
                transaction_id: transactionId,
                completion_code: handoff.searchParams.get("completion_code") ?? "",
                completion_secret: COMPLETION_SECRET,
            });
            expect((await completion.json()).listing_source_id).toBe(LISTING_SOURCE_ID);
        });

        it("exchanges the code once for duplicate callbacks", async () => {
            const { location, cookies } = await approved();

            const [first, second] = await Promise.all([
                callback(location.toString(), cookies),
                callback(location.toString(), cookies),
            ]);

            expect(backend.callsTo("/v1/oauth/token")).toHaveLength(1);
            const origins = [first, second].map(
                (response) => new URL(response.headers.get("Location") ?? "").origin,
            );
            expect(origins.sort()).toEqual([APP_ORIGIN, "https://shop.example"].sort());
        });

        it("hands off a failed exchange and never retries it", async () => {
            useBackend({ token: () => jsonResponse({ error: "invalid_grant" }, 400) });
            const { handoff, transactionId } = await runToHandoff();

            const completion = await complete({
                protocol_version: 2,
                transaction_id: transactionId,
                completion_code: handoff.searchParams.get("completion_code") ?? "",
                completion_secret: COMPLETION_SECRET,
            });
            expect(await completion.json()).toMatchObject({
                outcome: "failed",
                error: "invalid_grant",
            });
        });

        it("rejects a malformed upstream token response", async () => {
            useBackend({ token: () => jsonResponse({ token_type: "Bearer", scope: "x" }) });
            const { handoff, transactionId } = await runToHandoff();

            const completion = await complete({
                protocol_version: 2,
                transaction_id: transactionId,
                completion_code: handoff.searchParams.get("completion_code") ?? "",
                completion_secret: COMPLETION_SECRET,
            });
            expect(await completion.json()).toMatchObject({
                outcome: "failed",
                error: "server_error",
            });
        });

        it("revokes a credential it cannot keep after the exchange", async () => {
            const { body } = await initiate();
            const approval = await decide("approve", {
                lng: "en",
                transaction_id: body.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            });
            const object = bindings.objects.get(body.transaction_id);
            vi.spyOn(object as NonNullable<typeof object>, "storeCredential").mockRejectedValue(
                new Error("storage restarted"),
            );

            const response = await callback(
                approval.headers.get("Location") ?? "",
                approval.headers.getSetCookie(),
            );

            expect(
                new URL(response.headers.get("Location") ?? "").searchParams.get("broker_error"),
            ).toBe("unavailable");
            const [revocation] = backend.callsTo("/v1/oauth/revoke");
            expect(revocation.body?.get("token")).toBe(ACCESS_TOKEN);
        });
    });

    it("never logs credentials, codes, states, secrets or addresses", async () => {
        const errorLog = vi.mocked(console.error);
        useBackend({
            token: () => jsonResponse({ error: "invalid_client" }, 401),
            revoke: () => jsonResponse({ error: "server_error" }, 500),
        });
        const failed = await runToHandoff();
        useBackend({ revoke: () => jsonResponse({ error: "server_error" }, 500) });
        const succeeded = await runToHandoff();
        await complete({
            protocol_version: 2,
            transaction_id: succeeded.transactionId,
            completion_code: "g".repeat(43),
            completion_secret: COMPLETION_SECRET,
        });

        const logged = JSON.stringify(errorLog.mock.calls);
        expect(errorLog).toHaveBeenCalled();
        for (const secret of [
            ACCESS_TOKEN,
            COMPLETION_SECRET,
            CLIENT_STATE,
            USER_JWT,
            "broker-client-secret",
            "backend-code",
            MERCHANT_REDIRECT_URI,
            "shop.example",
            failed.handoff.searchParams.get("completion_code") ?? "",
            succeeded.handoff.searchParams.get("completion_code") ?? "",
            new URL(succeeded.approval.headers.get("Location") ?? "").searchParams.get("state") ??
                "",
            succeeded.cookies[0].split(";")[0].split("=")[1],
        ]) {
            expect(logged).not.toContain(secret);
        }
    });

    describe("completion", () => {
        it.each([
            ["a missing field", { completion_secret: undefined }],
            ["a malformed code", { completion_code: "short" }],
            ["a malformed secret", { completion_secret: "has spaces in it ".repeat(4) }],
        ])("rejects %s as invalid_request", async (_, override) => {
            const fields: Record<string, unknown> = {
                protocol_version: 2,
                transaction_id: "t".repeat(43),
                completion_code: "c".repeat(43),
                completion_secret: COMPLETION_SECRET,
            };
            for (const [key, value] of Object.entries(override)) {
                if (value === undefined) delete fields[key];
                else fields[key] = value;
            }

            const response = await complete(fields);
            expect(response.status).toBe(400);
            expect((await response.json()).error).toBe("invalid_request");
        });

        it("rejects a repeated member", async () => {
            const response = await postWooCommerceBrokerComplete({
                request: jsonRequest(
                    COMPLETE_URL,
                    `{"protocol_version":2,"transaction_id":"${"t".repeat(43)}",` +
                        `"completion_code":"${"c".repeat(43)}","completion_code":"${"d".repeat(43)}",` +
                        `"completion_secret":"${COMPLETION_SECRET}"}`,
                ),
            });
            expect((await response.json()).error).toBe("invalid_request");
        });

        it.each([
            ["a protocol version as text", { protocol_version: "2" }],
            ["a numeric completion code", { completion_code: 1234 }],
            ["an unknown member", { listing_source_id: OTHER_LISTING_SOURCE_ID }],
        ])("rejects %s as invalid_request", async (_, override) => {
            const response = await complete({
                protocol_version: 2,
                transaction_id: "t".repeat(43),
                completion_code: "c".repeat(43),
                completion_secret: COMPLETION_SECRET,
                ...override,
            });
            expect(response.status).toBe(400);
            expect((await response.json()).error).toBe("invalid_request");
        });

        it("rejects a form-encoded completion", async () => {
            const response = await postWooCommerceBrokerComplete({
                request: formRequest(COMPLETE_URL, {
                    protocol_version: "2",
                    transaction_id: "t".repeat(43),
                    completion_code: "c".repeat(43),
                    completion_secret: COMPLETION_SECRET,
                }),
            });
            expect((await response.json()).error).toBe("invalid_request");
        });

        it("rejects another protocol version", async () => {
            const response = await complete({
                protocol_version: 1,
                transaction_id: "t".repeat(43),
                completion_code: "c".repeat(43),
                completion_secret: COMPLETION_SECRET,
            });
            expect((await response.json()).error).toBe("unsupported_protocol_version");
        });

        it("reports an unknown transaction without creating one", async () => {
            const response = await complete({
                protocol_version: 2,
                transaction_id: "t".repeat(43),
                completion_code: "c".repeat(43),
                completion_secret: COMPLETION_SECRET,
            });
            expect((await response.json()).error).toBe("invalid_transaction");
            expect(bindings.states.get("t".repeat(43))?.tableCount()).toBe(0);
        });

        it("cannot redeem one transaction's code on another", async () => {
            const first = await runToHandoff();
            const second = await runToHandoff();

            const response = await complete({
                protocol_version: 2,
                transaction_id: second.transactionId,
                completion_code: first.handoff.searchParams.get("completion_code") ?? "",
                completion_secret: COMPLETION_SECRET,
            });
            expect((await response.json()).error).toBe("invalid_completion_code");
        });

        it("rate-limits completion attempts per client address", async () => {
            bindings.limit.mockResolvedValue({ success: false });

            const response = await complete({
                protocol_version: 2,
                transaction_id: "t".repeat(43),
                completion_code: "c".repeat(43),
                completion_secret: COMPLETION_SECRET,
            });
            expect(response.status).toBe(429);
            expect(response.headers.get("Retry-After")).toBe("60");
            expect(await response.json()).toEqual({
                protocol_version: 2,
                error: "rate_limited",
                retryable: true,
            });
        });
    });
});
