import type { ListingTextData } from "@/client";

/**
 * The text to show for a listing title: the backend's `localized` choice, which already falls
 * back from the requested language to `en`, `de` and then any other language.
 */
export function mapListingDisplayText(
    data: ListingTextData | null | undefined,
): string | undefined {
    return data?.localized.text;
}

/**
 * Whether the shown text is a translation: the backend's `localized` choice is in another
 * language than the source's original. Unknown (no original on the response) counts as not
 * translated, so no translation is claimed without evidence.
 */
export function isListingTextTranslated(data: ListingTextData | null | undefined): boolean {
    const original = data?.original;
    return original != null && data?.localized.language !== original.language;
}
