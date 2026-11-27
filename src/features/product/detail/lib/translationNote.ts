import { isListingEnrichmentPending } from "@/data/internal/product/ListingEnrichment.ts";

/**
 * Why a listing's title is not in the page language (#1387): `processing` while batch translation
 * may still be running, `unavailable` once that window has passed and no translation came.
 */
export type TranslationNoteKind = "processing" | "unavailable";

type TranslationNoteInput = {
    /** Language of the shown title, as the backend reports it. */
    readonly titleLanguage?: string;
    readonly created: Date;
};

/**
 * The note to show under the title, or none when the title is in the page language. `checkedAt`
 * is the time the page's data was loaded (from the route loader, so server and client agree);
 * without it the listing's age is unknown and no processing claim is made.
 */
export function translationNoteKind(
    listing: TranslationNoteInput,
    pageLanguage: string,
    checkedAt: number | undefined,
): TranslationNoteKind | undefined {
    const titleLanguage = listing.titleLanguage?.toLowerCase();
    if (!titleLanguage || titleLanguage === pageLanguage.toLowerCase()) return undefined;
    return checkedAt !== undefined && isListingEnrichmentPending(listing.created, checkedAt)
        ? "processing"
        : "unavailable";
}

/**
 * The language's name in the page language ("German", "Deutsch", "allemand"), or its code when
 * the runtime has no name for it.
 */
export function formatLanguageName(code: string, displayLanguage: string): string {
    try {
        return new Intl.DisplayNames([displayLanguage], { type: "language" }).of(code) ?? code;
    } catch {
        return code;
    }
}
