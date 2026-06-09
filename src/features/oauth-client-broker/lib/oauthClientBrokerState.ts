import { z } from "zod";

const PKCE_CODE_VERIFIER_PATTERN = /^[A-Za-z0-9._~-]{43,128}$/;
const THIRD_PARTY_EXCHANGE_CODE_PARAM = "third_party_exchange_code";
const CLIENT_STATE_PARAM = "state";

export type OAuthRedirectForwardedParams = Iterable<readonly [string, string]>;

const rawBrokerStateSchema = z.object({
    redirect_uri: z.string().optional(),
    redirectUri: z.string().optional(),
    code_verifier: z.string().optional(),
    codeVerifier: z.string().optional(),
    client_state: z.string().optional(),
    clientState: z.string().optional(),
    state: z.string().optional(),
});

export interface OAuthClientBrokerState {
    readonly redirectUri: string;
    readonly codeVerifier: string;
    readonly clientState?: string;
}

export function decodeOAuthClientBrokerState(encodedState: string): OAuthClientBrokerState {
    const decodedState = rawBrokerStateSchema.parse(decodeBase64UrlJson(encodedState));
    const redirectUri = decodedState.redirect_uri ?? decodedState.redirectUri;
    const codeVerifier = decodedState.code_verifier ?? decodedState.codeVerifier;
    const clientState = decodedState.client_state ?? decodedState.clientState ?? decodedState.state;

    return {
        redirectUri: validateBrokerRedirectUri(redirectUri),
        codeVerifier: validateCodeVerifier(codeVerifier),
        ...(clientState !== undefined ? { clientState } : {}),
    };
}

export function encodeOAuthClientBrokerState(state: OAuthClientBrokerState): string {
    return base64UrlEncode(
        JSON.stringify({
            redirect_uri: state.redirectUri,
            code_verifier: state.codeVerifier,
            ...(state.clientState !== undefined ? { client_state: state.clientState } : {}),
        }),
    );
}

export function setThirdPartyExchangeCodeOnRedirectUri(
    redirectUri: string,
    thirdPartyExchangeCode: string,
    clientState?: string,
    forwardedParams?: OAuthRedirectForwardedParams,
): string {
    const url = new URL(redirectUri);
    appendForwardedSearchParams(url.searchParams, forwardedParams);
    url.searchParams.set(THIRD_PARTY_EXCHANGE_CODE_PARAM, thirdPartyExchangeCode);

    if (clientState !== undefined) {
        url.searchParams.set(CLIENT_STATE_PARAM, clientState);
    }

    return url.toString();
}

export function setOAuthErrorOnRedirectUri(
    redirectUri: string,
    error: string,
    params: {
        readonly errorDescription?: string;
        readonly errorUri?: string;
        readonly clientState?: string;
        readonly forwardedParams?: OAuthRedirectForwardedParams;
    } = {},
): string {
    const url = new URL(redirectUri);
    appendForwardedSearchParams(url.searchParams, params.forwardedParams);
    url.searchParams.set("error", error);

    if (params.errorDescription !== undefined) {
        url.searchParams.set("error_description", params.errorDescription);
    }

    if (params.errorUri !== undefined) {
        url.searchParams.set("error_uri", params.errorUri);
    }

    if (params.clientState !== undefined) {
        url.searchParams.set(CLIENT_STATE_PARAM, params.clientState);
    }

    return url.toString();
}

function appendForwardedSearchParams(
    searchParams: URLSearchParams,
    forwardedParams: OAuthRedirectForwardedParams | undefined,
) {
    if (!forwardedParams) {
        return;
    }

    for (const [key, value] of forwardedParams) {
        searchParams.append(key, value);
    }
}

function decodeBase64UrlJson(encodedValue: string): unknown {
    if (!encodedValue) {
        throw new Error("OAuth broker state is required.");
    }

    return JSON.parse(base64UrlDecode(encodedValue));
}

function validateBrokerRedirectUri(redirectUri: string | undefined): string {
    if (!redirectUri) {
        throw new Error("OAuth broker state is missing redirect_uri.");
    }

    let url: URL;
    try {
        url = new URL(redirectUri);
    } catch {
        throw new Error("OAuth broker state redirect_uri must be an absolute URL.");
    }

    if (url.username || url.password) {
        throw new Error("OAuth broker state redirect_uri must not contain credentials.");
    }

    if (url.protocol === "https:") {
        return url.toString();
    }

    if (url.protocol === "http:" && isLoopbackHostname(url.hostname)) {
        return url.toString();
    }

    throw new Error("OAuth broker state redirect_uri must use HTTPS.");
}

function validateCodeVerifier(codeVerifier: string | undefined): string {
    if (!codeVerifier) {
        throw new Error("OAuth broker state is missing code_verifier.");
    }

    if (!PKCE_CODE_VERIFIER_PATTERN.test(codeVerifier)) {
        throw new Error("OAuth broker state contains an invalid code_verifier.");
    }

    return codeVerifier;
}

function isLoopbackHostname(hostname: string): boolean {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function base64UrlDecode(encodedValue: string): string {
    const base64 = encodedValue.replace(/-/g, "+").replace(/_/g, "/");
    const paddingLength = (4 - (base64.length % 4)) % 4;

    if (base64.length % 4 === 1) {
        throw new Error("OAuth broker state is not valid base64url.");
    }

    const binary = globalThis.atob(`${base64}${"=".repeat(paddingLength)}`);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function base64UrlEncode(value: string): string {
    const bytes = new TextEncoder().encode(value);
    const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return globalThis.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
