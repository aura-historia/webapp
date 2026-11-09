/**
 * The day the 1stDibs comparison's claims were last checked against 1stDibs' public pages (seller
 * application page, About page, Auction Terms, investor releases of 2022) and its annual report
 * for 2025 (Form 10-K, filed 27 February 2026) listed in `firstDibsComparison.ts` (ISO
 * `YYYY-MM-DD`).
 *
 * Shown as "Last reviewed" and emitted as the Article `dateModified`. It lives in its own file so
 * unrelated copy edits never bump it: change it only after re-checking the claims. Never derive
 * it from the clock or the build, which would claim a fresh review on every deploy.
 */
export const FIRST_DIBS_COMPARISON_LAST_REVIEWED = "2026-11-08";
