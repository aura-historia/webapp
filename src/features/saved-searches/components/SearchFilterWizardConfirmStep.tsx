import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { SearchFilterSummary } from "@/features/saved-searches/components/SearchFilterSummary.tsx";
import { SearchResultCard } from "@/features/search/products/components/results/SearchResultCard.tsx";
import { SearchResultCardSkeleton } from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import {
    SearchFilterPreviewError,
    useSearchFilterPreviewProducts,
} from "@/features/saved-searches/api/useSearchFilterPreviewProducts.ts";
import { cn } from "@/lib/utils.ts";

type Props = {
    readonly name: string;
    readonly filters: SearchFilterArguments;
    readonly enhancedSearchDescription?: string;
    /** Jumps back to the step that sets a summary row. */
    readonly onChangeStep?: (step: number) => void;
};

const PREVIEW_GRID_CLASS = "grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4";
const PREVIEW_NOTE_CLASS =
    "rounded-panel bg-surface px-5 py-6 text-body-sm text-ink-secondary shadow-ring";

export function SearchFilterWizardConfirmStep({
    name,
    filters,
    enhancedSearchDescription,
    onChangeStep,
}: Props) {
    const { t } = useTranslation();
    const previewSearch = {
        ...filters,
        enhancedSearchDescription: enhancedSearchDescription || undefined,
    };
    const preview = useSearchFilterPreviewProducts(previewSearch, true);
    // Raw form values — reflect exactly what the user has checked (incl. "all selected"),
    // without waiting for SearchFilterFormProvider's debounce to sync them into `filters`.
    const formValues = useFormContext<FilterSchema>().watch();
    let previewContent: ReactNode;
    if (preview.isPending) {
        previewContent = (
            <div className={PREVIEW_GRID_CLASS} role="status" aria-busy="true">
                <SearchResultCardSkeleton />
                <SearchResultCardSkeleton />
            </div>
        );
    } else if (preview.error) {
        // Saving must never be blocked by a failed preview: a transient classifier outage gets
        // its own reassuring copy, a restricted field reuses the same message the save request
        // would show, and anything else falls back to the generic preview error.
        const message =
            preview.error instanceof SearchFilterPreviewError
                ? preview.error.code === "SEARCH_FILTER_TEMPORARILY_UNAVAILABLE"
                    ? t("searchFilters.preview.unavailable")
                    : preview.error.message
                : t("searchFilters.preview.error");
        previewContent = <output className={cn(PREVIEW_NOTE_CLASS, "block")}>{message}</output>;
    } else if (preview.data?.items.length) {
        previewContent = (
            <div className={PREVIEW_GRID_CLASS}>
                {preview.data.items.map((product) => (
                    <SearchResultCard key={product.productListingId} product={product} />
                ))}
            </div>
        );
    } else {
        previewContent = <p className={PREVIEW_NOTE_CLASS}>{t("searchFilters.preview.empty")}</p>;
    }
    const showMoreMayMatchHint =
        !preview.isPending &&
        !preview.error &&
        !!preview.data?.candidateLimitReached &&
        preview.data.items.length < 4;

    return (
        <div className="flex flex-col gap-7">
            <SearchFilterSummary
                name={name}
                search={filters}
                availability={formValues.availability}
                onChangeStep={onChangeStep}
            />
            <section aria-labelledby="saved-search-preview-heading" className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <h4
                        id="saved-search-preview-heading"
                        className="font-serif text-[22px] leading-[1.2] font-normal"
                    >
                        {t("searchFilters.preview.title")}
                    </h4>
                    <p className="text-meta text-ink-muted">
                        {t("searchFilters.preview.description")}
                    </p>
                </div>
                {previewContent}
                {showMoreMayMatchHint && (
                    <p className="text-meta text-ink-muted">
                        {t("searchFilters.preview.moreMayMatch")}
                    </p>
                )}
            </section>
        </div>
    );
}
