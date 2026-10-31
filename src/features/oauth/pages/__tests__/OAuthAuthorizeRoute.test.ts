import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    defaultParseSearch,
} from "@tanstack/react-router";
import { Route } from "@/routes/$lng._auth.oauth.authorize.tsx";
import {
    getBrokerAuthorizationUrl,
    getWooCommerceBrokerCallbackUrl,
} from "@/features/oauth-client-broker/lib/brokerUrls.ts";

const mockOAuthAuthorizePage = vi.hoisted(() =>
    vi.fn(({ searchParams }) =>
        createElement("div", { "data-testid": "oauth-authorize-page" }, searchParams.client_id),
    ),
);

vi.mock("@/env.ts", () => ({
    env: {
        VITE_APP_URL: "https://aura-historia.com",
        VITE_API_URL: "https://api.aura-historia.com",
        VITE_FEATURE_LOGIN_ENABLED: true,
        VITE_FEATURE_SEARCH_ENABLED: true,
    },
}));

vi.mock("@/features/oauth/pages/OAuthAuthorizePage.tsx", () => ({
    OAuthAuthorizePage: mockOAuthAuthorizePage,
}));

const mockBrokerConsentPage = vi.hoisted(() =>
    vi.fn(() => createElement("div", { "data-testid": "broker-consent-page" })),
);

vi.mock("@/features/oauth-client-broker/pages/WooCommerceBrokerConsentPage.tsx", () => ({
    WooCommerceBrokerConsentPage: mockBrokerConsentPage,
}));

/**
 * What `Route.useSearch()` returns for a URL: the search of the route's match in a real router
 * with the same parents, which merges the raw query into the validated search.
 */
function routerSearchFor(href: string): Record<string, unknown> {
    const rootRoute = createRootRoute();
    const lngRoute = createRoute({ getParentRoute: () => rootRoute, path: "$lng" });
    const authRoute = createRoute({ getParentRoute: () => lngRoute, id: "_auth" });
    const authorizeRoute = createRoute({
        getParentRoute: () => authRoute,
        path: "oauth/authorize",
        validateSearch: Route.options.validateSearch as (
            search: Record<string, unknown>,
        ) => Record<string, unknown>,
    });
    const router = createRouter({
        routeTree: rootRoute.addChildren([
            lngRoute.addChildren([authRoute.addChildren([authorizeRoute])]),
        ]),
        history: createMemoryHistory({ initialEntries: [href] }),
    });
    const match = router.matchRoutes(router.latestLocation).at(-1);
    expect(match?.routeId).toBe("/$lng/_auth/oauth/authorize");
    expect(match?.searchError).toBeUndefined();
    return match?.search as Record<string, unknown>;
}

function renderRouteWithSearch(search: Record<string, unknown>) {
    vi.spyOn(Route, "useSearch").mockReturnValue(search as never);
    const Component = Route.options.component;
    if (!Component) {
        throw new Error("Authorize route component not found");
    }
    render(createElement(Component));
}

const validateSearch = Route.options.validateSearch as (
    search: Record<string, unknown>,
) => Record<string, unknown>;

describe("_auth.oauth.authorize route", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("adds noindex robots meta tag", () => {
        const head = Route.options.head;
        expect(head).toBeDefined();
        const context = {} as Parameters<NonNullable<typeof head>>[0];
        expect(head?.(context)).toEqual({
            meta: [{ name: "robots", content: "noindex, nofollow" }],
        });
    });

    it("has SSR disabled", () => {
        expect(Route.options.ssr).toBe(false);
    });

    it("does not infer source selection from an external broker-like pathname", () => {
        const params = {
            client_id: "oc_test",
            redirect_uri: "https://external.example/api/oauth/client/redirect-broker/woocommerce",
            code_challenge: "challenge",
        };
        expect(validateSearch(params).requires_listing_source_id).toBe(false);
        expect(
            validateSearch({ ...params, requires_listing_source_id: true })
                .requires_listing_source_id,
        ).toBe(true);
    });

    it("validates search params with required fields", () => {
        expect(validateSearch).toBeDefined();

        const validSearch = {
            response_type: "code",
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://client.example/callback",
            code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            code_challenge_method: "S256",
        };

        const result = validateSearch(validSearch);
        expect(result).toEqual(
            expect.objectContaining({
                response_type: "code",
                client_id: "01970f22-2bf0-7000-8000-000000000010",
                redirect_uri: "https://client.example/callback",
                code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
                code_challenge_method: "S256",
                requires_listing_source_id: false,
            }),
        );
    });

    it("validates search params with optional scope and state", () => {
        const searchWithOptionals = {
            response_type: "code",
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://client.example/callback",
            scope: "products:write",
            state: "csrf-token-xyz",
            code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            code_challenge_method: "S256",
        };

        const result = validateSearch(searchWithOptionals);
        expect(result).toHaveProperty("scope", "products:write");
        expect(result).toHaveProperty("state", "csrf-token-xyz");
    });

    it("keeps the MCP resource indicator and requested scopes exactly as sent", () => {
        const result = validateSearch({
            client_id: "oc_7b0gwc1x49e0mvbt3tfexfqgb5",
            redirect_uri: "https://claude.ai/api/mcp/auth_callback",
            scope: "watchlist:read watchlist:write",
            state: "mcp-state",
            resource: "https://mcp.aura-historia.com/v1",
            code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            code_challenge_method: "S256",
        });

        expect(result).toEqual({
            response_type: "code",
            client_id: "oc_7b0gwc1x49e0mvbt3tfexfqgb5",
            redirect_uri: "https://claude.ai/api/mcp/auth_callback",
            scope: "watchlist:read watchlist:write",
            state: "mcp-state",
            resource: "https://mcp.aura-historia.com/v1",
            code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            code_challenge_method: "S256",
            requires_listing_source_id: false,
        });
    });

    it("restores protocol values the router parsed as numbers, booleans or null", () => {
        const search = defaultParseSearch(
            "?client_id=1234&redirect_uri=https%3A%2F%2Fclient.example%2Fcallback" +
                "&code_challenge=challenge&state=0042&scope=null&resource=true",
        );
        expect(search).toMatchObject({ client_id: 1234, scope: null, resource: true });

        expect(validateSearch(search)).toMatchObject({
            client_id: "1234",
            state: "0042",
            scope: "null",
            resource: "true",
        });
        expect(validateSearch({ ...search, state: 987654321 })).toHaveProperty(
            "state",
            "987654321",
        );
    });

    it("rejects a repeated protocol parameter", () => {
        expect(() =>
            validateSearch(
                defaultParseSearch(
                    "?client_id=oc_test&redirect_uri=https%3A%2F%2Fclient.example%2Fcallback" +
                        "&code_challenge=challenge&state=first&state=second",
                ),
            ),
        ).toThrow();
    });

    it("reads a WooCommerce broker transaction from its reference alone", () => {
        expect(
            validateSearch({ transaction_id: "q2Jv7Wl3N1m8b0bTt0lpbq3c7S8Dzvq7m3x8W4cnD8I" }),
        ).toEqual({ transaction_id: "q2Jv7Wl3N1m8b0bTt0lpbq3c7S8Dzvq7m3x8W4cnD8I" });
        expect(
            validateSearch({
                transaction_id: "q2Jv7Wl3N1m8b0bTt0lpbq3c7S8Dzvq7m3x8W4cnD8I",
                broker_error: "recipient_not_registered",
            }),
        ).toHaveProperty("broker_error", "recipient_not_registered");
        expect(validateSearch({ broker_error: "made_up" })).toEqual({});
    });

    describe("WooCommerce broker entry", () => {
        const TRANSACTION_ID = "q2Jv7Wl3N1m8b0bTt0lpbq3c7S8Dzvq7m3x8W4cnD8I";

        beforeEach(() => {
            mockOAuthAuthorizePage.mockClear();
            mockBrokerConsentPage.mockClear();
        });
        const entry = {
            client_id: "oc_01m5vyvraxecksre2zepjcza88",
            redirect_uri: getWooCommerceBrokerCallbackUrl(),
            response_type: "code",
            scope: "product-listings:read product-listings:write",
            state: TRANSACTION_ID,
        };

        it("reads the transaction from the authorization URL initiation returns", () => {
            const url = new URL(
                getBrokerAuthorizationUrl({
                    transactionId: TRANSACTION_ID,
                    clientId: entry.client_id,
                    scope: entry.scope,
                }),
            );

            expect(validateSearch(defaultParseSearch(url.search))).toEqual({
                transaction_id: TRANSACTION_ID,
            });
        });

        it("renders the broker consent for the entry, although the router keeps client_id", () => {
            const url = new URL(
                getBrokerAuthorizationUrl({
                    transactionId: TRANSACTION_ID,
                    clientId: entry.client_id,
                    scope: entry.scope,
                }),
            );
            const search = routerSearchFor(`/en${url.pathname}${url.search}`);
            expect(search).toMatchObject({ client_id: entry.client_id, state: TRANSACTION_ID });

            renderRouteWithSearch(search);

            expect(screen.getByTestId("broker-consent-page")).toBeInTheDocument();
            expect(mockBrokerConsentPage).toHaveBeenCalledWith(
                { searchParams: { transaction_id: TRANSACTION_ID } },
                undefined,
            );
            expect(mockOAuthAuthorizePage).not.toHaveBeenCalled();
        });

        it("renders the broker consent for a reference-only page", () => {
            renderRouteWithSearch(
                routerSearchFor(
                    `/en/oauth/authorize?transaction_id=${TRANSACTION_ID}&broker_error=approval_failed`,
                ),
            );

            expect(mockBrokerConsentPage).toHaveBeenCalledWith(
                {
                    searchParams: {
                        transaction_id: TRANSACTION_ID,
                        broker_error: "approval_failed",
                    },
                },
                undefined,
            );
        });

        it("renders the OAuth page for a direct request for the broker callback", () => {
            const search = new URLSearchParams({
                ...entry,
                state: "legacy-state",
                code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            });

            renderRouteWithSearch(routerSearchFor(`/en/oauth/authorize?${search}`));

            expect(screen.getByTestId("oauth-authorize-page")).toBeInTheDocument();
            expect(mockBrokerConsentPage).not.toHaveBeenCalled();
        });

        it("reads the entry the router returns to after sign-in, with the reference merged in", () => {
            // The `_auth` guard's redirect carries the location with the validated search merged.
            const returned = new URL(
                `${getBrokerAuthorizationUrl({
                    transactionId: TRANSACTION_ID,
                    clientId: entry.client_id,
                    scope: entry.scope,
                })}&transaction_id=${TRANSACTION_ID}`,
            );

            expect(validateSearch(defaultParseSearch(returned.search))).toEqual({
                transaction_id: TRANSACTION_ID,
            });
        });

        it.each([
            ["an added parameter", { ...entry, requires_listing_source_id: "true" }],
            [
                "another merged transaction",
                { ...entry, transaction_id: "x2Jv7Wl3N1m8b0bTt0lpbq3c7S8Dzvq7m3x8W4cnD8I" },
            ],
            ["a resource", { ...entry, resource: "https://mcp.aura-historia.com/v1" }],
            ["a missing scope", { ...entry, scope: undefined }],
            ["another callback", { ...entry, redirect_uri: "https://shop.example/callback" }],
            [
                "the callback on another origin",
                {
                    ...entry,
                    redirect_uri:
                        "https://attacker.example/api/oauth/client/redirect-broker/woocommerce",
                },
            ],
            ["another response type", { ...entry, response_type: "token" }],
            ["a state that is no transaction reference", { ...entry, state: "merchant-state" }],
            [
                "a readable legacy state",
                { ...entry, state: btoa(JSON.stringify({ redirect_uri: "https://x.example" })) },
            ],
        ])("does not read a request with %s as a broker entry", (_, search) => {
            const params = Object.fromEntries(
                Object.entries(search).filter(([, value]) => value !== undefined),
            );

            // Any other shape is a direct OAuth request, which requires a PKCE challenge.
            expect(() => validateSearch(params)).toThrow();
        });

        it("keeps a direct request for the broker callback an OAuth request", () => {
            expect(
                validateSearch({ ...entry, code_challenge: "challenge", state: "legacy" }),
            ).toMatchObject({ client_id: entry.client_id, redirect_uri: entry.redirect_uri });
        });
    });

    it("treats a request with client_id as OAuth even if it names a transaction", () => {
        expect(() =>
            validateSearch({
                client_id: "oc_test",
                transaction_id: "q2Jv7Wl3N1m8b0bTt0lpbq3c7S8Dzvq7m3x8W4cnD8I",
            }),
        ).toThrow();
    });

    it("throws when required client_id is missing", () => {
        expect(() =>
            validateSearch({
                response_type: "code",
                redirect_uri: "https://client.example/callback",
                code_challenge: "test",
                code_challenge_method: "S256",
            }),
        ).toThrow();
    });

    it("throws when required redirect_uri is missing", () => {
        expect(() =>
            validateSearch({
                response_type: "code",
                client_id: "01970f22-2bf0-7000-8000-000000000010",
                code_challenge: "test",
                code_challenge_method: "S256",
            }),
        ).toThrow();
    });

    it("throws when required code_challenge is missing", () => {
        expect(() =>
            validateSearch({
                response_type: "code",
                client_id: "01970f22-2bf0-7000-8000-000000000010",
                redirect_uri: "https://client.example/callback",
                code_challenge_method: "S256",
            }),
        ).toThrow();
    });

    it("defaults response_type to 'code' when not provided", () => {
        const result = validateSearch({
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://client.example/callback",
            code_challenge: "test-challenge",
            code_challenge_method: "S256",
        });

        expect(result).toHaveProperty("response_type", "code");
    });

    it("defaults code_challenge_method to 'S256' when not provided", () => {
        const result = validateSearch({
            response_type: "code",
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://client.example/callback",
            code_challenge: "test-challenge",
        });

        expect(result).toHaveProperty("code_challenge_method", "S256");
    });

    it("defaults requires_listing_source_id to false when not provided", () => {
        const result = validateSearch({
            response_type: "code",
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://client.example/callback",
            code_challenge: "test-challenge",
            code_challenge_method: "S256",
        });

        expect(result).toHaveProperty("requires_listing_source_id", false);
    });

    it("parses requires_listing_source_id from the route search", () => {
        const result = validateSearch({
            response_type: "code",
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://client.example/callback",
            code_challenge: "test-challenge",
            code_challenge_method: "S256",
            requires_listing_source_id: "true",
        });

        expect(result).toHaveProperty("requires_listing_source_id", true);
    });

    it("renders the authorize page with route search params", () => {
        const searchParams = {
            response_type: "code",
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://client.example/callback",
            scope: "products:write",
            state: "csrf-token-xyz",
            code_challenge: "test-challenge",
            code_challenge_method: "S256",
            requires_listing_source_id: false,
        };
        vi.spyOn(Route, "useSearch").mockReturnValue(searchParams);

        const Component = Route.options.component;
        if (!Component) {
            throw new Error("Authorize route component not found");
        }

        render(createElement(Component));

        expect(screen.getByTestId("oauth-authorize-page")).toHaveTextContent(
            searchParams.client_id,
        );
        expect(mockOAuthAuthorizePage).toHaveBeenCalledWith({ searchParams }, undefined);
    });
});
