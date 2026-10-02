import type { OAuthClientConsentMetadataData } from "@/client";
import type { AccessTokenScope } from "@/data/internal/access-tokens/AccessTokenScope.ts";

export type OAuthScope = AccessTokenScope;

export type OAuthClient = {
    readonly clientId: string;
    readonly clientName: string;
    readonly tosUri: string;
    readonly policyUri: string;
    readonly clientUri: string;
    readonly logoUri: string;
    readonly redirectUris: readonly string[];
    readonly scopes: readonly OAuthScope[];
};

export function mapToInternalOAuthClient(data: OAuthClientConsentMetadataData): OAuthClient {
    return {
        clientId: data.client_id,
        clientName: data.client_name,
        tosUri: data.tos_uri,
        policyUri: data.policy_uri,
        clientUri: data.client_uri,
        logoUri: data.logo_uri,
        redirectUris: [...data.redirect_uris],
        scopes: [...data.scope],
    };
}
