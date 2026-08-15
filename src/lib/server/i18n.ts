import { createServerFn } from "@tanstack/react-start";
import acceptLanguage from "accept-language";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { getCookie, getRequestHeaders } from "@tanstack/react-start/server";
import { isSupportedLanguage } from "@/i18n/routing.ts";
import { LANGUAGE_PREFERENCE_COOKIE_NAME } from "@/i18n/languagePreference.ts";

export const getPreferredLocale = createServerFn({ method: "GET" }).handler(async () => {
    const supportedLanguageCodes = SUPPORTED_LANGUAGES.map((lang) => lang.code);
    const savedLanguage = getCookie(LANGUAGE_PREFERENCE_COOKIE_NAME);

    if (isSupportedLanguage(savedLanguage)) {
        return savedLanguage;
    }

    const headers = getRequestHeaders();
    const acceptLangHeader = headers.get("accept-language");

    acceptLanguage.languages(supportedLanguageCodes);
    const bestMatch = acceptLanguage.get(acceptLangHeader);

    return bestMatch || DEFAULT_LANGUAGE;
});
