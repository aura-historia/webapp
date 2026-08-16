import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { env } from "@/env.ts";
import { localizePathname } from "@/i18n/routing.ts";

export type HreflangLink = {
    rel: "alternate";
    hrefLang: string;
    href: string;
};

/**
 * Generates `<link rel="alternate" hreflang="…">` entries for every supported
 * language plus an `x-default` fallback.
 *
 * Each language variant uses a stable language path prefix.
 *
 * Inject the returned array into a TanStack Router route's `head()` `links`
 * field so that search-engine crawlers can discover every language version.
 *
 * @param path - Absolute path of the page (e.g. `/`, `/search`, `/categories/123`).
 *               Must start with `/`.
 */
export function generateHreflangLinks(path: string): HreflangLink[] {
    const baseUrl = (env.VITE_APP_URL ?? "https://aura-historia.com").replace(/\/$/, "");

    const languageLinks: HreflangLink[] = SUPPORTED_LANGUAGES.map(({ code }) => ({
        rel: "alternate" as const,
        hrefLang: code,
        href: `${baseUrl}${localizePathname(path, code)}`,
    }));

    return [
        ...languageLinks,
        // x-default signals the "catch-all / no preference" URL; point it at
        // the default language version so bots have a clear fallback.
        {
            rel: "alternate" as const,
            hrefLang: "x-default",
            href: `${baseUrl}${localizePathname(path, DEFAULT_LANGUAGE)}`,
        },
    ];
}
