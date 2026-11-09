import type { AdminAccessTokenData } from "@/client";
import type { AccessTokenScope } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import {
    groupCredentialEntries,
    type AccessTokenOrigin,
    type CredentialListEntryData,
    type GroupedCredentials,
} from "@/data/internal/access-tokens/OwnCredentials.ts";

/** Secret-free metadata of a token the user manages one by one, as the admin view shows it. */
export type AdminAccessToken = {
    readonly accessTokenId: string;
    readonly name: string;
    readonly scopes: readonly AccessTokenScope[];
    readonly origin: AccessTokenOrigin;
    readonly expires?: string;
};

/** A user's credentials in the admin view: personal tokens and connected apps. */
export type AdminUserCredentials = GroupedCredentials<AdminAccessToken>;

/**
 * Check one entry of the admin listing and keep only its known, secret-free fields. The explicit
 * target is checked here so a malformed response cannot be displayed in another user's credential
 * list; copying field by field keeps anything the backend might add (a token value, a hash) out of
 * the cache.
 */
export function mapToAdminCredentialEntry(
    data: AdminAccessTokenData,
    targetUserId: string,
): CredentialListEntryData {
    if (data.userId !== targetUserId) {
        throw new Error("Admin access-token response did not match the selected user");
    }
    const { client } = data;
    return {
        name: data.name,
        scopes: [...data.scopes],
        origin: data.origin,
        ...(data.accessTokenId != null && { accessTokenId: data.accessTokenId }),
        ...(data.connectionId != null && { connectionId: data.connectionId }),
        ...(client && {
            client: {
                clientId: client.clientId,
                name: client.name,
                kind: client.kind,
                host: client.host,
            },
        }),
        ...(data.expires != null && { expires: data.expires }),
        ...(data.created != null && { created: data.created }),
        ...(data.lastUsed != null && { lastUsed: data.lastUsed }),
    };
}

/**
 * Group the loaded entries the way the user's own dashboard does: one connected app per client,
 * the rest as personal tokens. Pages are grouped together, so a registered client's tokens on a
 * later page join its app once that page loads.
 */
export function groupAdminCredentials(
    entries: readonly CredentialListEntryData[],
): AdminUserCredentials {
    return groupCredentialEntries(entries, (entry) => ({
        accessTokenId: entry.accessTokenId,
        name: entry.name,
        scopes: [...entry.scopes],
        origin: entry.origin,
        ...(entry.expires != null && { expires: entry.expires }),
    }));
}
