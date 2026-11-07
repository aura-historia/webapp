/**
 * The day the Barnebys comparison's claims were last checked against Barnebys' public service,
 * mainly its 18:00 CEST alert window and its source coverage (ISO `YYYY-MM-DD`).
 *
 * Shown as "Last reviewed" and emitted as the Article `dateModified`. It lives in its own file so
 * unrelated copy edits never bump it: change it only after re-checking the claims. Never derive
 * it from the clock or the build, which would claim a fresh review on every deploy.
 */
export const BARNEBYS_COMPARISON_LAST_REVIEWED = "2026-11-07";
