/**
 * The day the eBay comparison's claims were last checked against the eBay documents listed in
 * `ebayComparison.ts` (ISO `YYYY-MM-DD`).
 *
 * Shown as "Last reviewed" and emitted as the Article `dateModified`. It lives in its own file so
 * unrelated copy edits never bump it: change it only after re-checking the claims. Never derive
 * it from the clock or the build, which would claim a fresh review on every deploy.
 */
export const EBAY_COMPARISON_LAST_REVIEWED = "2026-11-09";
