import type { GetAccessTokenData } from "@/client";
import { ACCESS_TOKEN_SCOPES, type AccessTokenScope } from "./AccessTokenScope.ts";

export type AccessToken = {
    readonly id: string;
    readonly name: string;
    readonly scopes: AccessTokenScope[];
    readonly maskedToken: string;
    readonly tokenType: "BEARER";
    readonly expiresAt: Date | null;
    readonly created: Date;
    readonly updated: Date;
};

export type CreatedAccessToken = {
    readonly accessToken: Omit<AccessToken, "maskedToken">;
    readonly plaintextToken: string;
};

export function mapToAccessToken(data: GetAccessTokenData): AccessToken {
    return {
        id: data.accessTokenId,
        name: data.name,
        scopes: (data.scope ?? []).filter((scope) => ACCESS_TOKEN_SCOPES.includes(scope)),
        maskedToken: data.token,
        tokenType: data.tokenType,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}

export function mapToCreatedAccessToken(data: GetAccessTokenData): CreatedAccessToken {
    const { maskedToken: plaintextToken, ...accessToken } = mapToAccessToken(data);

    return {
        accessToken,
        plaintextToken,
    };
}
