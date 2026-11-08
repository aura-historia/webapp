/**
 * The OIDC/OAuth request flag a metadata document client adds to `scope` to receive a refresh token.
 * It is not an Aura permission and never appears on a token.
 */
export const OFFLINE_ACCESS_SCOPE = "offline_access";

export interface OAuthConsentScopes {
    /** Requested permissions to show as requested; for a step-up, those not granted before. */
    readonly requestedScopes: readonly string[];
    /** Requested permissions the user already granted this metadata document client. */
    readonly alreadyGrantedScopes: readonly string[];
    /** A metadata document client asked to stay signed in (`offline_access`). */
    readonly requestsOfflineAccess: boolean;
}

/** The scopes of the request's `scope` parameter, in order, as sent. */
export function getRequestedScopes(scope: string | undefined): string[] {
    return scope?.split(" ").filter(Boolean) ?? [];
}

/**
 * How consent presents a request's scopes. A registered client's scopes are shown exactly as
 * requested. For a metadata document client, `offline_access` becomes a note rather than a
 * permission, and requested permissions found among `grantedScopes` move to their own list, so
 * every requested permission still appears exactly once. The `scope` forwarded to the backend is
 * never changed.
 */
export function getOAuthConsentScopes(
    requestedScopes: readonly string[],
    metadataDocumentClient: { readonly grantedScopes: readonly string[] } | undefined,
): OAuthConsentScopes {
    if (!metadataDocumentClient) {
        return { requestedScopes, alreadyGrantedScopes: [], requestsOfflineAccess: false };
    }

    const grantedScopes = new Set(metadataDocumentClient.grantedScopes);
    const permissions = requestedScopes.filter((scope) => scope !== OFFLINE_ACCESS_SCOPE);
    return {
        requestedScopes: permissions.filter((scope) => !grantedScopes.has(scope)),
        alreadyGrantedScopes: permissions.filter((scope) => grantedScopes.has(scope)),
        requestsOfflineAccess: permissions.length !== requestedScopes.length,
    };
}
