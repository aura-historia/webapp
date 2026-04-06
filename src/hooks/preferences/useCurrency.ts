import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";
import { inferCurrencyFromLocale } from "@/data/internal/common/Currency.ts";
import { useTranslation } from "react-i18next";
import type { Currency } from "@/data/internal/common/Currency.ts";

export function useCurrency(): Currency {
    const { preferences } = useUserPreferences();
    const { i18n } = useTranslation();
    return preferences.currency ?? inferCurrencyFromLocale(i18n.language);
}
