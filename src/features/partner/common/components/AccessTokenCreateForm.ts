import type { TFunction } from "i18next";
import { z } from "zod";

export const ACCESS_TOKEN_SCOPES = ["shops:manage", "products:write"] as const;

export const ACCESS_TOKEN_CREATE_DEFAULT_VALUES = {
    name: "",
    scopes: [],
    expiresAt: "",
} satisfies AccessTokenCreateFormData;

export function createAccessTokenFormSchema(t: TFunction) {
    return z.object({
        name: z
            .string()
            .trim()
            .min(1, t("partnerAccessTokens.create.validation.nameRequired"))
            .max(128, t("partnerAccessTokens.create.validation.nameTooLong")),
        scopes: z.array(z.enum(ACCESS_TOKEN_SCOPES)),
        expiresAt: z
            .string()
            .refine(
                (value) => value === "" || !Number.isNaN(new Date(value).getTime()),
                t("partnerAccessTokens.create.validation.expirationInvalid"),
            ),
    });
}

export type AccessTokenCreateFormData = z.infer<ReturnType<typeof createAccessTokenFormSchema>>;
