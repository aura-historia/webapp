import i18n from "@/i18n/i18n.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { generateHreflangLinks } from "@/lib/seo/hreflangLinks.ts";
import { localizeUrl } from "@/i18n/routing.ts";

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

export type PageMetaKey =
    | "home"
    | "about"
    | "search"
    | "searchShops"
    | "login"
    | "imprint"
    | "privacy"
    | "terms"
    | "account"
    | "watchlist"
    | "searchFilters"
    | "notifications"
    | "consentSettings"
    | "newsletterConfirm"
    | "partnerProgram"
    | "partnerCustomIntegration"
    | "partnerDashboard"
    | "partnerApplications"
    | "partnerAccessTokens"
    | "partnerListingSources"
    | "compareArtsy"
    | "compareBarnebys"
    | "admin";

const PAGE_META_KEYS: Record<PageMetaKey, { title: string; description?: string }> = {
    home: {
        title: "meta.home.title",
        description: "meta.home.description",
    },
    about: {
        title: "meta.about.title",
        description: "meta.about.description",
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
    searchFilters: {
        title: "meta.searchFilters.title",
    },
    notifications: {
        title: "meta.notifications.title",
    },
    consentSettings: {
        title: "meta.consentSettings.title",
        description: "meta.consentSettings.description",
    },
    newsletterConfirm: {
        title: "meta.newsletterConfirm.title",
    },
    partnerProgram: {
        title: "meta.partnerProgram.title",
        description: "meta.partnerProgram.description",
    },
    partnerCustomIntegration: {
        title: "meta.partnerCustomIntegration.title",
        description: "meta.partnerCustomIntegration.description",
    },
    partnerDashboard: {
        title: "meta.partnerDashboard.title",
    },
    partnerApplications: {
        title: "meta.partnerApplications.title",
    },
    partnerAccessTokens: {
        title: "meta.partnerAccessTokens.title",
    },
    partnerListingSources: {
        title: "meta.partnerListingSources.title",
    },
    compareArtsy: {
        title: "meta.compareArtsy.title",
        description: "meta.compareArtsy.description",
    },
    compareBarnebys: {
        title: "meta.compareBarnebys.title",
        description: "meta.compareBarnebys.description",
    },
    admin: {
        title: "meta.admin.title",
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
    /** Whether to add a noindex robots tag (`noindex, nofollow` unless `followLinks`) */
    noIndex?: boolean;
    /**
     * With `noIndex`, still let crawlers follow the page's links (`noindex, follow`). For pages that
     * should stay out of results but lead to pages that belong in them, such as search results.
     */
    followLinks?: boolean;
};

/** The robots tag for a page kept out of search results; none for an indexable page. */
function robotsMeta(noIndex: boolean, followLinks: boolean): HeadMeta["meta"] {
    if (!noIndex) return [];
    return [{ name: "robots", content: followLinks ? "noindex, follow" : "noindex, nofollow" }];
}

/**
 * Generates standard head metadata for a page including Open Graph and Twitter Card tags.
 * Uses i18n translations for title and description.
 */
export function generatePageHeadMeta(options: PageMetaOptions): HeadMeta {
    const {
        pageKey,
        url,
        image = BANNER_IMAGE_URL,
        type = "website",
        noIndex = false,
        followLinks = false,
    } = options;
    const localizedUrl = url ? localizeUrl(url, i18n.resolvedLanguage ?? i18n.language) : undefined;

    const keys = PAGE_META_KEYS[pageKey];
    const title = i18n.t(keys.title);
    const description = keys.description ? i18n.t(keys.description) : undefined;

    const meta: HeadMeta["meta"] = [
        { title },
        ...robotsMeta(noIndex, followLinks),
        ...(description ? [{ name: "description" as const, content: description }] : []),
        // Open Graph tags
        { property: "og:title" as const, content: title },
        ...(description ? [{ property: "og:description" as const, content: description }] : []),
        { property: "og:type" as const, content: type },
        ...(localizedUrl ? [{ property: "og:url" as const, content: localizedUrl }] : []),
        ...(image ? [{ property: "og:image" as const, content: image }] : []),
        // Twitter Card tags
        { name: "twitter:card" as const, content: image ? "summary_large_image" : "summary" },
        { name: "twitter:title" as const, content: title },
        ...(description ? [{ name: "twitter:description" as const, content: description }] : []),
        ...(localizedUrl ? [{ name: "twitter:url" as const, content: localizedUrl }] : []),
        ...(image ? [{ name: "twitter:image" as const, content: image }] : []),
    ];

    // Build links array: canonical + hreflang alternates for indexable pages
    const links: HeadMeta["links"] = localizedUrl
        ? [
              { rel: "canonical", href: localizedUrl },
              // Only emit hreflang on pages that are actually indexed.
              // noIndex pages (imprint, privacy, …) are also left out of the sitemap.
              ...(noIndex ? [] : generateHreflangLinks(new URL(localizedUrl).pathname)),
          ]
        : [];

    return { meta, links };
}
