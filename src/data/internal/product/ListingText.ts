import type { ListingTextData } from "@/client";
import type { Language } from "@/data/internal/common/Language.ts";

/**
 * The text to show for a listing title or description: the backend's `localized` choice, which
 * already falls back from the requested language to `en`, `de` and then any other language.
 */
export function mapListingDisplayText(
    data: ListingTextData | null | undefined,
): string | undefined {
    return data?.localized.text;
}

/**
 * The localized text only when the backend found it in `language`. A fallback into another
 * language stays absent, for texts that should not appear in a language other than the page's.
 */
export function mapListingTextInLanguage(
    data: ListingTextData | null | undefined,
    language: Language,
): string | undefined {
    const localized = data?.localized;
    return localized?.language === language ? localized.text : undefined;
}
