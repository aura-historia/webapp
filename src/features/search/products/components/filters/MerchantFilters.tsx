import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { FILTER_DEFAULTS } from "@/features/search/products/lib/filterDefaults.ts";
import { MerchantIncludeFilter } from "@/features/search/products/components/filters/MerchantIncludeFilter.tsx";
import { MerchantExcludeFilter } from "@/features/search/products/components/filters/MerchantExcludeFilter.tsx";
import { FilterCard } from "@/features/search/common/components/filters/FilterCard.tsx";

type Props = {
    readonly disabled?: boolean;
};

export function MerchantFilters({ disabled = false }: Props) {
    const { t } = useTranslation();
    const { setValue } = useFormContext<FilterSchema>();

    const handleReset = () => {
        setValue("merchant", FILTER_DEFAULTS.merchant);
        setValue("excludeMerchant", FILTER_DEFAULTS.excludeMerchant);
    };

    return (
        <FilterCard
            title={t("search.filter.merchants")}
            resetTooltip={t("search.filter.resetTooltip.merchants")}
            onReset={handleReset}
            disabled={disabled}
        >
            <div className="flex flex-col gap-4">
                <MerchantIncludeFilter />
                <MerchantExcludeFilter />
            </div>
        </FilterCard>
    );
}
