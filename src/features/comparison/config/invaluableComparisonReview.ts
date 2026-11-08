/**
 * The day the Invaluable comparison's claims were last checked against Invaluable's public pages
 * (homepage, "How to bid", help centre, terms of use) and the announcement of 1 October 2026 listed
 * in `invaluableComparison.ts` (ISO `YYYY-MM-DD`).
 *
 * Shown as "Last reviewed" and emitted as the Article `dateModified`. It lives in its own file so
 * unrelated copy edits never bump it: change it only after re-checking the claims. Never derive
 * it from the clock or the build, which would claim a fresh review on every deploy.
 */
export const INVALUABLE_COMPARISON_LAST_REVIEWED = "2026-11-08";
