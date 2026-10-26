import type { OAuthClient } from "@/data/internal/oauth/OAuthClient.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";

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

/** The redirect URI must be one the client registered, compared exactly as the backend does. */
export function isRegisteredOAuthRedirect(
    client: Pick<OAuthClient, "clientId" | "redirectUris">,
    searchParams: Pick<OAuthAuthorizeSearchParams, "client_id" | "redirect_uri">,
): boolean {
    return (
        client.clientId === searchParams.client_id &&
        client.redirectUris.includes(searchParams.redirect_uri)
    );
}

/**
 * The `access_denied` callback carrying the request's state, or `undefined` when the redirect URI is
 * not registered for the client, so a denial never navigates to an unverified target.
 */
export function getOAuthDenialRedirectUrl(
    client: Pick<OAuthClient, "clientId" | "redirectUris">,
    searchParams: Pick<OAuthAuthorizeSearchParams, "client_id" | "redirect_uri" | "state">,
): string | undefined {
    if (!isRegisteredOAuthRedirect(client, searchParams)) {
        return undefined;
    }

    try {
        const url = new URL(searchParams.redirect_uri);
        url.searchParams.set("error", "access_denied");
        url.searchParams.set("error_description", "The user denied the authorization request");
        if (searchParams.state !== undefined) {
            url.searchParams.set("state", searchParams.state);
        }
        return url.toString();
    } catch {
        return undefined;
    }
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
