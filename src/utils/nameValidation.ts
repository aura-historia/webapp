import { z } from "zod";
import type { TFunction } from "i18next";
import { LANGUAGES } from "@/data/internal/Language.ts";
import { CURRENCIES } from "@/data/internal/Currency.ts";

type NameFormData = {
    firstName?: string;
    lastName?: string;
};

function createNameSchema(t: TFunction) {
    return z
        .string()
        .trim()
        .min(2, t("validation.name.minLength", { min: 2 }))
        .max(64, t("validation.name.maxLength", { max: 64 }))
        .regex(/^[a-zA-ZäöüÄÖÜß\s\-']+$/, t("validation.name.invalidChars"));
}

export function validateCognitoNameFields(formData: NameFormData, t: TFunction) {
    const nameSchema = createNameSchema(t);

    const nameFieldsSchema = z.object({
        firstName: nameSchema.optional(),
        lastName: nameSchema.optional(),
    });

    const result = nameFieldsSchema.safeParse({
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
    });

    if (result.success) return undefined;

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field && typeof field === "string" && !errors[field]) {
            errors[field] = issue.message;
        }
    }
    return errors;
}

export function getAccountEditSchema(t: TFunction) {
    const nameSchema = createNameSchema(t);

    return z.object({
        firstName: nameSchema,
        lastName: nameSchema,
        language: z.enum(LANGUAGES).optional(),
        currency: z.enum(CURRENCIES).optional(),
    });
}

export type AccountEditFormData = z.infer<ReturnType<typeof getAccountEditSchema>>;
