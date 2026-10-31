import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sha256Base64Url } from "@/features/oauth-client-broker/lib/brokerCrypto.ts";
import {
    BROKER_ENDPOINT_ERROR_STATUS,
    BROKER_RETRYABLE_ENDPOINT_ERRORS,
} from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import { postWooCommerceBrokerInitiate } from "@/features/oauth-client-broker/api/brokerInitiateHandler.ts";
import {
    postWooCommerceBrokerApprove,
    postWooCommerceBrokerDeny,
} from "@/features/oauth-client-broker/api/brokerConsentHandlers.ts";
import { getWooCommerceBrokerCallback } from "@/features/oauth-client-broker/api/brokerCallbackHandler.ts";
import { postWooCommerceBrokerComplete } from "@/features/oauth-client-broker/api/brokerCompleteHandler.ts";
import {
    APP_ORIGIN,
    COMPLETE_URL,
    createBackend,
    createBrokerEnv,
    formRequest,
    INITIATE_URL,
    installBrokerBindings,
    jsonRequest,
    jsonResponse,
    LISTING_SOURCE_ID,
    removeBrokerBindings,
    USER_JWT,
    USER_SUB,
} from "@/features/oauth-client-broker/__tests__/brokerTestHarness.ts";

const mockEnv = vi.hoisted(() => ({}) as Record<string, string | undefined>);
vi.mock("@/env.ts", () => ({ env: mockEnv }));

const getServerAuthIdentity = vi.hoisted(() => vi.fn());
vi.mock("@/lib/server/amplify.server.ts", () => ({ getServerAuthIdentity }));

const fixtures = JSON.parse(
    readFileSync(resolve(process.cwd(), "docs/fixtures/woocommerce-oauth-broker-v2.json"), "utf8"),
);
const initiateBody: Record<string, string | number> = fixtures.initiate.request.json;
const completionSecret: string = fixtures.complete.request.json.completion_secret;

function keysOf(value: Record<string, unknown>) {
    return Object.keys(value).sort();
}

/** Runs the fixture's initiation through consent and the callback to the merchant handoff. */
async function handoffFor(action: "approve" | "deny") {
    const initiation = await postWooCommerceBrokerInitiate({
        request: jsonRequest(INITIATE_URL, initiateBody, fixtures.initiate.request.headers),
    });
    const initiated = await initiation.json();
    const decision = await (action === "approve"
        ? postWooCommerceBrokerApprove
        : postWooCommerceBrokerDeny)({
        request: formRequest(
            `${APP_ORIGIN}/api/oauth/broker/woocommerce/${action}`,
            {
                lng: "en",
                transaction_id: initiated.transaction_id,
                listing_source_id: LISTING_SOURCE_ID,
            },
            { "Sec-Fetch-Site": "same-origin" },
        ),
    });
    const location =
        action === "deny"
            ? decision.headers.get("Location")
            : (
                  await getWooCommerceBrokerCallback({
                      request: new Request(decision.headers.get("Location") ?? "", {
                          headers: { Cookie: decision.headers.getSetCookie()[0].split(";")[0] },
                      }),
                  })
              ).headers.get("Location");
    return { initiation, initiated, handoff: new URL(location ?? "") };
}

async function completeWith(handoff: URL) {
    return postWooCommerceBrokerComplete({
        request: jsonRequest(
            COMPLETE_URL,
            {
                protocol_version: 2,
                transaction_id: handoff.searchParams.get("transaction_id") ?? "",
                completion_code: handoff.searchParams.get("completion_code") ?? "",
                completion_secret: completionSecret,
            },
            fixtures.complete.request.headers,
        ),
    });
}

describe("shared WooCommerce broker v2 fixtures", () => {
    beforeEach(() => {
        Object.assign(mockEnv, createBrokerEnv(), {
            OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_ID: initiateBody.client_id,
        });
        installBrokerBindings();
        getServerAuthIdentity.mockResolvedValue({ accessToken: USER_JWT, userSub: USER_SUB });
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        removeBrokerBindings();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("derives the completion challenge as BASE64URL(SHA256(ASCII(completion_secret)))", async () => {
        const example = fixtures.encoding.completion_challenge_example;
        expect(await sha256Base64Url(example.completion_secret)).toBe(example.completion_challenge);
        expect(initiateBody.completion_challenge).toBe(example.completion_challenge);
    });

    it("lists every endpoint error with its status and retryability", () => {
        expect(
            Object.fromEntries(
                fixtures.endpoint_errors.map(
                    (entry: { error: string; status: number; retryable: boolean }) => [
                        entry.error,
                        [entry.status, entry.retryable],
                    ],
                ),
            ),
        ).toEqual(
            Object.fromEntries(
                Object.entries(BROKER_ENDPOINT_ERROR_STATUS).map(([error, status]) => [
                    error,
                    [status, BROKER_RETRYABLE_ENDPOINT_ERRORS.has(error as never)],
                ]),
            ),
        );
    });

    it("matches the initiation, handoff and approved completion fixtures", async () => {
        const backend = createBackend({
            token: () =>
                jsonResponse({
                    access_token: "aurahistoria_example_access_token",
                    token_type: "Bearer",
                    scope: initiateBody.scope,
                }),
        });
        vi.stubGlobal("fetch", backend.fetchMock);

        const { initiation, initiated, handoff } = await handoffFor("approve");
        expect(initiation.status).toBe(fixtures.initiate.response.status);
        expect(keysOf(initiated)).toEqual(keysOf(fixtures.initiate.response.body));
        expect(initiated.authorization_url).toBe(
            fixtures.initiate.response.body.authorization_url.replace(
                fixtures.initiate.response.body.transaction_id,
                initiated.transaction_id,
            ),
        );

        const fixtureHandoff = new URL(fixtures.merchant_handoff.location);
        expect([...handoff.searchParams.keys()]).toEqual([...fixtureHandoff.searchParams.keys()]);
        expect(`${handoff.origin}${handoff.pathname}`).toBe(
            `${fixtureHandoff.origin}${fixtureHandoff.pathname}`,
        );
        for (const absent of fixtures.merchant_handoff.never_present) {
            expect(handoff.searchParams.has(absent)).toBe(false);
        }
        expect(handoff.searchParams.get("state")).toBe(initiateBody.client_state);

        const completion = await completeWith(handoff);
        const body = await completion.json();
        expect(completion.status).toBe(fixtures.complete.responses.approved.status);
        expect(body).toEqual({
            ...fixtures.complete.responses.approved.body,
            transaction_id: initiated.transaction_id,
        });
    });

    it("matches the denied and failed completion fixtures", async () => {
        vi.stubGlobal("fetch", createBackend().fetchMock);
        const denied = await handoffFor("deny");
        expect(keysOf(await (await completeWith(denied.handoff)).json())).toEqual(
            keysOf(fixtures.complete.responses.denied.body),
        );

        vi.stubGlobal(
            "fetch",
            createBackend({ token: () => jsonResponse({ error: "invalid_grant" }, 400) }).fetchMock,
        );
        const failed = await handoffFor("approve");
        const body = await (await completeWith(failed.handoff)).json();
        expect(body).toEqual({
            ...fixtures.complete.responses.failed.body,
            transaction_id: failed.initiated.transaction_id,
        });
    });

    it("answers a wrong proof with the fixture's error body", async () => {
        vi.stubGlobal("fetch", createBackend().fetchMock);
        const { handoff } = await handoffFor("approve");

        const response = await postWooCommerceBrokerComplete({
            request: jsonRequest(COMPLETE_URL, {
                protocol_version: 2,
                transaction_id: handoff.searchParams.get("transaction_id") ?? "",
                completion_code: handoff.searchParams.get("completion_code") ?? "",
                completion_secret: "x".repeat(43),
            }),
        });
        expect(await response.json()).toEqual(fixtures.endpoint_error_body_example);
    });
});
