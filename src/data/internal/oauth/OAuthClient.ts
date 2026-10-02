import { z } from "zod";
import { ACCESS_TOKEN_SCOPES } from "@/data/internal/access-tokens/AccessTokenScope.ts";
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

/** Temporary contract until the generated client includes OAuthClientConsentMetadataData. */
export const oauthConsentMetadataSchema = z.object({
    client_id: z.string().min(1),
    client_name: z.string(),
    tos_uri: z.url(),
    policy_uri: z.url(),
    client_uri: z.url(),
    logo_uri: z.url(),
    redirect_uris: z.array(z.url()),
    scope: z.array(z.enum(ACCESS_TOKEN_SCOPES)),
});
export type OAuthConsentMetadataDto = z.infer<typeof oauthConsentMetadataSchema>;

export function mapToInternalOAuthClient(data: OAuthConsentMetadataDto): OAuthClient {
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
