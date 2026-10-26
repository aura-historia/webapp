import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultParseSearch } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postOAuthAuthorizeApprove } from "@/features/oauth/api/oauthAuthorizeApproveHandler.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { OAuthAuthorizePage } from "@/features/oauth/pages/OAuthAuthorizePage.tsx";
import { localizeHref } from "@/i18n/routing.ts";
import { Route as ConsentRoute } from "@/routes/$lng._auth.oauth.authorize.tsx";
import { Route as LoginRoute } from "@/routes/$lng.login.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

const mockGetServerAuthToken = vi.hoisted(() => vi.fn());
const mockFetch = vi.hoisted(() => vi.fn());
const mockUseOAuthListingSources = vi.hoisted(() => vi.fn());

const client = vi.hoisted(() => ({
    clientId: "oc_shopify_test",
    clientName: "Shop App",
    redirectUris: ["https://shop-app.example/oauth/callback"],
    scopes: ["product-listings:write" as const],
}));

vi.mock("@/lib/server/amplify.server.ts", () => ({
    getServerAuthToken: mockGetServerAuthToken,
}));

vi.mock("@/amplify-config", () => ({}));

vi.mock("@/features/oauth/hooks/useOAuthClient.ts", () => ({
    useOAuthClient: () => ({ data: client, isLoading: false, isError: false }),
}));

vi.mock("@/features/oauth/hooks/useOAuthListingSources.ts", () => ({
    useOAuthListingSources: mockUseOAuthListingSources,
}));

/** A Shopify-style request whose callback rejects a code without `listing_source_id`. */
const shopRequest: OAuthAuthorizeSearchParams = {
    response_type: "code",
    client_id: client.clientId,
    redirect_uri: "https://shop-app.example/oauth/callback",
    scope: "product-listings:write",
    state: "shop-state",
    code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    code_challenge_method: "S256",
    requires_listing_source_id: true,
};

const validateLoginSearch = LoginRoute.options.validateSearch as (
    search: Record<string, unknown>,
) => { redirect?: string };
const validateConsentSearch = ConsentRoute.options.validateSearch as (
    search: Record<string, unknown>,
) => OAuthAuthorizeSearchParams;

function getApproveButton(): HTMLElement {
    return screen.getByRole("button", { name: "Shop App den Zugriff auf Ihr Konto erlauben" });
}

/** Posts the rendered consent form the way the browser submits it. */
function submitApproval(): Promise<Response> {
    const form = getApproveButton().closest("form");
    if (!form) {
        throw new Error("Approve form not found");
    }

    return postOAuthAuthorizeApprove({
        request: new Request(new URL(form.getAttribute("action") ?? "", "https://auth.example"), {
            method: "POST",
            body: new FormData(form),
            headers: { Origin: "https://auth.example", "Sec-Fetch-Site": "same-origin" },
        }),
    });
}

/** Follows the login redirect to the consent request that sign-in returns to. */
function getRetriedRequest(loginResponse: Response): OAuthAuthorizeSearchParams {
    const loginUrl = new URL(loginResponse.headers.get("Location") ?? "");
    expect(loginUrl.pathname).toBe("/de/login");

    const { redirect } = validateLoginSearch(defaultParseSearch(loginUrl.search));
    const consentUrl = new URL(localizeHref(redirect ?? "", "de"), loginUrl.origin);
    expect(consentUrl.pathname).toBe("/de/oauth/authorize");

    return validateConsentSearch(defaultParseSearch(consentUrl.search));
}

describe("OAuth consent after session expiry", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", mockFetch);
        mockUseOAuthListingSources.mockImplementation((enabled: boolean) => ({
            sources: enabled
                ? [
                      { listingSourceId: "shop-1", name: "First Shop" },
                      { listingSourceId: "shop-2", name: "Second Shop" },
                  ]
                : [],
            isPending: false,
            isError: false,
            hasMore: false,
            canLoadMore: false,
            isLoadingMore: false,
            isLoadMoreError: false,
            loadMore: vi.fn(),
            retry: vi.fn(),
        }));
    });

    it("still requires a granted source selection on the login retry", async () => {
        const user = userEvent.setup();
        const consentPage = await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={shopRequest} />),
        );
        await user.click(screen.getByRole("radio", { name: /Second Shop/ }));

        mockGetServerAuthToken.mockResolvedValue(undefined);
        const loginResponse = await submitApproval();

        expect(loginResponse.status).toBe(302);
        expect(mockFetch).not.toHaveBeenCalled();
        const retriedRequest = getRetriedRequest(loginResponse);
        expect(retriedRequest).toEqual(shopRequest);

        // Another account may sign in, so the earlier choice is not carried over.
        consentPage.unmount();
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={retriedRequest} />),
        );
        expect(mockUseOAuthListingSources).toHaveBeenLastCalledWith(true);
        for (const radio of screen.getAllByRole("radio")) {
            expect(radio).not.toBeChecked();
        }
        expect(getApproveButton()).toBeDisabled();

        await user.click(screen.getByRole("radio", { name: /First Shop/ }));
        expect(getApproveButton()).toBeEnabled();

        mockGetServerAuthToken.mockResolvedValue("access-token");
        mockFetch.mockResolvedValue(
            new Response(null, {
                status: 302,
                headers: {
                    Location:
                        "https://shop-app.example/oauth/callback?code=auth-code&state=shop-state",
                },
            }),
        );
        const approval = await submitApproval();

        expect(approval.headers.get("Location")).toBe(
            "https://shop-app.example/oauth/callback?code=auth-code&state=shop-state&listing_source_id=shop-1",
        );
        const [backendUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
        expect(Object.fromEntries(new URL(backendUrl).searchParams)).toEqual({
            response_type: "code",
            client_id: shopRequest.client_id,
            redirect_uri: shopRequest.redirect_uri,
            scope: shopRequest.scope,
            state: shopRequest.state,
            code_challenge: shopRequest.code_challenge,
            code_challenge_method: "S256",
        });
    });
});
