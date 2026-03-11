import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/i18n/languages";
import { env } from "@/env";

export type HreflangLink = {
    rel: "alternate";
    hreflang: string;
    href: string;
};

/**
 * Generates `<link rel="alternate" hreflang="…">` entries for every supported
 * language plus an `x-default` fallback.
 *
 * Each language variant is addressed via the `?lng=<code>` query parameter,
 * which is already supported by the client-side i18next detector
 * (`lookupQuerystring: "lng"`) and by the SSR `getLocale` server function.
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
        hreflang: code,
        href: `${baseUrl}${path}?lng=${code}`,
    }));

    return [
        ...languageLinks,
        // x-default signals the "catch-all / no preference" URL; point it at
        // the default language version so bots have a clear fallback.
        {
            rel: "alternate" as const,
            hreflang: "x-default",
            href: `${baseUrl}${path}?lng=${DEFAULT_LANGUAGE}`,
        },
    ];
}
