import type { SearchSchemaInput } from "@tanstack/react-router";

/**
 * URL state of the content notice form: the public slug of the listing or provider the notice is
 * about. Only these public slugs ever go into the URL, never anything the person types.
 */
export type ContentNoticeSearch = {
    readonly listing?: string;
    readonly provider?: string;
};

export type RawContentNoticeSearch = {
    listing?: unknown;
    provider?: unknown;
} & SearchSchemaInput;

const SLUG_PATTERN = /^[A-Za-z0-9_-]{1,300}$/;

function parseSlug(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const slug = value.trim();
    return SLUG_PATTERN.test(slug) ? slug : undefined;
}

/** Keeps one well-formed target slug; a listing wins when both are present. */
export function validateContentNoticeSearch(search: RawContentNoticeSearch): ContentNoticeSearch {
    const listing = parseSlug(search.listing);
    if (listing) return { listing };
    const provider = parseSlug(search.provider);
    return provider ? { provider } : {};
}

export function contentNoticeSearchForListing(
    productListingTitleSlugId: string,
): ContentNoticeSearch {
    return { listing: productListingTitleSlugId };
}

export function contentNoticeSearchForProvider(shopSlugId: string): ContentNoticeSearch {
    return { provider: shopSlugId };
}
