import { createServerFn } from "@tanstack/react-start";
import acceptLanguage from "accept-language";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { getRequestHeaders, getCookie } from "@tanstack/react-start/server";

export const getLocale = createServerFn({ method: "GET" }).handler(async () => {
    const supportedLanguageCodes = SUPPORTED_LANGUAGES.map((lang) => lang.code);

    // First check for language preference cookie
    const langPrefCookie = getCookie("i18next");
    if (langPrefCookie && supportedLanguageCodes.includes(langPrefCookie)) {
        return langPrefCookie;
    }

    // Fallback to accept-language parsing if header is present
    const headers = getRequestHeaders();
    const acceptLangHeader = headers.get("accept-language");

    acceptLanguage.languages(supportedLanguageCodes);
    const bestMatch = acceptLanguage.get(acceptLangHeader);

    return bestMatch || DEFAULT_LANGUAGE;
});
