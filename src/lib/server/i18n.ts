import { createServerFn } from "@tanstack/react-start";
import acceptLanguage from "accept-language";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { getCookie, getRequestHeaders, getRequest } from "@tanstack/react-start/server";

export const getLocale = createServerFn({ method: "GET" }).handler(async () => {
    const supportedLanguageCodes = SUPPORTED_LANGUAGES.map((lang) => lang.code);

    // 1. Honour the ?lng= query parameter first.
    //    This is the mechanism used by hreflang URLs so that crawlers receive
    //    the correct language variant during SSR (e.g. /?lng=de → German HTML).
    const request = getRequest();
    if (request) {
        const lngParam = new URL(request.url).searchParams.get("lng");
        if (lngParam && supportedLanguageCodes.includes(lngParam)) {
            return lngParam;
        }
    }

    // 2. Check for persisted language preference cookie (set by the client).
    const langPrefCookie = getCookie("i18next");
    if (langPrefCookie && supportedLanguageCodes.includes(langPrefCookie)) {
        return langPrefCookie;
    }

    // 3. Fallback to the browser's Accept-Language header.
    const headers = getRequestHeaders();
    const acceptLangHeader = headers.get("accept-language");

    acceptLanguage.languages(supportedLanguageCodes);
    const bestMatch = acceptLanguage.get(acceptLangHeader);

    return bestMatch || DEFAULT_LANGUAGE;
});
