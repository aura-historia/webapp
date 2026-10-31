import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    exchangeAuthorizationCode,
    findGrantedListingSource,
    getRegisteredListingSourceUrl,
    requestAuthorizationCode,
    revokeAccessToken,
} from "@/features/oauth-client-broker/server/brokerBackend.ts";
import {
    assertWorkerFetchOptions,
    CALLBACK_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    createBrokerEnv,
    jsonResponse,
    LISTING_SOURCE_ID,
    USER_JWT,
} from "@/features/oauth-client-broker/__tests__/brokerTestHarness.ts";

const mockEnv = vi.hoisted(() => ({}) as Record<string, string | undefined>);
vi.mock("@/env.ts", () => ({ env: mockEnv }));

const config = { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET, callbackUrl: CALLBACK_URL };
const fetchMock = vi.fn();

function authorize() {
    return requestAuthorizationCode({
        accessToken: USER_JWT,
        config,
        scope: "product-listings:write",
        resource: "https://api.aura-historia.com",
        state: "sent-state",
        codeChallenge: "challenge",
    });
}

function redirect(location: string) {
    return new Response(null, { status: 302, headers: { Location: location } });
}

function exchange() {
    return exchangeAuthorizationCode({
        code: "code",
        codeVerifier: "verifier",
        resource: "https://api.aura-historia.com",
        config,
        now: () => 1_000,
    });
}

describe("WooCommerce broker backend calls", () => {
    beforeEach(() => {
        Object.assign(mockEnv, createBrokerEnv());
        fetchMock.mockReset();
        // Requests the Worker runtime would refuse never reach the backend double.
        vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
            assertWorkerFetchOptions(input, init);
            return fetchMock(input, init);
        });
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("requestAuthorizationCode", () => {
        it("sends the stored request with the user's JWT and reads the code", async () => {
            fetchMock.mockResolvedValue(
                redirect(`${CALLBACK_URL}?code=abc&state=sent-state&iss=x`),
            );

            expect(await authorize()).toEqual({ ok: true, code: "abc" });
            const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
            expect(url.searchParams.get("resource")).toBe("https://api.aura-historia.com");
            expect(init).toMatchObject({
                headers: { Authorization: `Bearer ${USER_JWT}` },
                redirect: "manual",
                cache: "no-store",
            });
        });

        it.each([
            [
                jsonResponse({ error: "invalid_target" }, 400),
                { kind: "rejected", error: "invalid_target" },
            ],
            [
                jsonResponse({ error: "invalid_request" }, 400),
                { kind: "rejected", error: "server_error" },
            ],
            [jsonResponse({ status: 401 }, 401), { kind: "unauthenticated" }],
            [jsonResponse({ error: "temporarily_unavailable" }, 503), { kind: "unavailable" }],
            [
                redirect(`${CALLBACK_URL}?error=access_denied&state=sent-state`),
                { kind: "unavailable" },
            ],
            [
                redirect(`${CALLBACK_URL}?error=invalid_scope&state=sent-state`),
                { kind: "rejected", error: "invalid_scope" },
            ],
            [redirect(`${CALLBACK_URL}?state=sent-state`), { kind: "unavailable" }],
            [redirect(`${CALLBACK_URL}?code=abc&state=sent-state#frag`), { kind: "unavailable" }],
            [new Response(null, { status: 302 }), { kind: "unavailable" }],
        ])("maps %#", async (response, expected) => {
            fetchMock.mockResolvedValue(response);

            expect(await authorize()).toEqual({ ok: false, ...expected });
        });

        it.each([
            [new TypeError("network"), "network"],
            [new DOMException("The operation timed out.", "TimeoutError"), "timeout"],
        ])("reports a request without response as unavailable (%#)", async (error, status) => {
            fetchMock.mockRejectedValue(error);

            expect(await authorize()).toEqual({ ok: false, kind: "unavailable" });
            expect(console.error).toHaveBeenCalledWith("[OAuth broker] Backend request failed.", {
                operation: "authorize",
                status,
                error: "unrecognized",
            });
        });
    });

    describe("exchangeAuthorizationCode", () => {
        it("repeats the resource and keeps only the credential", async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({
                    access_token: "token",
                    token_type: "bearer",
                    scope: "product-listings:write",
                    expires_in: 60,
                    third_party_exchange_code: "01970f22-2bf0-7000-8000-000000000099",
                }),
            );

            expect(await exchange()).toEqual({
                ok: true,
                credential: {
                    accessToken: "token",
                    tokenType: "Bearer",
                    scope: "product-listings:write",
                    accessTokenExpiresAt: 61_000,
                },
            });
            const body = (fetchMock.mock.calls[0] as [URL, RequestInit])[1].body as URLSearchParams;
            expect(body.get("resource")).toBe("https://api.aura-historia.com");
            expect(body.get("redirect_uri")).toBe(CALLBACK_URL);
        });

        it("treats a null expiry as none", async () => {
            fetchMock.mockResolvedValue(
                jsonResponse({
                    access_token: "t",
                    token_type: "Bearer",
                    scope: "",
                    expires_in: null,
                }),
            );

            expect(await exchange()).toEqual({
                ok: true,
                credential: { accessToken: "t", tokenType: "Bearer", scope: "" },
            });
        });

        it.each([
            [jsonResponse({ error: "invalid_client" }, 401), "server_error"],
            [jsonResponse({ error: "invalid_client" }, 400), "server_error"],
            [jsonResponse({ error: "invalid_grant" }, 400), "invalid_grant"],
            [jsonResponse({ error: "invalid_target" }, 400), "invalid_target"],
            [jsonResponse({}, 503), "temporarily_unavailable"],
            [jsonResponse({}, 500), "server_error"],
            [new Response("not json", { status: 200 }), "server_error"],
            [jsonResponse({ access_token: "t", token_type: "MAC", scope: "x" }), "server_error"],
            [jsonResponse({ access_token: "", token_type: "Bearer", scope: "x" }), "server_error"],
            [jsonResponse({ access_token: "t", token_type: "Bearer" }), "server_error"],
            [
                jsonResponse({
                    access_token: "t",
                    token_type: "Bearer",
                    scope: "x",
                    expires_in: -1,
                }),
                "server_error",
            ],
            [
                jsonResponse({
                    access_token: "t",
                    token_type: "Bearer",
                    scope: "x",
                    expires_in: "60",
                }),
                "server_error",
            ],
            [jsonResponse(["token"]), "server_error"],
        ])("maps failure %# without exposing the response", async (response, error) => {
            fetchMock.mockResolvedValue(response);

            expect(await exchange()).toEqual({ ok: false, error });
        });

        it("reports a network failure as temporarily unavailable", async () => {
            fetchMock.mockRejectedValue(new TypeError("network"));

            expect(await exchange()).toEqual({ ok: false, error: "temporarily_unavailable" });
        });
    });

    describe("revokeAccessToken", () => {
        it.each([
            [new Response(null, { status: 200 }), true],
            [jsonResponse({ error: "access_denied" }, 403), true],
            [jsonResponse({ error: "server_error" }, 500), false],
            [jsonResponse({ error: "invalid_client" }, 401), false],
        ])("treats %# as done = %s", async (response, done) => {
            fetchMock.mockResolvedValue(response);

            expect(await revokeAccessToken("token", config)).toBe(done);
            const body = (fetchMock.mock.calls[0] as [URL, RequestInit])[1].body as URLSearchParams;
            expect(Object.fromEntries(body)).toEqual({
                token: "token",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            });
        });

        it("retries later after a network failure", async () => {
            fetchMock.mockRejectedValue(new TypeError("network"));

            expect(await revokeAccessToken("token", config)).toBe(false);
        });
    });

    describe("listing source checks", () => {
        function findGrant() {
            return findGrantedListingSource({
                accessToken: USER_JWT,
                listingSourceId: LISTING_SOURCE_ID,
            });
        }

        function readRegisteredUrl() {
            return getRegisteredListingSourceUrl({
                accessToken: USER_JWT,
                listingSourceSlugId: "shop-example",
            });
        }

        function expectLogged(operation: string, status: number | string) {
            expect(console.error).toHaveBeenCalledWith("[OAuth broker] Backend request failed.", {
                operation,
                status,
                error: "unrecognized",
            });
        }

        it("reads grants and the registered website as the Worker runtime allows", async () => {
            fetchMock.mockImplementation(async (input: Request) =>
                input.url.includes("/v1/me/listing-sources")
                    ? jsonResponse({
                          items: [
                              {
                                  listingSourceId: LISTING_SOURCE_ID,
                                  listingSourceSlugId: "shop-example",
                                  name: "Shop Example",
                              },
                          ],
                      })
                    : jsonResponse({
                          listingSourceId: LISTING_SOURCE_ID,
                          listingSourceSlugId: "shop-example",
                          name: "Shop Example",
                          operator: { name: "Operator" },
                          url: "https://shop.example:8443/",
                      }),
            );

            expect(await findGrant()).toMatchObject({
                ok: true,
                source: { listingSourceId: LISTING_SOURCE_ID },
            });
            expect(await readRegisteredUrl()).toEqual({
                ok: true,
                url: "https://shop.example:8443/",
            });
            for (const [request] of fetchMock.mock.calls as [Request][]) {
                expect(request.redirect).toBe("manual");
                expect(request.cache).toBe("no-store");
                expect(request.headers.get("Authorization")).toBe(`Bearer ${USER_JWT}`);
            }
            expect(console.error).not.toHaveBeenCalled();
        });

        it.each([
            [jsonResponse({ status: 401 }, 401), "unauthenticated"],
            [jsonResponse({ status: 500 }, 500), "unavailable"],
        ])("maps a grant read failure %#", async (response, kind) => {
            fetchMock.mockResolvedValue(response);

            expect(await findGrant()).toEqual({ ok: false, kind });
        });

        it("treats a redirect as a failure instead of following it", async () => {
            fetchMock.mockImplementation(
                async () =>
                    new Response(null, {
                        status: 302,
                        headers: { Location: "https://elsewhere.example/" },
                    }),
            );

            expect(await findGrant()).toEqual({ ok: false, kind: "unavailable" });
            expectLogged("listing_sources", 302);
            expect(await readRegisteredUrl()).toEqual({ ok: false });
            expectLogged("listing_source", 302);
            expect(fetchMock).toHaveBeenCalledTimes(2);
        });

        it.each([
            [new TypeError("network"), "network"],
            [new DOMException("The operation timed out.", "TimeoutError"), "timeout"],
        ])("logs a request without response by its kind (%#)", async (error, status) => {
            fetchMock.mockRejectedValue(error);

            expect(await findGrant()).toEqual({ ok: false, kind: "unavailable" });
            expectLogged("listing_sources", status);
            expect(await readRegisteredUrl()).toEqual({ ok: false });
            expectLogged("listing_source", status);
        });

        it("reports an unexpected response body as unavailable", async () => {
            fetchMock.mockImplementation(async () => jsonResponse({ unexpected: true }));

            expect(await findGrant()).toEqual({ ok: false, kind: "unavailable" });
            expectLogged("listing_sources", "invalid_response");
            expect(await readRegisteredUrl()).toEqual({ ok: false });
            expectLogged("listing_source", "invalid_response");
        });

        it("stops after the page limit instead of reading without end", async () => {
            fetchMock.mockImplementation(async () => jsonResponse({ items: [], next: "more" }));

            expect(await findGrant()).toEqual({ ok: false, kind: "unavailable" });
            expect(fetchMock).toHaveBeenCalledTimes(50);
            expectLogged("listing_sources", "page_limit");
        });

        it("reports an unreadable registered website as a failure", async () => {
            fetchMock.mockResolvedValue(jsonResponse({ status: 404 }, 404));

            expect(await readRegisteredUrl()).toEqual({ ok: false });
            expectLogged("listing_source", 404);
        });
    });
});
