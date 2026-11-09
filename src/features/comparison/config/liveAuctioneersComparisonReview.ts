/**
 * The day the LiveAuctioneers comparison's claims were last checked against the public pages of
 * LiveAuctioneers, The Saleroom and Lot-tissimo and against Auction Technology Group's annual
 * report for the year ended 30 September 2025 listed in `liveAuctioneersComparison.ts` (ISO
 * `YYYY-MM-DD`).
 *
 * Shown as "Last reviewed" and emitted as the Article `dateModified`. It lives in its own file so
 * unrelated copy edits never bump it: change it only after re-checking the claims. Never derive
 * it from the clock or the build, which would claim a fresh review on every deploy.
 */
export const LIVE_AUCTIONEERS_COMPARISON_LAST_REVIEWED = "2026-11-09";
