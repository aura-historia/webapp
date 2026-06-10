import { describe, expect, it } from "vitest";
import {
    decodeOAuthClientBrokerState,
    encodeOAuthClientBrokerState,
    setOAuthErrorOnRedirectUri,
    setThirdPartyExchangeCodeOnRedirectUri,
} from "../oauthClientBrokerState.ts";

const codeVerifier = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";

describe("oauthClientBrokerState", () => {
    it("encodes and decodes broker state as base64url JSON", () => {
        const encodedState = encodeOAuthClientBrokerState({
            redirectUri: "https://merchant.example/wp-admin/admin.php?page=aura",
            codeVerifier,
            clientState: "merchant-csrf-state",
        });

        expect(encodedState).not.toContain("+");
        expect(encodedState).not.toContain("/");
        expect(encodedState).not.toContain("=");
        expect(decodeOAuthClientBrokerState(encodedState)).toEqual({
            redirectUri: "https://merchant.example/wp-admin/admin.php?page=aura",
            codeVerifier,
            clientState: "merchant-csrf-state",
        });
    });

    it("accepts camel-case state field aliases", () => {
        const encodedState = encodeRawState({
            redirectUri: "https://merchant.example/oauth/callback",
            codeVerifier,
            clientState: "merchant-state",
        });

        expect(decodeOAuthClientBrokerState(encodedState)).toEqual({
            redirectUri: "https://merchant.example/oauth/callback",
            codeVerifier,
            clientState: "merchant-state",
        });
    });

    it("accepts the nested state alias for client state", () => {
        const encodedState = encodeRawState({
            redirect_uri: "https://merchant.example/oauth/callback",
            code_verifier: codeVerifier,
            state: "merchant-state",
        });

        expect(decodeOAuthClientBrokerState(encodedState).clientState).toBe("merchant-state");
    });

    it("encodes and decodes broker state without optional client state", () => {
        const encodedState = encodeOAuthClientBrokerState({
            redirectUri: "https://merchant.example/oauth/callback",
            codeVerifier,
        });

        expect(decodeOAuthClientBrokerState(encodedState)).toEqual({
            redirectUri: "https://merchant.example/oauth/callback",
            codeVerifier,
        });
    });

    it("allows loopback HTTP redirect URIs for local development", () => {
        const encodedState = encodeRawState({
            redirect_uri: "http://localhost:8080/oauth/callback",
            code_verifier: codeVerifier,
        });

        expect(decodeOAuthClientBrokerState(encodedState).redirectUri).toBe(
            "http://localhost:8080/oauth/callback",
        );
    });

    it.each([
        ["missing state", ""],
        ["invalid base64url", "abcde"],
        ["invalid JSON", base64UrlEncode("not-json")],
        ["missing redirect_uri", encodeRawState({ code_verifier: codeVerifier })],
        [
            "relative redirect_uri",
            encodeRawState({ redirect_uri: "/callback", code_verifier: codeVerifier }),
        ],
        [
            "insecure redirect_uri",
            encodeRawState({
                redirect_uri: "http://merchant.example/oauth/callback",
                code_verifier: codeVerifier,
            }),
        ],
        [
            "redirect_uri with credentials",
            encodeRawState({
                redirect_uri: "https://user:pass@merchant.example/oauth/callback",
                code_verifier: codeVerifier,
            }),
        ],
        [
            "missing code_verifier",
            encodeRawState({ redirect_uri: "https://merchant.example/oauth/callback" }),
        ],
        [
            "invalid code_verifier",
            encodeRawState({
                redirect_uri: "https://merchant.example/oauth/callback",
                code_verifier: "too-short",
            }),
        ],
    ])("rejects %s", (_name, encodedState) => {
        expect(() => decodeOAuthClientBrokerState(encodedState)).toThrow();
    });

    it("appends the third-party exchange code without leaking an access token", () => {
        const redirectUri = setThirdPartyExchangeCodeOnRedirectUri(
            "https://merchant.example/callback?existing=1&third_party_exchange_code=old#done",
            "01970f22-2bf0-7000-8000-000000000099",
            "merchant-state",
        );

        expect(redirectUri).toBe(
            "https://merchant.example/callback?existing=1&third_party_exchange_code=01970f22-2bf0-7000-8000-000000000099&state=merchant-state#done",
        );
        expect(redirectUri).not.toContain("access_token");
    });

    it("appends the third-party exchange code without optional client state", () => {
        const redirectUri = setThirdPartyExchangeCodeOnRedirectUri(
            "https://merchant.example/callback",
            "01970f22-2bf0-7000-8000-000000000099",
        );
        const url = new URL(redirectUri);

        expect(url.searchParams.get("third_party_exchange_code")).toBe(
            "01970f22-2bf0-7000-8000-000000000099",
        );
        expect(url.searchParams.has("state")).toBe(false);
    });

    it("appends forwarded params before the third-party exchange code", () => {
        const redirectUri = setThirdPartyExchangeCodeOnRedirectUri(
            "https://merchant.example/callback?existing=1",
            "01970f22-2bf0-7000-8000-000000000099",
            undefined,
            [
                ["partner_shop_id", "shop-1"],
                ["resource", "products"],
                ["resource", "shops"],
            ],
        );
        const url = new URL(redirectUri);

        expect(url.searchParams.get("existing")).toBe("1");
        expect(url.searchParams.get("partner_shop_id")).toBe("shop-1");
        expect(url.searchParams.getAll("resource")).toEqual(["products", "shops"]);
        expect(url.searchParams.get("third_party_exchange_code")).toBe(
            "01970f22-2bf0-7000-8000-000000000099",
        );
    });

    it("appends OAuth errors to the final redirect target", () => {
        const redirectUri = setOAuthErrorOnRedirectUri(
            "https://merchant.example/callback?existing=1",
            "server_error",
            {
                errorDescription: "OAuth token exchange failed.",
                errorUri: "https://docs.example/oauth-errors",
                clientState: "merchant-state",
            },
        );
        const url = new URL(redirectUri);

        expect(url.origin).toBe("https://merchant.example");
        expect(url.searchParams.get("existing")).toBe("1");
        expect(url.searchParams.get("error")).toBe("server_error");
        expect(url.searchParams.get("error_description")).toBe("OAuth token exchange failed.");
        expect(url.searchParams.get("error_uri")).toBe("https://docs.example/oauth-errors");
        expect(url.searchParams.get("state")).toBe("merchant-state");
    });

    it("appends OAuth errors without optional fields", () => {
        const redirectUri = setOAuthErrorOnRedirectUri(
            "https://merchant.example/callback",
            "server_error",
        );
        const url = new URL(redirectUri);

        expect(url.searchParams.get("error")).toBe("server_error");
        expect(url.searchParams.has("error_description")).toBe(false);
        expect(url.searchParams.has("error_uri")).toBe(false);
        expect(url.searchParams.has("state")).toBe(false);
    });

    it("appends forwarded params to OAuth error redirects", () => {
        const redirectUri = setOAuthErrorOnRedirectUri(
            "https://merchant.example/callback",
            "server_error",
            {
                forwardedParams: [["partner_shop_id", "shop-1"]],
            },
        );
        const url = new URL(redirectUri);

        expect(url.searchParams.get("partner_shop_id")).toBe("shop-1");
        expect(url.searchParams.get("error")).toBe("server_error");
    });
});

function encodeRawState(state: Record<string, unknown>): string {
    return base64UrlEncode(JSON.stringify(state));
}

function base64UrlEncode(value: string): string {
    const bytes = new TextEncoder().encode(value);
    const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return globalThis.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replaceAll("=", "");
}
