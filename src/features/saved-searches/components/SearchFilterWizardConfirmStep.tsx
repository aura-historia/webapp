import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { SearchFilterSummary } from "@/features/saved-searches/components/SearchFilterSummary.tsx";

type Props = {
    readonly name: string;
    readonly filters: SearchFilterArguments;
};

export function SearchFilterWizardConfirmStep({ name, filters }: Props) {
    const { t } = useTranslation();
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
                shopType={formValues.shopType}
                productState={formValues.productState}
            />
        </div>
    );
}
