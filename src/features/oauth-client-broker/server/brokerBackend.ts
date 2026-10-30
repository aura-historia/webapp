import type { OAuthErrorData } from "@/client";
import { getMyListingSources, getPublicListingSourceBySlug } from "@/client";
import { env } from "@/env.ts";
import { getApiBaseUrl } from "@/lib/apiBaseUrl.ts";
import {
    combineOwnListingSourcePages,
    mapToOwnListingSourcePage,
    type OwnListingSource,
} from "@/data/internal/listing-source/OwnListingSource.ts";
import { mapPublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import type { BrokerFailureError } from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import type { BrokerCredential } from "@/features/oauth-client-broker/server/brokerTransactionMachine.ts";
import type { WooCommerceBrokerConfig } from "@/features/oauth-client-broker/server/brokerConfig.ts";

const AUTHORIZE_ENDPOINT = "/v1/oauth/authorize";
const TOKEN_ENDPOINT = "/v1/oauth/token";
const REVOKE_ENDPOINT = "/v1/oauth/revoke";
const LISTING_SOURCE_PAGE_SIZE = 100;
/** Bounds the grant recheck; at 100 per page this covers 5,000 granted sources. */
const MAX_LISTING_SOURCE_PAGES = 50;
const MAX_ACCESS_TOKEN_LENGTH = 4096;
const MAX_SCOPE_LENGTH = 2048;

const OAUTH_ERROR_IDENTIFIERS = new Set<string>([
    "invalid_request",
    "invalid_client",
    "invalid_grant",
    "unauthorized_client",
    "unsupported_grant_type",
    "unsupported_response_type",
    "invalid_scope",
    "invalid_target",
    "access_denied",
    "server_error",
    "temporarily_unavailable",
] satisfies (OAuthErrorData["error"] | "unauthorized_client")[]);

function apiUrl(path: string): URL {
    return new URL(path, getApiBaseUrl(env.VITE_API_URL));
}

export type AuthorizationCodeResult =
    | { readonly ok: true; readonly code: string }
    | { readonly ok: false; readonly kind: "unauthenticated" | "unavailable" }
    | { readonly ok: false; readonly kind: "rejected"; readonly error: BrokerFailureError };

/**
 * Asks the backend for a code with the ordinary user's access JWT. The backend stays authoritative
 * for registration, redirect, scopes and resource; its redirect must name exactly the configured
 * callback and the state sent, or nothing is forwarded.
 */
export async function requestAuthorizationCode(params: {
    readonly accessToken: string;
    readonly config: WooCommerceBrokerConfig;
    readonly scope: string;
    readonly resource?: string;
    readonly state: string;
    readonly codeChallenge: string;
}): Promise<AuthorizationCodeResult> {
    const url = apiUrl(AUTHORIZE_ENDPOINT);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", params.config.clientId);
    url.searchParams.set("redirect_uri", params.config.callbackUrl);
    url.searchParams.set("scope", params.scope);
    url.searchParams.set("state", params.state);
    url.searchParams.set("code_challenge", params.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    if (params.resource !== undefined) {
        url.searchParams.set("resource", params.resource);
    }

    let response: Response;
    try {
        response = await fetch(url, {
            headers: { Authorization: `Bearer ${params.accessToken}` },
            redirect: "manual",
            cache: "no-store",
        });
    } catch {
        logBackendFailure("authorize", "network");
        return { ok: false, kind: "unavailable" };
    }

    if (response.status >= 300 && response.status < 400) {
        return readAuthorizationRedirect(response.headers.get("Location"), params);
    }

    if (response.status === 401) {
        return { ok: false, kind: "unauthenticated" };
    }

    const oauthError = await readOAuthErrorIdentifier(response);
    logBackendFailure("authorize", response.status, oauthError);
    if (
        response.status === 400 &&
        (oauthError === "invalid_scope" || oauthError === "invalid_target")
    ) {
        return { ok: false, kind: "rejected", error: oauthError };
    }
    if (response.status === 400) {
        return { ok: false, kind: "rejected", error: "server_error" };
    }
    return { ok: false, kind: "unavailable" };
}

function readAuthorizationRedirect(
    location: string | null,
    params: { readonly config: WooCommerceBrokerConfig; readonly state: string },
): AuthorizationCodeResult {
    let url: URL;
    try {
        url = new URL(location ?? "");
    } catch {
        logBackendFailure("authorize", "redirect");
        return { ok: false, kind: "unavailable" };
    }

    const expected = new URL(params.config.callbackUrl);
    const values = new Map<string, string[]>();
    for (const [key, value] of url.searchParams) {
        values.set(key, [...(values.get(key) ?? []), value]);
    }
    const single = (key: string) => {
        const entries = values.get(key);
        return entries?.length === 1 ? entries[0] : undefined;
    };
    const unexpectedKeys = [...values.keys()].filter(
        (key) => !["code", "state", "error", "error_description", "error_uri", "iss"].includes(key),
    );

    if (
        url.origin !== expected.origin ||
        url.pathname !== expected.pathname ||
        url.hash ||
        unexpectedKeys.length > 0 ||
        [...values.values()].some((entries) => entries.length > 1) ||
        single("state") !== params.state
    ) {
        logBackendFailure("authorize", "redirect");
        return { ok: false, kind: "unavailable" };
    }

    const error = single("error");
    if (error !== undefined) {
        logBackendFailure("authorize", "error_redirect", readKnownIdentifier(error));
        return { ok: false, kind: "rejected", error: toFailureError(error) };
    }

    const code = single("code");
    if (!code) {
        logBackendFailure("authorize", "redirect");
        return { ok: false, kind: "unavailable" };
    }
    return { ok: true, code };
}

export type TokenExchangeResult =
    | { readonly ok: true; readonly credential: BrokerCredential }
    | { readonly ok: false; readonly error: BrokerFailureError };

/** The ordinary authorization-code exchange with the stored verifier and the client secret. */
export async function exchangeAuthorizationCode(params: {
    readonly code: string;
    readonly codeVerifier: string;
    readonly resource?: string;
    readonly config: WooCommerceBrokerConfig;
    readonly now: () => number;
}): Promise<TokenExchangeResult> {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: params.code,
        redirect_uri: params.config.callbackUrl,
        client_id: params.config.clientId,
        client_secret: params.config.clientSecret,
        code_verifier: params.codeVerifier,
    });
    if (params.resource !== undefined) {
        body.set("resource", params.resource);
    }

    let response: Response;
    try {
        response = await fetch(apiUrl(TOKEN_ENDPOINT), {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
            redirect: "manual",
            cache: "no-store",
        });
    } catch {
        logBackendFailure("token", "network");
        return { ok: false, error: "temporarily_unavailable" };
    }

    if (!response.ok) {
        const oauthError = await readOAuthErrorIdentifier(response);
        // Only the status and a known OAuth error identifier are logged: never the request,
        // credentials or response body.
        logBackendFailure("token", response.status, oauthError);
        if (response.status === 401 || oauthError === "invalid_client") {
            return { ok: false, error: "server_error" };
        }
        if (oauthError === "invalid_grant" || oauthError === "invalid_target") {
            return { ok: false, error: oauthError };
        }
        return {
            ok: false,
            error: response.status === 503 ? "temporarily_unavailable" : "server_error",
        };
    }

    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        logBackendFailure("token", "invalid_response");
        return { ok: false, error: "server_error" };
    }

    const credential = readCredential(payload, params.now());
    if (!credential) {
        logBackendFailure("token", "invalid_response");
        return { ok: false, error: "server_error" };
    }
    return { ok: true, credential };
}

/**
 * Validates the token response and keeps only the credential. A `third_party_exchange_code` the
 * backend may include belongs to its own bearer handoff and is dropped here.
 */
function readCredential(payload: unknown, now: number): BrokerCredential | undefined {
    if (typeof payload !== "object" || payload === null) return undefined;
    const data = payload as Record<string, unknown>;

    const accessToken = data.access_token;
    const tokenType = data.token_type;
    const scope = data.scope;
    const expiresIn = data.expires_in;
    if (
        typeof accessToken !== "string" ||
        accessToken.length === 0 ||
        accessToken.length > MAX_ACCESS_TOKEN_LENGTH ||
        typeof tokenType !== "string" ||
        tokenType.toLowerCase() !== "bearer" ||
        typeof scope !== "string" ||
        scope.length > MAX_SCOPE_LENGTH
    ) {
        return undefined;
    }
    if (
        expiresIn !== undefined &&
        expiresIn !== null &&
        (typeof expiresIn !== "number" || !Number.isSafeInteger(expiresIn) || expiresIn < 0)
    ) {
        return undefined;
    }

    return {
        accessToken,
        tokenType: "Bearer",
        scope,
        ...(typeof expiresIn === "number" ? { accessTokenExpiresAt: now + expiresIn * 1000 } : {}),
    };
}

/**
 * Revokes an issued credential that was never delivered. `true` once nothing more can be done:
 * revoked, already unknown, or refused because it is not this client's token.
 */
export async function revokeAccessToken(
    accessToken: string,
    config: WooCommerceBrokerConfig,
): Promise<boolean> {
    try {
        const response = await fetch(apiUrl(REVOKE_ENDPOINT), {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                token: accessToken,
                client_id: config.clientId,
                client_secret: config.clientSecret,
            }),
            redirect: "manual",
            cache: "no-store",
        });
        if (response.ok || response.status === 403) return true;
        logBackendFailure("revoke", response.status, await readOAuthErrorIdentifier(response));
        return false;
    } catch {
        logBackendFailure("revoke", "network");
        return false;
    }
}

export type ListingSourceCheck =
    | { readonly ok: true; readonly source: OwnListingSource }
    | { readonly ok: false; readonly kind: "not_granted" | "unauthenticated" | "unavailable" };

/** Rechecks a source against the user's current grants, reading every page as needed. */
export async function findGrantedListingSource(params: {
    readonly accessToken: string;
    readonly listingSourceId: string;
}): Promise<ListingSourceCheck> {
    let after: string | undefined;
    for (let page = 0; page < MAX_LISTING_SOURCE_PAGES; page++) {
        const result = await getMyListingSources({
            baseUrl: getApiBaseUrl(env.VITE_API_URL),
            auth: params.accessToken,
            query: { size: LISTING_SOURCE_PAGE_SIZE, after },
            cache: "no-store",
            redirect: "error",
            throwOnError: false,
        }).catch(() => undefined);

        if (!result?.response) return { ok: false, kind: "unavailable" };
        if (result.response.status === 401) return { ok: false, kind: "unauthenticated" };
        if (!result.data) {
            logBackendFailure("listing_sources", result.response.status);
            return { ok: false, kind: "unavailable" };
        }

        const sourcePage = mapToOwnListingSourcePage(result.data);
        const source = combineOwnListingSourcePages([sourcePage]).find(
            (item) => item.listingSourceId === params.listingSourceId,
        );
        if (source) return { ok: true, source };
        if (sourcePage.next === undefined) return { ok: false, kind: "not_granted" };
        after = sourcePage.next;
    }

    logBackendFailure("listing_sources", "page_limit");
    return { ok: false, kind: "unavailable" };
}

/**
 * The website an administrator registered for the source. Only administrators set it (directly,
 * or by approving a partnership application), which makes it the source's registered destination.
 */
export async function getRegisteredListingSourceUrl(params: {
    readonly accessToken: string;
    readonly listingSourceSlugId: string;
}): Promise<{ readonly ok: true; readonly url?: string } | { readonly ok: false }> {
    const result = await getPublicListingSourceBySlug({
        baseUrl: getApiBaseUrl(env.VITE_API_URL),
        auth: params.accessToken,
        path: { listingSourceSlugId: params.listingSourceSlugId },
        cache: "no-store",
        redirect: "error",
        throwOnError: false,
    }).catch(() => undefined);

    if (!result?.data) {
        logBackendFailure("listing_source", result?.response?.status ?? "network");
        return { ok: false };
    }
    const source = mapPublicListingSource(result.data);
    return { ok: true, ...(source.url === undefined ? {} : { url: source.url }) };
}

async function readOAuthErrorIdentifier(response: Response): Promise<string | undefined> {
    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        return undefined;
    }
    if (typeof payload !== "object" || payload === null) return undefined;
    return readKnownIdentifier((payload as Record<string, unknown>).error);
}

function readKnownIdentifier(value: unknown): string | undefined {
    return typeof value === "string" && OAUTH_ERROR_IDENTIFIERS.has(value) ? value : undefined;
}

function toFailureError(error: string): BrokerFailureError {
    if (error === "invalid_scope" || error === "invalid_target" || error === "access_denied") {
        return error;
    }
    return error === "temporarily_unavailable" ? error : "server_error";
}

/** Safe categories only: an operation, an HTTP status or kind, and a known OAuth identifier. */
function logBackendFailure(operation: string, status: number | string, error?: string) {
    console.error("[OAuth broker] Backend request failed.", {
        operation,
        status,
        error: error ?? "unrecognized",
    });
}
