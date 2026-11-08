import type { AdminAccessTokenData } from "@/client";
import type { AccessTokenScope } from "@/data/internal/access-tokens/AccessTokenScope.ts";

/** Secret-free token metadata shown in the admin user detail view. */
export type AdminAccessToken = {
    readonly accessTokenId: string;
    readonly name: string;
    readonly scopes: readonly AccessTokenScope[];
    readonly origin: string;
    readonly expires?: string;
};

/**
 * Map the admin-only DTO to the small view model. The explicit target is checked here so a
 * malformed response cannot be displayed in another user's token list. A metadata document
 * client's connection entry has no `accessTokenId` and cannot be deleted as a token, so it is left
 * out (`undefined`) until connected apps are listed on their own (#1238); revoking all of the
 * user's tokens still ends it.
 */
export function mapToAdminAccessToken(
    data: AdminAccessTokenData,
    targetUserId: string,
): AdminAccessToken | undefined {
    if (data.userId !== targetUserId) {
        throw new Error("Admin access-token response did not match the selected user");
    }
    if (data.accessTokenId == null) {
        return undefined;
    }

    return {
        accessTokenId: data.accessTokenId,
        name: data.name,
        scopes: [...data.scopes],
        origin: data.origin,
        ...(data.expires != null && { expires: data.expires }),
    };
}
