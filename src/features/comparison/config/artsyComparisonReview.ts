/**
 * The day the Artsy comparison's claims were last checked against Artsy's public pages (homepage,
 * About page, App Store listing, help center, `llms.txt`) and the Artsy and Artnet announcement of
 * 15 April 2026 listed in `artsyComparison.ts` (ISO `YYYY-MM-DD`).
 *
 * Shown as "Last reviewed" and emitted as the Article `dateModified`. It lives in its own file so
 * unrelated copy edits never bump it: change it only after re-checking the claims. Never derive
 * it from the clock or the build, which would claim a fresh review on every deploy.
 */
export const ARTSY_COMPARISON_LAST_REVIEWED = "2026-11-08";
