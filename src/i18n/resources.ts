import translationDE from "@/i18n/locales/de/translation.json";
import translationEN from "@/i18n/locales/en/translation.json";
import translationES from "@/i18n/locales/es/translation.json";
import translationFR from "@/i18n/locales/fr/translation.json";

export const resources = {
    de: {
        translation: translationDE,
    },
    en: {
        translation: translationEN,
    },
    es: {
        translation: translationES,
    },
    fr: {
        translation: translationFR,
    },
} as const;
