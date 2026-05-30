import type { AccessTokenScopeData, OAuthClientMetadataResponseData } from "@/client";

export type OAuthScope = "shops:manage" | "products:write";

export type OAuthClient = {
    readonly clientId: string;
    readonly clientName: string;
    readonly redirectUris: readonly string[];
    readonly scopes: readonly OAuthScope[];
};

function mapScope(scope: AccessTokenScopeData): OAuthScope {
    return scope;
}

export function mapToInternalOAuthClient(data: OAuthClientMetadataResponseData): OAuthClient {
    return {
        clientId: data.client_id,
        clientName: data.client_name,
        redirectUris: data.redirect_uris,
        scopes: data.scope.map(mapScope),
    };
}
