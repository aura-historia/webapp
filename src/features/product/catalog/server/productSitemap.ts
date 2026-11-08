import type {
    PersonalizedProductListingSummaryData,
    ProductListingSearchResultData,
} from "@/client";
import { mapListingImages } from "@/data/internal/product/ProductListingDomain.ts";
import { env } from "@/env.ts";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { getApiBaseUrl } from "@/lib/apiBaseUrl.ts";
import { getProductListingPath } from "@/features/product/catalog/lib/productListingUrl.ts";

export const PRODUCT_SITEMAP_PATH = "/sitemaps/products.xml";

/**
 * How many of the most recently updated listings the sitemap names. A fixed number, so building it
 * costs the same few search requests however large the catalogue grows. Full coverage needs a
 * backend sitemap feed; older listings are found through links meanwhile.
 */
export const PRODUCT_SITEMAP_LISTING_LIMIT = 1_000;
/** The search endpoint's largest page. */
const SEARCH_PAGE_SIZE = 100;
/** How long the edge keeps a built sitemap; crawlers revalidate after an hour. */
export const PRODUCT_SITEMAP_EDGE_TTL_SECONDS = 6 * 60 * 60;
const CLIENT_CACHE_CONTROL = "public, max-age=3600";
const SEARCH_TIMEOUT_MS = 10_000;

export type ProductSitemapEntry = {
    readonly slug: string;
    readonly updated: Date;
    readonly imageUrl?: string;
};

/**
 * One sitemap entry per listing with a public page. Listings whose content needs consent stay out:
 * the sitemap promotes pages, and those are shown only to viewers who opt in. The image is the
 * first one cleared for public display.
 */
export function toProductSitemapEntry(
    summary: PersonalizedProductListingSummaryData,
): ProductSitemapEntry | undefined {
    const { item } = summary;
    if (!item.productListingTitleSlugId || item.contentPolicy?.decision !== "ALLOWED") {
        return undefined;
    }

    const updated = new Date(item.updated);
    if (Number.isNaN(updated.getTime())) return undefined;

    const image = mapListingImages(item.images, item.contentPolicy).find(
        (candidate) => candidate.prohibitedContentType === "NONE" && candidate.url,
    );
    return { slug: item.productListingTitleSlugId, updated, imageUrl: image?.url?.href };
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * The sitemap XML: each listing in every supported language, as the page URLs that answer without
 * a redirect. Language alternates are left to each page's hreflang links, which keeps the file
 * small.
 */
export function buildProductSitemapXml(
    entries: readonly ProductSitemapEntry[],
    siteUrl: string,
): string {
    const origin = siteUrl.replace(/\/$/, "");
    const urls = entries.flatMap(({ slug, updated, imageUrl }) => {
        const path = getProductListingPath(slug);
        const lastmod = updated.toISOString();
        const image = imageUrl
            ? `<image:image><image:loc>${escapeXml(imageUrl)}</image:loc></image:image>`
            : "";
        return SUPPORTED_LANGUAGES.map(
            ({ code }) =>
                `<url><loc>${escapeXml(`${origin}/${code}${path}`)}</loc><lastmod>${lastmod}</lastmod>${image}</url>`,
        );
    });

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        ...urls,
        "</urlset>",
        "",
    ].join("\n");
}

function searchUrl(searchAfter: string | undefined): URL {
    const url = new URL("/v1/product-listings", getApiBaseUrl(env.VITE_API_URL));
    url.searchParams.set("sort", "updated");
    url.searchParams.set("order", "desc");
    url.searchParams.set("size", String(SEARCH_PAGE_SIZE));
    if (searchAfter) url.searchParams.set("searchAfter", searchAfter);
    return url;
}

/**
 * The most recently updated listings, page by page through the public search. Anonymous requests
 * only: no cookie or `Authorization` header is sent, so no viewer state can reach the file.
 */
export async function fetchRecentProductSitemapEntries(
    limit: number = PRODUCT_SITEMAP_LISTING_LIMIT,
    fetchImpl: typeof fetch = fetch,
): Promise<ProductSitemapEntry[]> {
    const entries: ProductSitemapEntry[] = [];
    let searchAfter: string | undefined;
    let fetched = 0;

    while (fetched < limit) {
        const response = await fetchImpl(searchUrl(searchAfter), {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
        });
        if (!response.ok) {
            void response.body?.cancel();
            throw new Error(`Product search answered ${response.status}`);
        }

        const page = (await response.json()) as ProductListingSearchResultData;
        for (const summary of page.items.slice(0, limit - fetched)) {
            const entry = toProductSitemapEntry(summary);
            if (entry) entries.push(entry);
        }
        fetched += page.items.length;

        if (!page.searchAfter || page.items.length < SEARCH_PAGE_SIZE) break;
        searchAfter = JSON.stringify(page.searchAfter);
    }

    return entries;
}

/** The Workers Cache API's default cache; absent outside workerd, such as in unit tests. */
function getEdgeCache(): Cache | undefined {
    const cacheStorage = (globalThis as { caches?: { default?: Cache } }).caches;
    return cacheStorage?.default;
}

function sitemapHeaders(): Headers {
    return new Headers({
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": CLIENT_CACHE_CONTROL,
        "X-Content-Type-Options": "nosniff",
    });
}

function unavailable(): Response {
    return new Response("The product sitemap is temporarily unavailable.\n", {
        status: 503,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
            "Retry-After": "3600",
        },
    });
}

async function buildResponse(requestUrl: URL): Promise<Response> {
    const cache = getEdgeCache();
    const cacheKey = new Request(new URL(PRODUCT_SITEMAP_PATH, requestUrl.origin));
    if (cache) {
        try {
            const cached = await cache.match(cacheKey);
            if (cached) {
                return new Response(cached.body, { status: 200, headers: sitemapHeaders() });
            }
        } catch {
            // Build it fresh instead.
        }
    }

    let xml: string;
    try {
        xml = buildProductSitemapXml(await fetchRecentProductSitemapEntries(), env.VITE_APP_URL);
    } catch {
        return unavailable();
    }

    if (cache) {
        const stored = sitemapHeaders();
        stored.set("Cache-Control", `public, max-age=${PRODUCT_SITEMAP_EDGE_TTL_SECONDS}`);
        try {
            await cache.put(cacheKey, new Response(xml, { status: 200, headers: stored }));
        } catch {
            // The edge copy is an optimisation; the crawler still gets the sitemap.
        }
    }
    return new Response(xml, { status: 200, headers: sitemapHeaders() });
}

/**
 * Answers `/sitemaps/products.xml`, or returns `undefined` for any other path. Runs before
 * TanStack Start, so the path is never locale-redirected or rendered as HTML.
 */
export async function serveProductSitemapRequest(request: Request): Promise<Response | undefined> {
    const requestUrl = new URL(request.url);
    if (requestUrl.pathname !== PRODUCT_SITEMAP_PATH) return undefined;

    if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    const response = await buildResponse(requestUrl);
    if (request.method === "HEAD") {
        void response.body?.cancel();
        return new Response(null, { status: response.status, headers: response.headers });
    }
    return response;
}
