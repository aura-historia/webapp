import { z } from "zod";
import type { PatchAccessTokenData, PostAccessTokenData } from "@/client";
import { ACCESS_TOKEN_SCOPES, type AccessTokenScope } from "./AccessTokenScope.ts";

export type CreateAccessTokenInput = {
    readonly name: string;
    readonly scopes: AccessTokenScope[];
    readonly expiresAt?: Date;
};

export type UpdateAccessTokenInput = {
    readonly id: string;
    readonly name?: string;
    readonly scopes?: AccessTokenScope[];
    readonly expiresAt?: Date | null;
};

const editableFields = z.object({
    name: z.string().trim().min(1).max(128),
    scopes: z.array(z.enum(ACCESS_TOKEN_SCOPES)),
    expiresAt: z.date().nullable(),
});

export function mapToCreateAccessTokenRequest(input: CreateAccessTokenInput): PostAccessTokenData {
    const values = editableFields.extend({ expiresAt: z.date().optional() }).parse(input);
    return {
        name: values.name,
        ...(values.scopes.length > 0 ? { scope: values.scopes } : {}),
        ...(values.expiresAt !== undefined ? { expiresAt: values.expiresAt.toISOString() } : {}),
    };
}

export function mapToUpdateAccessTokenRequest(input: UpdateAccessTokenInput): PatchAccessTokenData {
    const values = editableFields
        .partial()
        .extend({ id: z.string().min(1) })
        .parse(input);
    return {
        accessTokenId: values.id,
        ...(values.name !== undefined ? { name: values.name } : {}),
        ...(values.scopes !== undefined ? { scopes: values.scopes } : {}),
        ...(values.expiresAt !== undefined
            ? { expires: values.expiresAt === null ? null : values.expiresAt.toISOString() }
            : {}),
    };
}
