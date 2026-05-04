import i18n from "@/i18n/i18n.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { generateHreflangLinks } from "@/lib/seo/hreflangLinks.ts";

type HeadMeta = {
    meta: Array<
        | { title: string }
        | { name: string; content: string }
        | { property: string; content: string }
        | { charSet: string }
    >;
    links?: Array<{ rel: string; href: string; hreflang?: string }>;
    scripts?: Array<{ type: string; children: string }>;
};

type PageMetaKey =
    | "home"
    | "search"
    | "searchShops"
    | "login"
    | "imprint"
    | "privacy"
    | "terms"
    | "account"
    | "watchlist"
    | "notifications"
    | "consentSettings"
    | "categories"
    | "periods"
    | "collections";

const PAGE_META_KEYS: Record<PageMetaKey, { title: string; description?: string }> = {
    home: {
        title: "meta.home.title",
        description: "meta.home.description",
    },
    search: {
        title: "meta.search.title",
        description: "meta.search.description",
    },
    searchShops: {
        title: "meta.searchShops.title",
        description: "meta.searchShops.description",
    },
    login: {
        title: "meta.login.title",
        description: "meta.login.description",
    },
    imprint: {
        title: "meta.imprint.title",
        description: "meta.imprint.description",
    },
    privacy: {
        title: "meta.privacy.title",
        description: "meta.privacy.description",
    },
    terms: {
        title: "meta.terms.title",
        description: "meta.terms.description",
    },
    account: {
        title: "meta.account.title",
    },
    watchlist: {
        title: "meta.watchlist.title",
    },
    notifications: {
        title: "meta.notifications.title",
    },
    consentSettings: {
        title: "meta.consentSettings.title",
        description: "meta.consentSettings.description",
    },
    categories: {
        title: "meta.categories.title",
        description: "meta.categories.description",
    },
    periods: {
        title: "meta.periods.title",
        description: "meta.periods.description",
    },
    collections: {
        title: "meta.collections.title",
        description: "meta.collections.description",
    },
};

type PageMetaOptions = {
    /** The translation key for the page (e.g., "home", "search", "login") */
    pageKey: PageMetaKey;
    /** The canonical URL for the page */
    url?: string;
    /** Optional image URL for Open Graph/Twitter cards */
    image?: string;
    /** The Open Graph type (defaults to "website") */
    type?: string;
    /** Whether to add noindex, nofollow meta tag */
    noIndex?: boolean;
};

/**
 * Generates standard head metadata for a page including Open Graph and Twitter Card tags.
 * Uses i18n translations for title and description.
 */
export function generatePageHeadMeta(options: PageMetaOptions): HeadMeta {
    const { pageKey, url, image = BANNER_IMAGE_URL, type = "website", noIndex = false } = options;

    const keys = PAGE_META_KEYS[pageKey];
    const title = i18n.t(keys.title);
    const description = keys.description ? i18n.t(keys.description) : undefined;

    const meta: HeadMeta["meta"] = [
        { title },
        ...(noIndex ? [{ name: "robots" as const, content: "noindex, nofollow" }] : []),
        ...(description ? [{ name: "description" as const, content: description }] : []),
        // Open Graph tags
        { property: "og:title" as const, content: title },
        ...(description ? [{ property: "og:description" as const, content: description }] : []),
        { property: "og:type" as const, content: type },
        ...(url ? [{ property: "og:url" as const, content: url }] : []),
        ...(image ? [{ property: "og:image" as const, content: image }] : []),
        // Twitter Card tags
        { name: "twitter:card" as const, content: image ? "summary_large_image" : "summary" },
        { name: "twitter:title" as const, content: title },
        ...(description ? [{ name: "twitter:description" as const, content: description }] : []),
        ...(url ? [{ name: "twitter:url" as const, content: url }] : []),
        ...(image ? [{ name: "twitter:image" as const, content: image }] : []),
    ];

    // Build links array: canonical + hreflang alternates for indexable pages
    const links: HeadMeta["links"] = url
        ? [
              { rel: "canonical", href: url },
              // Only emit hreflang on pages that are actually indexed.
              // noIndex pages (imprint, privacy, …) are already excluded via robots.txt.
              ...(noIndex ? [] : generateHreflangLinks(new URL(url).pathname)),
          ]
        : [];

    return { meta, links };
}
