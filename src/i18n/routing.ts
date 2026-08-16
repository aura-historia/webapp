import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";

const SUPPORTED_LANGUAGE_CODE_SET = new Set<string>(
    SUPPORTED_LANGUAGES.map((language) => language.code),
);

export function isSupportedLanguage(language: string | undefined): language is string {
    return language !== undefined && SUPPORTED_LANGUAGE_CODE_SET.has(language);
}

export function getLanguageFromPathname(pathname: string): string | undefined {
    const language = pathname.split("/")[1]?.toLowerCase();
    return isSupportedLanguage(language) ? language : undefined;
}

export function stripLanguageFromPathname(pathname: string): string {
    const language = getLanguageFromPathname(pathname);
    if (!language) return pathname;

    const strippedPathname = pathname.slice(language.length + 1);
    return strippedPathname === "" || strippedPathname === "/" ? "/" : strippedPathname;
}

export function localizePathname(pathname: string, language: string): string {
    const resolvedLanguage = isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE;
    const unlocalizedPathname = stripLanguageFromPathname(pathname);
    const normalizedPathname = unlocalizedPathname.startsWith("/")
        ? unlocalizedPathname
        : `/${unlocalizedPathname}`;

    return normalizedPathname === "/"
        ? `/${resolvedLanguage}`
        : `/${resolvedLanguage}${normalizedPathname}`;
}

export function localizeHref(href: string, language: string): string {
    const url = new URL(href, "https://aura-historia.invalid");
    url.pathname = localizePathname(url.pathname, language);
    return `${url.pathname}${url.search}${url.hash}`;
}

export function localizeUrl(url: string, language: string): string {
    const localizedUrl = new URL(url);
    localizedUrl.pathname = localizePathname(localizedUrl.pathname, language);
    return localizedUrl.toString();
}

export function isLocalizedAppPath(pathname: string): boolean {
    return !pathname.startsWith("/api/") && pathname !== "/api";
}
