import { defaultParseSearch, defaultStringifySearch } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_SCOPES } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import {
    createFederatedAuthState,
    parseFederatedAuthState,
} from "@/features/authentication/lib/federatedAuthState.ts";
import { oauthAuthorizeSearchSchema } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { localizeHref } from "@/i18n/routing.ts";
import { Route as AuthRoute } from "@/routes/$lng._auth.tsx";
import { Route as LoginRoute } from "@/routes/$lng.login.tsx";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify/auth", () => ({
    getCurrentUser: mockGetCurrentUser,
}));

vi.mock("@/lib/server/amplify.ts", () => ({
    getServerUser: vi.fn().mockResolvedValue({ user: null, authenticated: false }),
}));

vi.mock("@/amplify-config", () => ({}));

/** An MCP request with every scope and a state that needs URL encoding. */
const mcpRequest = {
    response_type: "code",
    client_id: "oc_7b0gwc1x49e0mvbt3tfexfqgb5",
    redirect_uri: "https://claude.ai/api/mcp/auth_callback",
    scope: ACCESS_TOKEN_SCOPES.join(" "),
    state: `${"aB3-_~.".repeat(60)}+/= &%`,
    resource: "https://mcp.aura-historia.com/v1",
    code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    code_challenge_method: "S256",
};

/**
 * A metadata document client (an MCP agent) with a loopback callback on an ephemeral port, every
 * ordinary-user scope and `offline_access`.
 */
const agentRequest = {
    response_type: "code",
    client_id: "https://claude.ai/oauth/claude-code-client-metadata",
    redirect_uri: "http://localhost:53682/callback",
    scope: [
        "users:read",
        "users:write",
        "search-filters:read",
        "search-filters:write",
        "watchlist:read",
        "watchlist:write",
        "notifications:read",
        "notifications:write",
        "offline_access",
    ].join(" "),
    state: "q2Jv7Wl3N1m8b0bTt0lpbq3c7S8Dzvq7m3x8W4cnD8I",
    resource: "https://mcp.aura-historia.com/v1",
    code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    code_challenge_method: "S256",
};

const REQUESTS = [
    ["a registered MCP client", mcpRequest],
    ["a metadata document client", agentRequest],
] as const;

/** The login destination the `_auth` guard derives from the router's parsed location. */
async function getLoginRedirect(authorizeHref: string): Promise<string> {
    const url = new URL(authorizeHref, "https://aura-historia.com");
    const location = {
        href: `${url.pathname}${defaultStringifySearch(defaultParseSearch(url.search))}`,
    };
    const beforeLoad = AuthRoute.options.beforeLoad as unknown as (ctx: {
        location: typeof location;
        params: { lng: string };
    }) => Promise<unknown>;

    const thrown = await beforeLoad({ location, params: { lng: "en" } }).catch(
        (error: unknown) => error,
    );
    const { search } = (thrown as { options: { search: { redirect: string } } }).options;
    const validateLoginSearch = LoginRoute.options.validateSearch as (
        search: Record<string, unknown>,
    ) => { redirect?: string };
    // The redirect travels as a login search parameter before the login route reads it.
    const loginSearch = defaultParseSearch(defaultStringifySearch(search));

    return validateLoginSearch(loginSearch).redirect ?? "";
}

/** Parses the destination the way the consent route receives it. */
function parseConsentRequest(href: string) {
    const url = new URL(href, "https://aura-historia.com");
    return {
        pathname: url.pathname,
        request: oauthAuthorizeSearchSchema.parse(defaultParseSearch(url.search)),
    };
}

describe("OAuth login return", () => {
    beforeEach(() => {
        mockGetCurrentUser.mockRejectedValue(new Error("signed out"));
    });

    it.each(REQUESTS)(
        "reconstructs the exact request of %s after password, existing-session and federated sign-in",
        async (_, oauthRequest) => {
            const authorizeHref = `/en/oauth/authorize?${new URLSearchParams(oauthRequest)}`;
            const redirect = await getLoginRedirect(authorizeHref);

            const federatedState = parseFederatedAuthState(
                createFederatedAuthState({
                    intent: "sign-in",
                    locale: "en",
                    redirectPath: redirect,
                }),
            );
            const returns = {
                // Password sign-in and an already signed-in visit both continue to the login redirect.
                login: localizeHref(redirect, "en"),
                federated: localizeHref(
                    federatedState?.redirectPath ?? "/",
                    federatedState?.locale ?? "",
                ),
            };

            for (const href of Object.values(returns)) {
                expect(parseConsentRequest(href)).toEqual({
                    pathname: "/en/oauth/authorize",
                    request: { ...oauthRequest, requires_listing_source_id: false },
                });
            }
        },
    );

    it.each(REQUESTS)(
        "keeps every OAuth parameter of %s when the user switches locale before signing in",
        async (_, oauthRequest) => {
            const redirect = await getLoginRedirect(
                `/en/oauth/authorize?${new URLSearchParams(oauthRequest)}`,
            );

            expect(parseConsentRequest(localizeHref(redirect, "fr"))).toEqual({
                pathname: "/fr/oauth/authorize",
                request: { ...oauthRequest, requires_listing_source_id: false },
            });
        },
    );

    it("keeps a metadata document client's request when the signed-in user switches locale on consent", () => {
        const consentHref = `/en/oauth/authorize?${new URLSearchParams(agentRequest)}`;

        for (const language of ["de", "es", "fr", "it"]) {
            expect(parseConsentRequest(localizeHref(consentHref, language))).toEqual({
                pathname: `/${language}/oauth/authorize`,
                request: { ...agentRequest, requires_listing_source_id: false },
            });
        }
    });

    it("keeps a numeric state exact through the router's parsed location", async () => {
        const request = { ...mcpRequest, state: "1234567890" };
        const redirect = await getLoginRedirect(
            `/en/oauth/authorize?${new URLSearchParams(request)}`,
        );

        expect(parseConsentRequest(localizeHref(redirect, "de")).request.state).toBe("1234567890");
    });
});
