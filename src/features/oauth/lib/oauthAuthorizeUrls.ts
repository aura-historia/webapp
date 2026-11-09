import {
    isMetadataDocumentClientId,
    type OAuthClient,
    type OAuthMetadataDocumentClient,
} from "@/data/internal/oauth/OAuthClient.ts";
import { env } from "@/env.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { getApiBaseUrl } from "@/lib/apiBaseUrl.ts";

export const OAUTH_AUTHORIZE_APPROVE_ACTION = "/api/oauth/authorize/approve";
const LISTING_SOURCE_ID_PARAM = "listing_source_id";

export function getSafeHttpsUrl(url: string | undefined): string | undefined {
    if (!url) {
        return undefined;
    }

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "https:" ? url : undefined;
    } catch {
        return undefined;
    }
}

/** The consent metadata fields that tell which callback the backend validated for a client. */
export type OAuthRedirectValidation =
    | Pick<OAuthClient, "kind" | "clientId" | "redirectUris">
    | Pick<OAuthMetadataDocumentClient, "kind" | "clientId" | "redirectUri">;

/**
 * Whether the backend validated the request's redirect URI for this client: for a registered
 * client one it registered, compared exactly as the backend does; for a metadata document client
 * the callback its consent metadata was read and accepted for. The metadata must also be of the
 * kind the `client_id` names, so neither kind ever stands in for the other.
 */
export function isValidatedOAuthRedirect(
    client: OAuthRedirectValidation,
    searchParams: Pick<OAuthAuthorizeSearchParams, "client_id" | "redirect_uri">,
): boolean {
    if (client.clientId !== searchParams.client_id) {
        return false;
    }
    if (client.kind === "metadataDocument") {
        return (
            isMetadataDocumentClientId(searchParams.client_id) &&
            client.redirectUri === searchParams.redirect_uri
        );
    }
    return (
        !isMetadataDocumentClientId(searchParams.client_id) &&
        client.redirectUris.includes(searchParams.redirect_uri)
    );
}

/**
 * The authorization server's issuer, which every authorization response carries as `iss`
 * (RFC 9207): the API origin, `https://api.aura-historia.com` or `https://api.stage.aura-historia.com`.
 */
export function getOAuthIssuer(): string {
    return new URL(getApiBaseUrl(env.VITE_API_URL)).origin;
}

/**
 * The `access_denied` callback carrying the request's state and the issuer, or `undefined` when the
 * backend has not validated the redirect URI for the client, so a denial never navigates to an
 * unverified target. Both kinds of client leave through this one exit.
 */
export function getOAuthDenialRedirectUrl(
    client: OAuthRedirectValidation,
    searchParams: Pick<OAuthAuthorizeSearchParams, "client_id" | "redirect_uri" | "state">,
): string | undefined {
    if (!isValidatedOAuthRedirect(client, searchParams)) {
        return undefined;
    }

    try {
        const url = new URL(searchParams.redirect_uri);
        url.searchParams.set("error", "access_denied");
        url.searchParams.set("error_description", "The user denied the authorization request");
        if (searchParams.state !== undefined) {
            url.searchParams.set("state", searchParams.state);
        }
        url.searchParams.set("iss", getOAuthIssuer());
        return url.toString();
    } catch {
        return undefined;
    }
}

/**
 * The URL when it is HTTPS on exactly `host`. A metadata document's logo and home page are
 * self-asserted on any host, so they are shown only on the verified host of its `client_id`.
 */
export function getSafeHttpsUrlOnHost(url: string | undefined, host: string): string | undefined {
    const safeUrl = getSafeHttpsUrl(url);
    if (!safeUrl) {
        return undefined;
    }

    return new URL(safeUrl).host === host.toLowerCase() ? safeUrl : undefined;
}

export function getListingSourceIdFromRedirectUri(redirectUri: string): string | undefined {
    try {
        return new URL(redirectUri).searchParams.get(LISTING_SOURCE_ID_PARAM) ?? undefined;
    } catch {
        return undefined;
    }
}

export function setListingSourceIdOnRedirectUri(
    redirectUri: string,
    listingSourceId: string | undefined,
): string {
    try {
        const url = new URL(redirectUri);

        if (listingSourceId) {
            url.searchParams.set(LISTING_SOURCE_ID_PARAM, listingSourceId);
        } else {
            url.searchParams.delete(LISTING_SOURCE_ID_PARAM);
        }

        return url.toString();
    } catch {
        return redirectUri;
    }
}
