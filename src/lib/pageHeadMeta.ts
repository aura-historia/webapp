type HeadMeta = {
    meta: Array<
        | { title: string }
        | { name: string; content: string }
        | { property: string; content: string }
        | { charSet: string }
    >;
    scripts?: Array<{ type: string; children: string }>;
};

type PageMetaOptions = {
    title: string;
    description?: string;
    url?: string;
    image?: string;
    type?: string;
    noIndex?: boolean;
};

/**
 * Generates standard head metadata for a page including Open Graph and Twitter Card tags.
 */
export function generatePageHeadMeta(options: PageMetaOptions): HeadMeta {
    const { title, description, url, image, type = "website", noIndex = false } = options;

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

    return { meta };
}
