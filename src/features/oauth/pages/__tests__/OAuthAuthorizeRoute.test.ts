import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route } from "../../../../routes/_auth.oauth.authorize.tsx";

const mockOAuthAuthorizePage = vi.hoisted(() =>
    vi.fn(({ searchParams }) =>
        createElement("div", { "data-testid": "oauth-authorize-page" }, searchParams.client_id),
    ),
);

vi.mock("@/features/oauth/components/OAuthAuthorizePage.tsx", () => ({
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

    it("renders the authorize page with route search params", () => {
        const searchParams = {
            response_type: "code",
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://client.example/callback",
            scope: "products:write",
            state: "csrf-token-xyz",
            code_challenge: "test-challenge",
            code_challenge_method: "S256",
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
