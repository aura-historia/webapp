import { z } from "zod";
import type { TFunction } from "i18next";
import { LANGUAGES } from "@/data/internal/common/Language.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { UNIT_SYSTEMS } from "@/data/internal/common/UnitSystem.ts";

function createNameSchema(t: TFunction) {
    return z
        .string()
        .trim()
        .min(2, t("validation.name.minLength", { min: 2 }))
        .max(64, t("validation.name.maxLength", { max: 64 }))
        .regex(/^[a-zA-ZäöüÄÖÜß\s\-']+$/, t("validation.name.invalidChars"));
}

export function getAccountEditSchema(t: TFunction) {
    const nameSchema = createNameSchema(t);

    return z.object({
        firstName: nameSchema.or(z.string().max(0)),
        lastName: nameSchema.or(z.string().max(0)),
        language: z.enum(LANGUAGES).optional(),
        currency: z.enum(CURRENCIES).optional(),
        unitSystem: z.enum(UNIT_SYSTEMS).optional(),
        prohibitedContentConsent: z.boolean(),
    });
}

export type AccountEditFormData = z.infer<ReturnType<typeof getAccountEditSchema>>;
