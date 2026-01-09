import { z } from "zod";
import type { TFunction } from "i18next";

type NameFormData = {
    firstName?: string;
    lastName?: string;
};

export function validateCognitoNameFields(formData: NameFormData, t: TFunction) {
    const nameSchema = z
        .string()
        .trim()
        .min(2, t("validation.name.minLength", { min: 2 }))
        .max(64, t("validation.name.maxLength", { max: 64 }))
        .regex(/^[a-zA-ZäöüÄÖÜß\s\-']+$/, t("validation.name.invalidChars"));

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

// TODO: Create a separate validation method for account edit forms. Normal forms require a different format than Cognito! Reuse the same Zod schema, just change the return format.
