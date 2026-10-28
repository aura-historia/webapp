// Imported by vite.config.ts, so keep imports relative and free of app runtime code.
import { SUPPORTED_LANGUAGES } from "../../i18n/languages.ts";

/**
 * Pages prerendered at build time for every supported language, without the language prefix.
 * `indexable: false` pages send `noindex` from their route head and stay out of the sitemap.
 * Dynamic source search and profile routes are intentionally excluded; see the public-source
 * discovery guidance before adding a static sitemap or prerender entry for them.
 */
export const STATIC_PAGES = [
    { path: "/", indexable: true },
    { path: "/about-us", indexable: true },
    { path: "/compare/barnebys", indexable: true },
    { path: "/imprint", indexable: false },
    { path: "/partner-program", indexable: true },
    { path: "/partner-program/custom-integration", indexable: true },
    { path: "/privacy", indexable: false },
    { path: "/terms-and-conditions", indexable: false },
] as const;

export const PRERENDER_PAGES = SUPPORTED_LANGUAGES.flatMap(({ code }) =>
    STATIC_PAGES.map(({ path, indexable }) => ({
        path: `/${code}${path}`,
        sitemap: { exclude: !indexable },
    })),
);
