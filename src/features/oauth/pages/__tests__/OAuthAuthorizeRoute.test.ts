import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/$lng._auth.oauth.authorize.tsx";

const mockOAuthAuthorizePage = vi.hoisted(() =>
    vi.fn(({ searchParams }) =>
        createElement("div", { "data-testid": "oauth-authorize-page" }, searchParams.client_id),
    ),
);

vi.mock("@/features/oauth/pages/OAuthAuthorizePage.tsx", () => ({
    OAuthAuthorizePage: mockOAuthAuthorizePage,
}));

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

    it("rejects legacy shop selection flags and unsupported PKCE methods", () => {
        const params = {
            client_id: "oc_test",
            redirect_uri: "https://client.example/callback",
            code_challenge: "challenge",
        };
        expect(() => validateSearch({ ...params, requires_partner_shop_id: true })).toThrow();
        expect(() => validateSearch({ ...params, code_challenge_method: "plain" })).toThrow();
    });

    it("requires canonical source selection for the WooCommerce broker even when the flag is omitted", () => {
        const result = validateSearch({
            client_id: "oc_test",
            redirect_uri: "https://auth.example/api/oauth/client/redirect-broker/woocommerce",
            code_challenge: "challenge",
        });
        expect(result.requires_listing_source_id).toBe(true);
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
            scope: "product-listings:write",
            state: "csrf-token-xyz",
            code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            code_challenge_method: "S256",
        };

        const result = validateSearch(searchWithOptionals);
        expect(result).toHaveProperty("scope", "product-listings:write");
        expect(result).toHaveProperty("state", "csrf-token-xyz");
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
            scope: "product-listings:write",
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
