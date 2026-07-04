import type { OAuthClientMetadataResponseData } from "@/client";

export type OAuthClient = {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly clientName: string;
    readonly tosUri: string;
    readonly policyUri: string;
    readonly clientUri: string;
    readonly logoUri: string;
    readonly redirectUris: readonly string[];
    readonly scope: readonly string[];
    readonly createdAt: Date;
};

export function mapToOAuthClient(data: OAuthClientMetadataResponseData): OAuthClient {
    return {
        clientId: data.client_id,
        clientSecret: data.client_secret,
        clientName: data.client_name,
        tosUri: data.tos_uri,
        policyUri: data.policy_uri,
        clientUri: data.client_uri,
        logoUri: data.logo_uri,
        redirectUris: data.redirect_uris,
        scope: data.scope,
        createdAt: new Date(data.client_id_issued_at * 1000),
    };
}
