import { isSupportedLanguage } from "@/i18n/routing.ts";

export const LANGUAGE_PREFERENCE_COOKIE_NAME = "aura-language";
export const LANGUAGE_PREFERENCE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function serializeLanguagePreferenceCookie(
    language: string,
    secure: boolean,
): string | undefined {
    if (!isSupportedLanguage(language)) return undefined;

    const secureAttribute = secure ? "; Secure" : "";
    return `${LANGUAGE_PREFERENCE_COOKIE_NAME}=${language}; Path=/; Max-Age=${LANGUAGE_PREFERENCE_MAX_AGE_SECONDS}; SameSite=Lax${secureAttribute}`;
}

export function persistLanguagePreference(language: string): void {
    const cookie = serializeLanguagePreferenceCookie(
        language,
        typeof location !== "undefined" && location.protocol === "https:",
    );

    if (!cookie || typeof document === "undefined") return;

    // biome-ignore lint/suspicious/noDocumentCookie: This first-party preference is set by an explicit user action.
    document.cookie = cookie;
}
