/**
 * How automated systems may use the website's content, as a Content Signals value
 * (https://contentsignals.org, draft-romm-aipref-contentsignals): search engines and AI answers may
 * use it; AI training may not. Listing texts and images belong to the dealers and auction houses, so
 * the site cannot grant training rights on them.
 *
 * `public/robots.txt` declares it for every crawler. Cloudflare AI Crawl Control enforces the
 * training restriction. See `docs/architecture-guidelines.md#content-signals`.
 */
export const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=no";
