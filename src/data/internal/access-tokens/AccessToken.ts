import type {
    CreatedAccessTokenData,
    OwnAccessTokenData,
    OwnAccessTokenListEntryData,
} from "@/client";
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

/**
 * One entry of the own credential listing. A metadata document client's connection entry has no
 * `accessTokenId` and cannot be edited or deleted as a token, so it is left out until connected
 * apps are listed on their own (#1238).
 */
export function mapToAccessTokenListEntry(
    data: OwnAccessTokenListEntryData,
): AccessToken | undefined {
    const { accessTokenId } = data;
    if (accessTokenId == null) {
        return undefined;
    }

    return mapToAccessToken({ ...data, accessTokenId });
}

export function mapToCreatedAccessToken(data: CreatedAccessTokenData): CreatedAccessToken {
    return {
        id: data.accessTokenId,
        plaintextToken: data.accessToken,
    };
}
