import { isHtmlResponse } from "@/lib/server/htmlResponse.ts";

/**
 * How automated systems may use the website's content, as a Content Signals value
 * (https://contentsignals.org, draft-romm-aipref-contentsignals): search engines and AI answers may
 * use it; AI training may not. Listing texts and images belong to the dealers and auction houses, so
 * the site cannot grant training rights on them.
 *
 * `public/robots.txt` declares it for every crawler, and every HTML page repeats it in a
 * `Content-Signal` header. Cloudflare AI Crawl Control enforces the training restriction. See
 * `docs/architecture-guidelines.md#content-signals`.
 */
export const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=no";

export const CONTENT_SIGNAL_HEADER = "Content-Signal";

/**
 * Repeats the site's content signals on HTML pages. Cloudflare's Markdown for Agents keeps an
 * origin `Content-Signal` header on the Markdown it converts a page to; without one it adds its own
 * default, which allows AI training. Other responses, and a page that already sets a value, are
 * left alone.
 */
export function applyContentSignalHeader(headers: Headers): Headers {
    if (isHtmlResponse(headers) && !headers.has(CONTENT_SIGNAL_HEADER)) {
        headers.set(CONTENT_SIGNAL_HEADER, CONTENT_SIGNAL);
    }
    return headers;
}
