import type { OAuthClientMetadataResponseData } from "@/client";

export type OAuthClient = {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly clientName: string;
    readonly redirectUris: readonly string[];
    readonly scope: readonly string[];
    readonly createdAt: Date;
};

export function mapToOAuthClient(data: OAuthClientMetadataResponseData): OAuthClient {
    return {
        clientId: data.client_id,
        clientSecret: data.client_secret,
        clientName: data.client_name,
        redirectUris: data.redirect_uris,
        scope: data.scope,
        createdAt: new Date(data.client_id_issued_at * 1000),
    };
}
