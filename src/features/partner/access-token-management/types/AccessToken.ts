import type { AccessTokenScopeData, GetAccessTokenData } from "@/client";

export type AccessToken = {
    readonly id: string;
    readonly name: string;
    readonly scopes: AccessTokenScopeData[];
    readonly maskedToken: string;
    readonly tokenType: "BEARER";
    readonly expiresAt: Date | null;
    readonly created: Date;
    readonly updated: Date;
};

export function mapToAccessToken(data: GetAccessTokenData): AccessToken {
    return {
        id: data.accessTokenId,
        name: data.name,
        scopes: data.scope ?? [],
        maskedToken: data.token,
        tokenType: data.tokenType,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}
