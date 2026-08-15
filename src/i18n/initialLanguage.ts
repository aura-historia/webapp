import { DEFAULT_LANGUAGE } from "@/i18n/languages.ts";
import { isSupportedLanguage } from "@/i18n/routing.ts";

export function resolveInitialLanguage(htmlLanguage: string | undefined): string {
    const language = htmlLanguage?.split("-")[0]?.toLowerCase();
    return isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE;
}

export function getInitialLanguage(): string {
    const htmlLanguage =
        typeof document === "undefined" ? undefined : document.documentElement.lang;

    return resolveInitialLanguage(htmlLanguage);
}
