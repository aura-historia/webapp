import i18n from "@/i18n/i18n.ts";

type HeadMeta = {
    meta: Array<
        | { title: string }
        | { name: string; content: string }
        | { property: string; content: string }
        | { charSet: string }
    >;
    links?: Array<{ rel: string; href: string }>;
    scripts?: Array<{ type: string; children: string }>;
};

type PageMetaKey = "home" | "search" | "login" | "imprint" | "privacy" | "account" | "watchlist";

const PAGE_META_KEYS: Record<PageMetaKey, { title: string; description?: string }> = {
    home: {
        title: "meta.home.title",
        description: "meta.home.description",
    },
    search: {
        title: "meta.search.title",
        description: "meta.search.description",
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
    account: {
        title: "meta.account.title",
    },
    watchlist: {
        title: "meta.watchlist.title",
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
    const { pageKey, url, image, type = "website", noIndex = false } = options;

    const keys = PAGE_META_KEYS[pageKey];
    const title = i18n.t(keys.title);
    const description = keys.description ? i18n.t(keys.description) : undefined;

    const meta: HeadMeta["meta"] = [
        {
            title,
        },
    ];

    if (noIndex) {
        meta.push({
            name: "robots",
            content: "noindex, nofollow",
        });
    }

    if (description) {
        meta.push({
            name: "description",
            content: description,
        });
    }

    // Open Graph tags
    meta.push({
        property: "og:title",
        content: title,
    });

    if (description) {
        meta.push({
            property: "og:description",
            content: description,
        });
    }

    meta.push({
        property: "og:type",
        content: type,
    });

    if (url) {
        meta.push({
            property: "og:url",
            content: url,
        });
    }

    if (image) {
        meta.push({
            property: "og:image",
            content: image,
        });
    }

    // Twitter Card tags
    meta.push({
        name: "twitter:card",
        content: image ? "summary_large_image" : "summary",
    });

    meta.push({
        name: "twitter:title",
        content: title,
    });

    if (description) {
        meta.push({
            name: "twitter:description",
            content: description,
        });
    }

    if (url) {
        meta.push({
            name: "twitter:url",
            content: url,
        });
    }

    if (image) {
        meta.push({
            name: "twitter:image",
            content: image,
        });
    }

    // Build links array with canonical URL if provided
    const links: HeadMeta["links"] = url ? [{ rel: "canonical", href: url }] : [];

    return { meta, links };
}
