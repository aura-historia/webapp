import type { CreatedAccessTokenData, OwnAccessTokenData } from "@/client";
import type { AccessTokenScope } from "./AccessTokenScope.ts";

/** Secret-free own-token metadata; the backend returns no token value or audit dates after creation. */
export type AccessToken = {
    readonly id: string;
    readonly name: string;
    readonly scopes: AccessTokenScope[];
    readonly expiresAt: Date | null;
};

export type CreatedAccessToken = {
    readonly id: string;
    readonly plaintextToken: string;
};

export function mapToAccessToken(data: OwnAccessTokenData): AccessToken {
    return {
        id: data.accessTokenId,
        name: data.name,
        scopes: [...data.scopes],
        expiresAt: data.expires ? new Date(data.expires) : null,
    };
}

export function mapToCreatedAccessToken(data: CreatedAccessTokenData): CreatedAccessToken {
    return {
        id: data.accessTokenId,
        plaintextToken: data.accessToken,
    };
}
