import type { AdminAccessTokenData } from "@/client";
import type { AccessTokenScope } from "@/data/internal/access-tokens/AccessTokenScope.ts";

/** Secret-free token metadata shown in the admin user detail view. */
export type AdminAccessToken = {
    readonly accessTokenId: string;
    readonly name: string;
    readonly scopes: readonly AccessTokenScope[];
    readonly origin: string;
    readonly expires?: string | null;
};

/**
 * Map the admin-only DTO to the small view model. The explicit target is checked here so a
 * malformed response cannot be displayed in another user's token list.
 */
export function mapToAdminAccessToken(
    data: AdminAccessTokenData,
    targetUserId: string,
): AdminAccessToken {
    if (data.userId !== targetUserId) {
        throw new Error("Admin access-token response did not match the selected user");
    }

    return {
        accessTokenId: data.accessTokenId,
        name: data.name,
        scopes: [...data.scopes],
        origin: data.origin,
        ...(data.expires !== undefined && { expires: data.expires }),
    };
}
