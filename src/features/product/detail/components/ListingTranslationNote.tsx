import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    formatLanguageName,
    type TranslationNoteKind,
} from "@/features/product/detail/lib/translationNote.ts";

/**
 * One line of small print under a listing title that is not in the page language (#1387, board
 * "Listing · Translation still in progress"): still being processed, or no translation available.
 */
export function ListingTranslationNote({
    kind,
    titleLanguage,
}: {
    readonly kind: TranslationNoteKind;
    readonly titleLanguage: string;
}) {
    const { t, i18n } = useTranslation();
    const language = formatLanguageName(titleLanguage, i18n.language);

    return (
        <p
            data-testid="listing-translation-note"
            className="flex items-start gap-2 text-meta text-pretty text-ink-secondary"
        >
            <Languages
                aria-hidden="true"
                strokeWidth={1.7}
                className="mt-[3px] size-3.5 shrink-0 text-ink-muted"
            />
            <span>{t(`product.translationNote.${kind}`, { language })}</span>
        </p>
    );
}
