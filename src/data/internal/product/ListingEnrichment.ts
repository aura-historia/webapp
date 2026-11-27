/**
 * Translation and embedding run in batches that mostly finish within an hour but can take up to
 * 24 hours after a listing is created. Until then a listing may show its original-language text.
 */
export const LISTING_ENRICHMENT_LAG_MS = 24 * 60 * 60 * 1000;

/** Whether a listing created at `created` may still be waiting for translation and embedding. */
export function isListingEnrichmentPending(created: Date, now: number): boolean {
    return now - created.getTime() < LISTING_ENRICHMENT_LAG_MS;
}
