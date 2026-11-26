/**
 * The day the Vinted comparison's claims were last checked against the Vinted document and the
 * Aura Historia sources listed in `vintedComparison.ts` (ISO `YYYY-MM-DD`).
 *
 * Shown as "Last reviewed" and emitted as the Article `dateModified`. It lives in its own file so
 * unrelated copy edits never bump it: change it only after re-checking the claims. Never derive
 * it from the clock or the build, which would claim a fresh review on every deploy.
 */
export const VINTED_COMPARISON_LAST_REVIEWED = "2026-11-26";
