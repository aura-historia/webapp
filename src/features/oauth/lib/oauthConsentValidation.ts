import { ACCESS_TOKEN_SCOPES } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import type { OAuthClient } from "@/features/oauth/types/OAuthClient.ts";

export function getRequestedOAuthScopes(scope: string | undefined): string[] {
    return scope?.split(" ").filter(Boolean) ?? [];
}

export function isValidOAuthConsentRequest(
    client: OAuthClient,
    request: { client_id: string; redirect_uri: string; scope?: string },
): boolean {
    let redirect: URL;
    try {
        redirect = new URL(request.redirect_uri);
    } catch {
        return false;
    }
    const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(redirect.hostname);
    if (
        redirect.username ||
        redirect.password ||
        (redirect.protocol !== "https:" && !(redirect.protocol === "http:" && isLoopback))
    ) {
        return false;
    }
    return (
        client.clientId === request.client_id &&
        client.redirectUris.includes(request.redirect_uri) &&
        getRequestedOAuthScopes(request.scope).every(
            (scope) =>
                ACCESS_TOKEN_SCOPES.some((supported) => supported === scope) &&
                client.scopes.some((allowed) => allowed === scope),
        )
    );
}
