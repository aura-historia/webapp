import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { SearchFilterSummary } from "@/features/saved-searches/components/SearchFilterSummary.tsx";
import { ProductCard } from "@/features/product/catalog/components/cards/ProductCard.tsx";
import { ProductCardSkeleton } from "@/features/product/catalog/components/cards/ProductCardSkeleton.tsx";
import {
    canPreviewSavedSearch,
    useSearchFilterPreviewProducts,
} from "@/features/saved-searches/api/useSearchFilterPreviewProducts.ts";

type Props = {
    readonly name: string;
    readonly filters: SearchFilterArguments;
};

export function SearchFilterWizardConfirmStep({ name, filters }: Props) {
    const { t } = useTranslation();
    const preview = useSearchFilterPreviewProducts(filters, true);
    const previewable = canPreviewSavedSearch(filters);
    // Raw form values — reflect exactly what the user has checked (incl. "all selected"),
    // without waiting for SearchFilterFormProvider's debounce to sync them into `filters`.
    const formValues = useFormContext<FilterSchema>().watch();

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">{t("searchFilter.wizard.step.confirm")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("searchFilter.wizard.step.confirmDescription")}
                </p>
            </div>

            <SearchFilterSummary
                name={name}
                search={filters}
                availability={formValues.availability}
            />
            <section aria-labelledby="saved-search-preview-heading" className="space-y-3">
                <div className="space-y-1">
                    <h4 id="saved-search-preview-heading" className="font-semibold">
                        {t("searchFilters.preview.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        {t("searchFilters.preview.description")}
                    </p>
                </div>
                {!previewable ? (
                    <p className="text-sm text-muted-foreground">
                        {t("searchFilters.preview.unavailable")}
                    </p>
                ) : preview.isPending ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                    </div>
                ) : preview.error ? (
                    <p role="status" className="text-sm text-muted-foreground">
                        {t("searchFilters.preview.error")}
                    </p>
                ) : preview.data?.length ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {preview.data.map((product) => (
                            <ProductCard key={product.productListingId} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        {t("searchFilters.preview.empty")}
                    </p>
                )}
            </section>
        </div>
    );
}
