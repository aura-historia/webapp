import { z } from "zod";
import type {
    OAuthClientAdminCollectionData,
    OAuthClientAdminData,
    OAuthClientMetadataPatchData,
    OAuthClientMetadataRequestData,
    OAuthClientMetadataResponseData,
} from "@/client";
import {
    ACCESS_TOKEN_SCOPES,
    type AccessTokenScope,
} from "@/data/internal/access-tokens/AccessTokenScope.ts";

export type AdminOAuthClient = {
    readonly clientId: string;
    readonly clientName: string;
    readonly tosUri: string;
    readonly policyUri: string;
    readonly clientUri: string;
    readonly logoUri: string;
    readonly redirectUris: readonly string[];
    readonly scopes: readonly AccessTokenScope[];
    readonly clientIdIssuedAt: number;
};

export type AdminOAuthClientCursor = readonly [createdAt: string, clientId: string];

export type AdminOAuthClientPage = {
    readonly items: readonly AdminOAuthClient[];
    readonly size: number;
    readonly searchAfter?: AdminOAuthClientCursor | null;
    readonly total?: number | null;
};

export type AdminOAuthClientMetadataInput = {
    readonly clientName: string;
    readonly tosUri: string;
    readonly policyUri: string;
    readonly clientUri: string;
    readonly logoUri: string;
    readonly redirectUris: readonly string[];
    readonly scopes: readonly AccessTokenScope[];
};

export type AdminOAuthClientFilters = {
    readonly clientId?: string;
    readonly name?: string;
};

function isHttpsUrl(value: string) {
    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
}

const httpsUrlSchema = z.string().trim().url().refine(isHttpsUrl);

function hasNoFragment(value: string) {
    try {
        return new URL(value).hash.length === 0;
    } catch {
        return false;
    }
}

export const oauthClientRedirectUriSchema = httpsUrlSchema.refine(hasNoFragment);

const oauthClientScopeSchema = z.enum(ACCESS_TOKEN_SCOPES);

export const oauthClientMetadataRequestSchema = z.object({
    client_name: z.string().trim().min(1),
    tos_uri: httpsUrlSchema,
    policy_uri: httpsUrlSchema,
    client_uri: httpsUrlSchema,
    logo_uri: httpsUrlSchema,
    redirect_uris: z
        .array(oauthClientRedirectUriSchema)
        .min(1)
        .refine((uris) => new Set(uris).size === uris.length),
    scope: z.array(oauthClientScopeSchema).optional(),
});

/**
 * Patch members are optional but deliberately non-nullable. An empty scope list is meaningful
 * and clears the registered scopes; an empty redirect list remains invalid.
 */
export const oauthClientMetadataPatchSchema = z
    .object({
        client_name: z.string().trim().min(1).optional(),
        tos_uri: httpsUrlSchema.optional(),
        policy_uri: httpsUrlSchema.optional(),
        client_uri: httpsUrlSchema.optional(),
        logo_uri: httpsUrlSchema.optional(),
        redirect_uris: z
            .array(oauthClientRedirectUriSchema)
            .min(1)
            .refine((uris) => new Set(uris).size === uris.length)
            .optional(),
        scope: z.array(oauthClientScopeSchema).optional(),
    })
    .strict();

export function mapToAdminOAuthClient(data: OAuthClientAdminData): AdminOAuthClient {
    return {
        clientId: data.client_id,
        clientName: data.client_name,
        tosUri: data.tos_uri,
        policyUri: data.policy_uri,
        clientUri: data.client_uri,
        logoUri: data.logo_uri,
        redirectUris: [...data.redirect_uris],
        scopes: [...data.scope],
        clientIdIssuedAt: data.client_id_issued_at,
    };
}

export function mapToAdminOAuthClientPage(
    data: OAuthClientAdminCollectionData,
): AdminOAuthClientPage {
    return {
        items: data.items.map(mapToAdminOAuthClient),
        size: data.size,
        ...(data.searchAfter !== undefined && { searchAfter: data.searchAfter }),
        ...(data.total !== undefined && { total: data.total }),
    };
}

/** Only the create response is allowed to map a plaintext secret. */
export function mapToCreatedAdminOAuthClient(data: OAuthClientMetadataResponseData) {
    return {
        clientId: data.client_id,
        clientSecret: data.client_secret,
    } as const;
}

export function buildAdminOAuthClientCreateData(
    input: AdminOAuthClientMetadataInput,
): OAuthClientMetadataRequestData {
    return oauthClientMetadataRequestSchema.parse({
        client_name: input.clientName,
        tos_uri: input.tosUri,
        policy_uri: input.policyUri,
        client_uri: input.clientUri,
        logo_uri: input.logoUri,
        redirect_uris: [...input.redirectUris],
        scope: [...input.scopes],
    });
}

export function buildAdminOAuthClientPatchData(
    input: Partial<AdminOAuthClientMetadataInput>,
): OAuthClientMetadataPatchData {
    const candidate = {
        ...(input.clientName !== undefined && { client_name: input.clientName }),
        ...(input.tosUri !== undefined && { tos_uri: input.tosUri }),
        ...(input.policyUri !== undefined && { policy_uri: input.policyUri }),
        ...(input.clientUri !== undefined && { client_uri: input.clientUri }),
        ...(input.logoUri !== undefined && { logo_uri: input.logoUri }),
        ...(input.redirectUris !== undefined && { redirect_uris: [...input.redirectUris] }),
        ...(input.scopes !== undefined && { scope: [...input.scopes] }),
    };

    return oauthClientMetadataPatchSchema.parse(candidate);
}

export function mapToAdminOAuthClientListQuery(
    filters: AdminOAuthClientFilters,
    cursor?: AdminOAuthClientCursor,
    size = 21,
) {
    return {
        size,
        ...(filters.clientId?.trim() && { clientId: filters.clientId.trim() }),
        ...(filters.name?.trim() && { name: filters.name.trim() }),
        ...(cursor && { searchAfter: JSON.stringify(cursor) }),
    };
}
